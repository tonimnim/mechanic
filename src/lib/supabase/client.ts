import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // During build time, env vars may not be available
    if (!supabaseUrl || !supabaseKey) {
        return null as unknown as ReturnType<typeof createBrowserClient>;
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseKey,
    );
};
