'use client';

import { deleteUser, setUserBlocked, setUserRole } from '@/app/actions/users';

export function UserActions({
  id,
  nome,
  role,
  blocked,
}: {
  id: string;
  nome: string;
  role: 'user' | 'admin';
  blocked: boolean;
}) {
  const isAdmin = role === 'admin';

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
      <form
        action={async () => {
          const nextRole = isAdmin ? 'user' : 'admin';
          const message = isAdmin
            ? `Tirar o acesso de administrador de ${nome}?`
            : `Tornar ${nome} administrador? A pessoa passa a acessar este painel.`;
          if (!window.confirm(message)) return;
          await setUserRole(id, nextRole);
        }}
      >
        <button type="submit" className="text-sm text-muted hover:text-foreground">
          {isAdmin ? 'Tirar admin' : 'Tornar admin'}
        </button>
      </form>

      {isAdmin ? null : (
        <form
          action={async () => {
            const message = blocked
              ? `Desbloquear ${nome}? A pessoa volta a poder entrar.`
              : `Bloquear ${nome}? A pessoa não consegue mais entrar.`;
            if (!window.confirm(message)) return;
            await setUserBlocked(id, !blocked);
          }}
        >
          <button type="submit" className="text-sm text-muted hover:text-danger">
            {blocked ? 'Desbloquear' : 'Bloquear'}
          </button>
        </form>
      )}

      {isAdmin ? null : (
        <form
          action={async () => {
            const confirmed = window.confirm(
              `Excluir ${nome}? A conta some de vez, junto com as avaliações desta pessoa.`,
            );
            if (!confirmed) return;
            await deleteUser(id);
          }}
        >
          <button type="submit" className="text-sm text-muted hover:text-danger">
            Excluir
          </button>
        </form>
      )}
    </div>
  );
}
