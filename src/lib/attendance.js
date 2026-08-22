// ============================================================================
// Attendance is tracked outside Supabase, in a Google Sheet exposed as JSON
// through a Google Apps Script web app (see the GAS doGet() source for the
// exact shape). The endpoint returns one row per student, already reduced
// to a single attendance value each -- not one row per attendance event --
// so "showing attendance as a count" means reading that value straight off
// the matching row, not counting rows:
//
//   [{ name: "...", admissionNumber: "...", attendance: <number> }, ...]
//
// This fetches that endpoint once, caches the result in memory for the
// session, and exposes a helper to look up a single member's row. Matching
// prefers admission number (exact, and the only field guaranteed unique)
// and falls back to a case-insensitive name match for members without one
// on file.
// ============================================================================

const ATTENDANCE_URL =
    "https://script.google.com/macros/s/AKfycbxnKOcgi04HIe35r2sbDEN9w59zYNBpg8-7b9kkLlEgpNd9ajf716gHVwlNgqZYS8pa/exec";

let cache = null; // shared promise across every call in this session

async function fetchAttendance() {
    if (!cache) {
        cache = fetch(ATTENDANCE_URL)
            .then((res) => {
                if (!res.ok) throw new Error(`attendance endpoint returned ${res.status}`);
                return res.json();
            })
            .then((json) => (Array.isArray(json) ? json : []))
            .catch(() => []); // fail soft -- profile page shouldn't break if the sheet is down
    }
    return cache;
}

function norm(v) {
    return String(v ?? "").trim().toLowerCase();
}

// Returns the raw attendance value (whatever the sheet stores -- a count,
// a percentage, "18/20", etc.) for a member, or null if no row matches.
export async function getAttendance(member) {
    const admission = norm(member?.admission_number);
    const name = norm(member?.name);
    if (!admission && !name) return null;

    const rows = await fetchAttendance();

    let row = admission ? rows.find((r) => norm(r.admissionNumber) === admission) : null;
    if (!row && name) row = rows.find((r) => norm(r.name) === name);

    return row ? row.attendance : null;
}
