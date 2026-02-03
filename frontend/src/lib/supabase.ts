'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Singleton instance - lazy initialization
let supabaseInstance: ReturnType<typeof createClientComponentClient> | null = null;

// Tüm client component'ler için tek bir Supabase instance
// Cookie-based auth kullanır - middleware ile uyumlu
export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient();
  }
  return supabaseInstance;
}

// Backwards compatible export using getter
// This defers initialization until the property is actually accessed at runtime
export const supabase = new Proxy({} as ReturnType<typeof createClientComponentClient>, {
  get(_, prop) {
    const client = getSupabase();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
