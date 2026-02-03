'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Tüm client component'ler için tek bir Supabase instance
// Cookie-based auth kullanır - middleware ile uyumlu
export const supabase = createClientComponentClient();
