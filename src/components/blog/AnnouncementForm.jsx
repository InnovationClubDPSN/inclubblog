import { useState } from "react";
import { db } from "@/api/dataClient";
import { useToast } from "@/components/ui/use-toast";
import { Save, X } from "lucide-react";

// <input type="datetime-local"> works in local time with no timezone/seconds;
// these convert to/from the ISO string the `expires_at` column stores.
function toLocalInputValue(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInputValue(local) {
    if (!local) return null;
    const d = new Date(local);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function AnnouncementForm({ editing, onSaved, onCancel }) {
    const [form, setForm] = useState(
        editing
            ? { title: editing.title || "", body: editing.body || "", pinned: !!editing.pinned, expires_at: toLocalInputValue(editing.expires_at) }
            : { title: "", body: "", pinned: false, expires_at: "" }
    );
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.body.trim()) {
            toast({ title: "Title and message are required", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                body: form.body.trim(),
                pinned: !!form.pinned,
                expires_at: fromLocalInputValue(form.expires_at),
            };
            if (editing?.id) {
                await db.entities.Announcement.update(editing.id, payload);
                toast({ title: "Announcement updated" });
            } else {
                await db.entities.Announcement.create(payload);
                toast({ title: "Announcement posted" });
            }
            onSaved();
        } catch (err) {
            toast({ title: "Save failed", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const field = "w-full border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand-purple focus:outline-none";
    const label = "text-[10px] uppercase tracking-[0.2em] text-muted-foreground";

    return (
        <form onSubmit={submit} className="border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-pink">
                    // {editing?.id ? "edit_announcement" : "new_announcement"}
                </span>
                {onCancel && (
                    <button type="button" onClick={onCancel} aria-label="Cancel">
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 gap-4 p-5">
                <div>
                    <label className={label}>title *</label>
                    <input className={`${field} mt-2`} value={form.title} onChange={set("title")} placeholder="Sessions resume Monday" />
                </div>
                <div>
                    <label className={label}>message *</label>
                    <textarea className={`${field} mt-2 min-h-[100px]`} value={form.body} onChange={set("body")} placeholder="What members need to know…" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))} className="h-3.5 w-3.5 accent-brand-purple" />
                        <span className={label}>pin to top</span>
                    </label>
                    <div>
                        <label className={label}>expires (optional)</label>
                        <input type="datetime-local" className={`${field} mt-2`} value={form.expires_at} onChange={set("expires_at")} />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                        Cancel
                    </button>
                )}
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-brand-purple px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50">
                    <Save className="h-3 w-3" /> {editing?.id ? "Update" : "Post"}
                </button>
            </div>
        </form>
    );
}
