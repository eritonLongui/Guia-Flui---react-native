import { flags } from '@/lib/flags';
import { supabase } from '@/lib/supabase';
import type { Usuario } from '@/types';
import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface AuthContextData {
  session: Session | null;
  usuario: Usuario | null;
  carregando: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (nome: string, email: string, password: string) => Promise<'session' | 'confirm_email'>;
  signOut: () => Promise<void>;
  recarregarUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({
  session: null,
  usuario: null,
  carregando: true,
  signIn: async () => {},
  signUp: async () => 'session',
  signOut: async () => {},
  recarregarUsuario: async () => {},
});

function usuarioDaSessao(session: Session | null): Usuario | null {
  const user = session?.user;
  if (!user) return null;

  const nome =
    (user.user_metadata?.nome as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split('@')[0] ||
    'Motorista';

  return {
    id: user.id,
    nome,
    email: user.email ?? '',
    reputacao: 0,
    criadoEm: user.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUsuario(usuarioDaSessao(data.session ?? null));
      setCarregando(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setUsuario(usuarioDaSessao(next));
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;

    let mounted = true;

    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted || !data) return;
        setUsuario({
          id: data.id as string,
          nome: data.nome as string,
          email: data.email as string,
          avatar: (data.avatar as string | null) ?? undefined,
          reputacao: Number(data.reputacao ?? 0),
          criadoEm: data.criado_em as string,
        });
      });

    return () => {
      mounted = false;
    };
  }, [session?.user.id]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw new Error(error.message);
  }, []);

  const signUp = useCallback(async (nome: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { nome: nome.trim() },
      },
    });
    if (error) throw new Error(error.message);
    if (data.session) return 'session';
    if (flags.requireEmailConfirmation) return 'confirm_email';
    throw new Error(
      'O Supabase ainda exige confirmação de email. Desative Confirm email no dashboard ou ligue EXPO_PUBLIC_REQUIRE_EMAIL_CONFIRMATION.',
    );
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }, []);

  const recarregarUsuario = useCallback(async () => {
    const { usuarioRepository } = await import('@/repositories');
    const atual = await usuarioRepository.obterAtual();
    if (atual) setUsuario(atual);
  }, []);

  const value = useMemo(
    () => ({ session, usuario, carregando, signIn, signUp, signOut, recarregarUsuario }),
    [session, usuario, carregando, signIn, signUp, signOut, recarregarUsuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
