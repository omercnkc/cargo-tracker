import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

import { Database } from '../../types/database.types';

// SecureStore has a 2048-byte limit per key. Large Supabase session tokens
// are split into chunks to avoid exceeding this limit.
const CHUNK_SIZE = 1800; // stay safely under the 2048-byte limit

async function setLargeItem(key: string, value: string): Promise<void> {
  if (value.length <= CHUNK_SIZE) {
    // Small enough to store directly — remove any stale chunks first
    await SecureStore.deleteItemAsync(`${key}.chunks`);
    await SecureStore.setItemAsync(key, value);
    return;
  }

  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) {
    chunks.push(value.slice(i, i + CHUNK_SIZE));
  }

  // Store chunk count, then each chunk
  await SecureStore.setItemAsync(`${key}.chunks`, String(chunks.length));
  await Promise.all(
    chunks.map((chunk, index) =>
      SecureStore.setItemAsync(`${key}.chunk.${index}`, chunk)
    )
  );
  // Remove the plain key to avoid stale data
  await SecureStore.deleteItemAsync(key);
}

async function getLargeItem(key: string): Promise<string | null> {
  const chunkCountStr = await SecureStore.getItemAsync(`${key}.chunks`);

  if (!chunkCountStr) {
    // No chunks — try direct key
    return SecureStore.getItemAsync(key);
  }

  const chunkCount = parseInt(chunkCountStr, 10);
  const chunks = await Promise.all(
    Array.from({ length: chunkCount }, (_, index) =>
      SecureStore.getItemAsync(`${key}.chunk.${index}`)
    )
  );

  if (chunks.some((c) => c === null)) return null;
  return chunks.join('');
}

async function removeLargeItem(key: string): Promise<void> {
  const chunkCountStr = await SecureStore.getItemAsync(`${key}.chunks`);

  if (chunkCountStr) {
    const chunkCount = parseInt(chunkCountStr, 10);
    await Promise.all([
      SecureStore.deleteItemAsync(`${key}.chunks`),
      ...Array.from({ length: chunkCount }, (_, index) =>
        SecureStore.deleteItemAsync(`${key}.chunk.${index}`)
      ),
    ]);
  }

  await SecureStore.deleteItemAsync(key);
}

const ExpoSecureStoreAdapter = {
  getItem: getLargeItem,
  setItem: setLargeItem,
  removeItem: removeLargeItem,
};

// Supabase URL and Anon Key should be stored in the .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key. Please check your .env file.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
