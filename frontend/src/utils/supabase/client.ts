'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Client tarafı için Supabase client
export function createClient() {
  return createClientComponentClient();
}
