import { supabase } from '@/lib/supabaseClient';

const KEY = 'ic_member_session';

export function getCurrentMember() {
    try {
        const raw = sessionStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function isMemberLoggedIn() {
    return !!getCurrentMember();
}

function saveSession(session) {
    sessionStorage.setItem(KEY, JSON.stringify(session));
    return session;
}

// Members are verified purely by admission_number + password against
// public.member_credentials via the member_login() RPC -- there is no
// Supabase Auth / auth.users record involved for members at all (see
// supabase/schema.sql). A profile imported from a CSV has no
// password set yet; the first time that member "logs in" with a chosen
// password, member_login() sets it and returns a session token.
export async function loginMember(admissionNumber, password) {
    const val = String(admissionNumber || '').trim();
    if (!val) throw new Error('Enter your admission number');

    const { data, error } = await supabase.rpc('member_login', {
        p_admission_number: val,
        p_password: password || null,
    });
    if (error) throw new Error(error.message?.replace(/^.*?:\s*/, '') || 'Login failed');

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('No member found with that admission number');

    return saveSession({
        id: row.id,
        name: row.name,
        role: row.role,
        domain: row.domain,
        admission_number: row.admission_number,
        needsPassword: row.needs_password,
        token: row.token || null,
    });
}

// Called from the "first login" screen once the member picks a password.
// Re-runs member_login with the chosen password, which sets it server-side.
export async function setMemberPassword(newPassword) {
    const m = getCurrentMember();
    if (!m) throw new Error('Not logged in');
    return loginMember(m.admission_number, newPassword);
}

export async function updateMemberProfile(data) {
    const m = getCurrentMember();
    if (!m || !m.token) throw new Error('Not logged in');
    const { data: rows, error } = await supabase.rpc('member_update_profile', {
        p_token: m.token,
        p_patch: data,
    });
    if (error) throw new Error(error.message?.replace(/^.*?:\s*/, '') || 'Update failed');
    const updated = Array.isArray(rows) ? rows[0] : rows;
    return saveSession({ ...m, ...updated });
}

export async function saveMemberProject(project) {
    const m = getCurrentMember();
    if (!m || !m.token) throw new Error('Not logged in');
    const { data: rows, error } = await supabase.rpc('member_save_project', {
        p_token: m.token,
        p_project_id: project.id || null,
        p_title: project.title,
        p_description: project.description || '',
        p_problem_statement: project.problem_statement || '',
        p_github_url: project.github_url,
        p_links: project.links || [],
        p_status: project.status || 'active',
        p_collaborator_ids: project.collaborator_ids || [],
    });
    if (error) throw new Error(error.message?.replace(/^.*?:\s*/, '') || 'Save failed');
    return Array.isArray(rows) ? rows[0] : rows;
}

// A member has equal charge over a project if they created it OR are listed
// as a collaborator.
export function hasChargeOfProject(member, project) {
    if (!member || !project) return false;
    if (project.member_id === member.id || project.member_name === member.name) return true;
    return Array.isArray(project.collaborator_ids) && project.collaborator_ids.includes(member.id);
}

export async function postProjectUpdate(projectId, body, images) {
    const m = getCurrentMember();
    if (!m || !m.token) throw new Error('Not logged in');
    const { data: rows, error } = await supabase.rpc('member_create_project_update', {
        p_token: m.token,
        p_project_id: projectId,
        p_body: body,
        p_images: images || [],
    });
    if (error) throw new Error(error.message?.replace(/^.*?:\s*/, '') || 'Failed to post update');
    return Array.isArray(rows) ? rows[0] : rows;
}

export async function refreshCurrentMember() {
    const m = getCurrentMember();
    if (!m) return null;
    // profiles are publicly readable (member directory), so a plain select
    // is fine here -- no credentials table involved.
    const { data: full, error } = await supabase.from('profiles').select('*').eq('id', m.id).single();
    if (error) throw error;
    return saveSession({
        id: full.id,
        name: full.name,
        role: full.role,
        domain: full.domain,
        admission_number: full.admission_number,
        class: full.class,
        section: full.section,
        skills: full.skills,
        bio: full.bio,
        github: full.github,
        linkedin: full.linkedin,
        needsPassword: m.needsPassword,
        token: m.token,
    });
}

export function logoutMember() {
    const m = getCurrentMember();
    try {
        sessionStorage.removeItem(KEY);
    } catch {
        /* ignore */
    }
    if (m?.token) {
        supabase.rpc('member_logout', { p_token: m.token }).catch(() => {});
    }
}

export function contributorMatches(memberName, contributors) {
    if (!memberName || !Array.isArray(contributors)) return false;
    return contributors.some((c) => (typeof c === 'string' ? c : c?.name) === memberName);
}

export function admissionDigits(admission) {
    return String(admission || '').replace(/\D/g, '');
}
