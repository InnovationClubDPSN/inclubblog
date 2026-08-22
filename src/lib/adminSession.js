import { supabase } from '@/lib/supabaseClient';

const KEY = 'ic_admin_session';

// Admins are verified purely by a PIN checked against
// public.admin_credentials via the admin_login() RPC -- there is no OAuth /
// Supabase Auth involved at all anymore (see
// supabase/schema.sql). The token below is a short-lived
// session token, not a JWT; it's sent back on every admin write.
export function getAdminToken() {
    try {
        return sessionStorage.getItem(KEY) || null;
    } catch {
        return null;
    }
}

export function isAdminLoggedIn() {
    return !!getAdminToken();
}

export async function loginAdmin(pin) {
    const val = String(pin || '').trim();
    if (!val) throw new Error('Enter the admin PIN');

    const { data, error } = await supabase.rpc('admin_login', { p_pin: val });
    if (error) throw new Error(error.message?.replace(/^.*?:\s*/, '') || 'Login failed');

    try {
        sessionStorage.setItem(KEY, data);
    } catch {
        /* ignore */
    }
    return data;
}

export async function logoutAdmin() {
    const token = getAdminToken();
    try {
        sessionStorage.removeItem(KEY);
    } catch {
        /* ignore */
    }
    if (token) {
        try {
            await supabase.rpc('admin_logout', { p_token: token });
        } catch {
            /* ignore -- session will just expire on its own */
        }
    }
}
