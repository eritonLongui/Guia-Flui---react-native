import Constants from 'expo-constants';

/** Chave Google Maps injetada via app.config.js → extra.googleMapsApiKey. */
export function getGoogleMapsApiKey(): string {
  const fromExtra = Constants.expoConfig?.extra?.googleMapsApiKey;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) return fromExtra;

  const fromEnv = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (typeof fromEnv === 'string' && fromEnv.length > 0) return fromEnv;

  return '';
}
