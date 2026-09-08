import { Input } from '@/components/Input';
import { colors, spacing } from '@/constants/theme';
import type { SugestaoEndereco } from '@/lib/localizacao';
import { useLocalizacao } from '@/providers/LocalizacaoProvider';
import { MapPin, Navigation, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface LocalizacaoPickerContentProps {
  onDone: () => void;
  onClose?: () => void;
}

/** Conteúdo da troca de localização (sem Modal próprio — evita stack de modais no iOS). */
export function LocalizacaoPickerContent({ onDone, onClose }: LocalizacaoPickerContentProps) {
  const { definirManual, usarGps, buscar } = useLocalizacao();

  const [termo, setTermo] = useState('');
  const [sugestoes, setSugestoes] = useState<SugestaoEndereco[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setTermo('');
    setSugestoes([]);
  }, []);

  useEffect(() => {
    const query = termo.trim();
    if (query.length < 2) {
      setSugestoes([]);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const results = await buscar(query);
        if (active) setSugestoes(results);
      } finally {
        if (active) setBuscando(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [termo, buscar]);

  const concluir = async (acao: () => Promise<unknown>) => {
    setSalvando(true);
    try {
      await acao();
      onDone();
    } finally {
      setSalvando(false);
    }
  };

  const query = termo.trim();
  const mostrandoBusca = query.length >= 2;

  const searchField = (
    <Input
      icon
      placeholder="Buscar cidade ou endereço"
      accessibilityLabel="Buscar cidade ou endereço"
      value={termo}
      onChangeText={setTermo}
      autoCorrect={false}
      autoComplete="off"
      textContentType="none"
      autoFocus
      returnKeyType="search"
    />
  );

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>{searchField}</View>
        {onClose ? (
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            style={styles.headerButton}>
            <X aria-hidden={true} size={20} color={colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}>
        <Pressable
          style={styles.row}
          disabled={salvando}
          onPress={() => concluir(() => usarGps())}
          accessibilityRole="button"
          accessibilityLabel="Usar localização atual do GPS">
          <Navigation aria-hidden={true} size={18} color={colors.accent} />
          <Text style={styles.rowTitle}>Localização atual</Text>
        </Pressable>

        {buscando ? (
          <ActivityIndicator color={colors.textPrimary} style={{ marginTop: spacing.lg }} />
        ) : null}

        {sugestoes.map((item) => (
          <Pressable
            key={item.id}
            style={styles.row}
            disabled={salvando}
            onPress={() => concluir(() => definirManual(item.localizacao))}
            accessibilityRole="button"
            accessibilityLabel={`Usar ${item.titulo}`}>
            <MapPin aria-hidden={true} size={18} color={colors.textMuted} />
            <View style={styles.rowTexts}>
              <Text style={styles.rowTitle}>{item.titulo}</Text>
              {item.subtitulo ? (
                <Text style={styles.rowSub} numberOfLines={1}>
                  {item.subtitulo}
                </Text>
              ) : null}
            </View>
          </Pressable>
        ))}

        {!buscando && mostrandoBusca && sugestoes.length === 0 ? (
          <Text style={styles.empty}>Nenhum resultado encontrado.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

/** @deprecated use LocalizacaoPickerContent dentro do modal de filtros */
export function LocalizacaoPickerSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible) return null;
  return <LocalizacaoPickerContent onDone={onClose} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  searchWrap: {
    flex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowTexts: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    flexShrink: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
  empty: {
    marginTop: spacing.xl,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
