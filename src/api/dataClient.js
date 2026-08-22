// ============================================================================
// Data access layer.
//
// `db.entities.<Name>` gives every entity a uniform CRUD surface --
// list/filter/get/create/update/delete/bulkCreate -- backed by Supabase
// Postgres tables under the hood. Components call these instead of talking
// to the Supabase client directly, which keeps table names, admin-write
// routing, and error handling in one place instead of scattered across
// every form and list view.
//
// Reads go straight to Postgres via PostgREST (fast, respects the public
// RLS read policies in supabase/schema.sql). Writes on admin-owned tables
// route through the admin_write()/admin_delete_row() RPCs instead of a
// direct table write, because those tables have no public write policy --
// only a valid admin session token can touch them (see
// src/lib/adminSession.js and supabase/schema.sql).
// ============================================================================
import { supabase } from '@/lib/supabaseClient';
import { getAdminToken } from '@/lib/adminSession';

// entity name -> Supabase table name
const TABLES = {
    Announcement: 'announcements',
    Comment: 'comments',
    Domain: 'domains',
    Gallery: 'galleries',
    Like: 'likes',
    Member: 'profiles',
    Post: 'posts',
    Project: 'projects',
    ProjectUpdate: 'project_updates',
};

// Tables whose RLS policies only allow writes from is_admin() -- see
// supabase/schema.sql. Create/update on these always route through the
// admin_write() RPC below. Deletes on these plus a couple of admin-only-
// delete tables route through admin_delete_row().
const ADMIN_WRITE_TABLES = new Set(['posts', 'domains', 'galleries', 'profiles', 'announcements']);
const ADMIN_DELETE_TABLES = new Set([...ADMIN_WRITE_TABLES, 'comments', 'project_updates']);

async function adminWrite(table, id, payload) {
    const token = getAdminToken();
    if (!token) throw new Error('Admin session expired -- please enter the PIN again');
    const { data, error } = await supabase.rpc('admin_write', {
        p_token: token,
        p_table: table,
        p_id: id,
        p_payload: payload,
    });
    if (error) throw new Error(error.message?.replace(/^.*?:\s*/, '') || 'Save failed');
    return data;
}

async function adminDelete(table, id) {
    const token = getAdminToken();
    if (!token) throw new Error('Admin session expired -- please enter the PIN again');
    const { error } = await supabase.rpc('admin_delete_row', { p_token: token, p_table: table, p_id: id });
    if (error) throw new Error(error.message?.replace(/^.*?:\s*/, '') || 'Delete failed');
    return true;
}

function applySort(query, sort) {
    if (!sort) return query;
    const desc = sort.startsWith('-');
    const column = desc ? sort.slice(1) : sort;
    return query.order(column, { ascending: !desc });
}

function applyFilter(query, filters = {}) {
    let q = query;
    for (const [key, value] of Object.entries(filters)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            if ('$in' in value) {
                q = q.in(key, value.$in);
                continue;
            }
            if ('$ne' in value) {
                q = q.neq(key, value.$ne);
                continue;
            }
        }
        q = q.eq(key, value);
    }
    return q;
}

function makeEntity(table) {
    return {
        async list(sort, limit) {
            let q = supabase.from(table).select('*');
            q = applySort(q, sort);
            if (limit) q = q.limit(limit);
            const { data, error } = await q;
            if (error) throw error;
            return data || [];
        },
        async filter(query = {}, sort, limit) {
            let q = applyFilter(supabase.from(table).select('*'), query);
            q = applySort(q, sort);
            if (limit) q = q.limit(limit);
            const { data, error } = await q;
            if (error) throw error;
            return data || [];
        },
        async get(id) {
            const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
            if (error) throw error;
            return data;
        },
        async create(payload) {
            if (ADMIN_WRITE_TABLES.has(table)) return adminWrite(table, null, payload);
            const { data, error } = await supabase.from(table).insert(payload).select().single();
            if (error) throw error;
            return data;
        },
        async update(id, payload) {
            if (ADMIN_WRITE_TABLES.has(table)) return adminWrite(table, id, payload);
            const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        async delete(id) {
            if (ADMIN_DELETE_TABLES.has(table)) return adminDelete(table, id);
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
            return true;
        },
        async bulkCreate(records) {
            if (ADMIN_WRITE_TABLES.has(table)) {
                const out = [];
                for (const record of records) out.push(await adminWrite(table, null, record));
                return out;
            }
            const { data, error } = await supabase.from(table).insert(records).select();
            if (error) throw error;
            return data || [];
        },
    };
}

const entities = Object.fromEntries(
    Object.entries(TABLES).map(([name, table]) => [name, makeEntity(table)])
);

// ----------------------------------------------------------------------------
// integrations.Core.UploadFile -> Supabase Storage ("uploads" bucket)
// ----------------------------------------------------------------------------
const integrations = {
    Core: {
        async UploadFile({ file }) {
            const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
            const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
            const { error } = await supabase.storage.from('uploads').upload(path, file, {
                cacheControl: '3600',
                upsert: false,
            });
            if (error) throw error;
            const { data } = supabase.storage.from('uploads').getPublicUrl(path);
            return { file_url: data.publicUrl };
        },
    },
};

export const db = { entities, integrations };
