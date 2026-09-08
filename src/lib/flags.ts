/**
 * Feature flags públicas (EXPO_PUBLIC_*).
 * Valores entram no bundle; não coloque segredo aqui.
 *
 * A confirmação de email é imposta pelo Supabase (dashboard).
 * Esta flag só alinha o app com essa configuração.
 */
function envFlag(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name];
  if (raw == null || raw.trim() === '') return defaultValue;
  return raw === '1' || raw.toLowerCase() === 'true';
}

export const flags = {
  /**
   * `false` (padrão): cadastro entra na hora — o dashboard precisa estar com
   * Authentication → Providers → Email → Confirm email **desligado**.
   * `true`: o app espera o link de confirmação; ligue Confirm email no Supabase.
   */
  requireEmailConfirmation: envFlag('EXPO_PUBLIC_REQUIRE_EMAIL_CONFIRMATION', false),
};
