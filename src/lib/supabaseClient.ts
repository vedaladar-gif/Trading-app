import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? '';

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
    auth: {
        persistSession: false,
    },
});

/**
 * Returns a Supabase client that carries a specific user's access token.
 * This satisfies row-level security policies that check auth.uid() = id,
 * allowing server-side profile creation without a service role key.
 */
export function createAuthedClient(accessToken: string) {
    return createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: { persistSession: false },
    });
}

