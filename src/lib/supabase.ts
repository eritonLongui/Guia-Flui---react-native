import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CHUNK_SIZE = 1800;

const memoryStore = new Map<string, string>();

const MemoryStorageAdapter: SupportedStorage = {
  async getItem(key: string) {
    return memoryStore.get(key) ?? null;
  },
  async setItem(key: string, value: string) {
    memoryStore.set(key, value);
  },
  async removeItem(key: string) {
    memoryStore.delete(key);
  },
};

const ExpoSecureStoreAdapter: SupportedStorage = {
  async getItem(key: string) {
    const chunks = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunks) {
      const count = Number(chunks);
      const parts: string[] = [];
      for (let i = 0; i < count; i += 1) {
        parts.push((await SecureStore.getItemAsync(`${key}_${i}`)) ?? '');
      }
      return parts.join('');
    }

    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string) {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    const count = Math.ceil(value.length / CHUNK_SIZE);
    await SecureStore.setItemAsync(`${key}_chunks`, String(count));
    for (let i = 0; i < count; i += 1) {
      await SecureStore.setItemAsync(
        `${key}_${i}`,
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
      );
    }
  },
  async removeItem(key: string) {
    const chunks = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunks) {
      const count = Number(chunks);
      await SecureStore.deleteItemAsync(`${key}_chunks`);
      for (let i = 0; i < count; i += 1) {
        await SecureStore.deleteItemAsync(`${key}_${i}`);
      }
    }

    await SecureStore.deleteItemAsync(key);
  },
};

function createAuthStorage(): SupportedStorage {
  if (typeof window === 'undefined') {
    return MemoryStorageAdapter;
  }
  if (Platform.OS === 'web') {
    return AsyncStorage;
  }
  return ExpoSecureStoreAdapter;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const canPersistSession = typeof window !== 'undefined' || Platform.OS !== 'web';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'public-anon-placeholder',
  {
    auth: {
      storage: createAuthStorage(),
      autoRefreshToken: canPersistSession,
      persistSession: canPersistSession,
      detectSessionInUrl: false,
    },
  },
);
