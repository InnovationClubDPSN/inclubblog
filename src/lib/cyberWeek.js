// Shared helpers for the Cyber Awareness Week section (home banner,
// /cyber-week page, and the admin tab). Keeps defaults in one place so a
// missing settings row or a not-yet-run migration still renders sensibly.

export const CYBER_DEFAULTS = {
    enabled: true,
    website_url: "https://cyberawarenessweek.vercel.app/",
    starts_on: "2026-10-27",
    ends_on: "2026-10-30",
};

// Fallback poster used by the home banner until an admin uploads an image poster.
export const FALLBACK_POSTER = "/images/poster/csaw.jpg";

export function normalizeSettings(row) {
    return { ...CYBER_DEFAULTS, ...(row || {}) };
}

// Parse a YYYY-MM-DD string as a local date (avoids the UTC off-by-one that
// `new Date("2026-10-27")` causes in timezones west of UTC).
export function parseDay(value) {
    if (!value) return null;
    const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

export function formatDay(value, opts = { weekday: "short", day: "2-digit", month: "short" }) {
    const d = parseDay(value);
    return d ? d.toLocaleDateString("en-GB", opts) : "";
}

// "Day 01", "Day 02"... relative to the event start. Null when outside the event.
export function eventDayLabel(postedOn, startsOn, endsOn) {
    const d = parseDay(postedOn);
    const start = parseDay(startsOn);
    const end = parseDay(endsOn);
    if (!d || !start) return null;
    if (end && (d < start || d > end)) return null;
    const n = Math.round((d - start) / 86400000) + 1;
    return `Day ${String(n).padStart(2, "0")}`;
}

export function isPdf(item) {
    return item?.file_type === "pdf" || /\.pdf($|\?)/i.test(item?.file_url || "");
}

// Groups items (already sorted) by their posted_on day, preserving order.
export function groupByDay(items) {
    const groups = [];
    const index = new Map();
    for (const item of items) {
        const key = item.posted_on || "undated";
        if (!index.has(key)) {
            index.set(key, groups.length);
            groups.push({ day: key, items: [] });
        }
        groups[index.get(key)].items.push(item);
    }
    return groups;
}

// The newest image-type poster, used as the home banner's poster.
export function latestPosterImage(items) {
    const posters = items
        .filter((i) => i.kind === "poster" && !isPdf(i) && i.file_url)
        .sort((a, b) => (b.posted_on || "").localeCompare(a.posted_on || "") || (b.created_date || "").localeCompare(a.created_date || ""));
    return posters[0]?.file_url || null;
}
