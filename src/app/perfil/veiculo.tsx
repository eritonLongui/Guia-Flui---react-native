import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SettingsScreen } from '@/components/SettingsScreen';
import { APP_NAME } from '@/constants/app';
import { colors, spacing } from '@/constants/theme';
import { CONECTORES_FILTRO } from '@/features/explorar/filtros';
import { anunciarMensagem } from '@/lib/a11y';
import { useAuth } from '@/providers/AuthProvider';
import { useVeiculoAtivo } from '@/providers/VeiculoAtivoProvider';
import { veiculoRepository } from '@/repositories';
import type { Veiculo } from '@/types';
import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function EditarVeiculoScreen() {
  const { usuario } = useAuth();
  const { veiculo, recarregar } = useVeiculoAtivo();

  const [marca, setMarca] = useState(veiculo?.marca ?? '');
  const [modelo, setModelo] = useState(veiculo?.modelo ?? '');
  const [ano, setAno] = useState(veiculo ? String(veiculo.ano) : '');
  const [autonomia, setAutonomia] = useState(veiculo ? String(veiculo.autonomiaKm) : '');
  const [potencia, setPotencia] = useState(
    veiculo ? String(veiculo.potenciaMaximaCarregamento) : '',
  );
  const [conectores, setConectores] = useState<string[]>(veiculo?.tiposConector ?? []);
  const [salvando, setSalvando] = useState(false);

  const usuarioId = usuario?.id ?? veiculo?.usuarioId ?? '';

  const rascunho = useMemo<Veiculo>(
    () => ({
      id: veiculo?.id ?? `veiculo-${Date.now()}`,
      usuarioId,
      marca,
      modelo,
      ano: Number(ano) || 0,
      capacidadeBateria: veiculo?.capacidadeBateria ?? 0,
      autonomiaKm: Number(autonomia) || 0,
      tiposConector: conectores,
      potenciaMaximaCarregamento: Number(potencia) || 0,
      ativo: true,
    }),
    [ano, autonomia, conectores, marca, modelo, potencia, usuarioId, veiculo],
  );

  const toggleConector = (tipo: string) => {
    setConectores((prev) =>
      prev.includes(tipo) ? prev.filter((item) => item !== tipo) : [...prev, tipo],
    );
  };

  const salvar = async () => {
    const avisar = (mensagem: string) => {
      anunciarMensagem(mensagem);
      Alert.alert(APP_NAME, mensagem);
    };

    if (!usuarioId) {
      avisar('Faça login para salvar o carro.');
      return;
    }
    if (!marca.trim() || !modelo.trim()) {
      avisar('Preencha marca e modelo.');
      return;
    }
    if (!rascunho.ano || !rascunho.autonomiaKm || !rascunho.potenciaMaximaCarregamento) {
      avisar('Preencha ano, autonomia e potência máxima.');
      return;
    }
    if (conectores.length === 0) {
      avisar('Selecione pelo menos um conector.');
      return;
    }

    setSalvando(true);
    try {
      await veiculoRepository.salvar({
        ...rascunho,
        marca: marca.trim(),
        modelo: modelo.trim(),
      });
      await recarregar();
      router.back();
    } catch (error) {
      avisar(error instanceof Error ? error.message : 'Não foi possível salvar o carro.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SettingsScreen
      title="Meu carro"
      footer={
        <Button
          label={salvando ? 'Salvando...' : 'Salvar'}
          disabled={salvando}
          onPress={salvar}
        />
      }>
      <Field label="Marca">
        <Input placeholder="BYD" accessibilityLabel="Marca" value={marca} onChangeText={setMarca} />
      </Field>
      <Field label="Modelo">
        <Input
          placeholder="Dolphin Mini"
          accessibilityLabel="Modelo"
          value={modelo}
          onChangeText={setModelo}
        />
      </Field>
      <Field label="Ano">
        <Input
          keyboardType="number-pad"
          placeholder="2024"
          accessibilityLabel="Ano"
          value={ano}
          onChangeText={setAno}
        />
      </Field>
      <Field label="Autonomia (km)">
        <Input
          keyboardType="number-pad"
          placeholder="280"
          accessibilityLabel="Autonomia em quilômetros"
          value={autonomia}
          onChangeText={setAutonomia}
        />
      </Field>
      <Field label="Potência máxima (kW)">
        <Input
          keyboardType="number-pad"
          placeholder="60"
          accessibilityLabel="Potência máxima em quilowatts"
          value={potencia}
          onChangeText={setPotencia}
        />
      </Field>
      <Text accessibilityRole="header" style={styles.label}>
        Conectores
      </Text>
      <View style={styles.chipsRow}>
        {CONECTORES_FILTRO.map((tipo) => {
          const ativo = conectores.includes(tipo);
          return (
            <Pressable
              key={tipo}
              onPress={() => toggleConector(tipo)}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={tipo}
              style={[styles.chip, ativo && styles.chipActive]}>
              <Text aria-hidden={true} style={[styles.chipText, ativo && styles.chipTextActive]}>
                {tipo}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SettingsScreen>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text aria-hidden={true} style={styles.label}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.elevated,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: colors.accentBorder,
    backgroundColor: 'rgba(49, 254, 80, 0.12)',
  },
  chipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.accent,
  },
});
