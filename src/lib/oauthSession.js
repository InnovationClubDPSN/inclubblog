import { supabase } from '@/lib/supabaseClient';

// ----------------------------------------------------------------------------
// "Sign in with Google" / "Sign in with GitHub" for non-members (visitors
// who want to interact with things like the Question of the Day). This is
// real Supabase Auth, but it is entirely separate from:
//   - member login (admission_number + password -- src/lib/memberSession.js)
//   - admin login (PIN -- src/lib/adminSession.js)
// and it never creates or touches a row in `profiles`. It only ever creates
// a row in `public.users` (see supabase/schema.sql), via a
// database trigger on auth.users insert. Both providers must be turned on
// in the Supabase Dashboard (Authentication > Providers) before use.
// ----------------------------------------------------------------------------

export const OAUTH_PROVIDERS = ['google', 'github'];

export async function signInWithProvider(provider) {
    if (!OAUTH_PROVIDERS.includes(provider)) throw new Error(`Unsupported provider: ${provider}`);
    const redirectTo = window.location.origin + window.location.pathname;
    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
    });
    if (error) throw error;
}

export async function signInWithGoogle() {
    return signInWithProvider('google');
}

export async function signInWithGithub() {
    return signInWithProvider('github');
}

export async function signOutOAuthUser() {
    await supabase.auth.signOut();
}

// Returns the public.users row for the current Supabase Auth session, or
// null if nobody is signed in via OAuth. Safe to call on every page load --
// resolves quickly from the local session, no network round trip needed to
// know whether someone is signed in at all.
export async function getCurrentOAuthUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // maybeSingle (not single) so a not-yet-created row returns null cleanly
    // instead of PostgREST throwing a 406 -- e.g. right after a first-ever
    // sign-in, before the auth.users insert trigger has finished writing the
    // public.users row.
    const { data, error } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
    if (error) return null;
    return data;
}

// Call once after landing back from the OAuth redirect (or on any page load
// where a session is already present) to keep last_login fresh.
export async function touchOAuthLogin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    // supabase.rpc() returns a thenable, not a real Promise, so it has no
    // .catch() -- awaiting inside try/catch is the correct way to swallow
    // a failed call here.
    try {
        await supabase.rpc('oauth_touch_login');
    } catch {
        /* non-fatal -- last_login just won't update this time */
    }
}

export function onOAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });
    return () => data.subscription.unsubscribe();
}
