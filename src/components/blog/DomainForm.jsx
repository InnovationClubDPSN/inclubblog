import { useState } from "react";
import { db } from "@/api/dataClient";
import { useToast } from "@/components/ui/use-toast";
import { Save, X } from "lucide-react";

function slugify(s) {
    return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export default function DomainForm({ editing, onSaved, onCancel }) {
    const [form, setForm] = useState(
        editing ? { ...editing } : { name: "", slug: "", description: "", cover_image: "" }
    );
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name) {
            toast({ title: "Name is required", variant: "destructive" });
            return;
        }
        setSaving(true);
        const slug = form.slug ? slugify(form.slug) : slugify(form.name);
        try {
            if (editing?.id) {
                await db.entities.Domain.update(editing.id, { ...form, slug });
                toast({ title: "Domain updated" });
            } else {
                await db.entities.Domain.create({ ...form, slug });
                toast({ title: "Domain created" });
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
          // {editing?.id ? "edit_domain" : "new_domain"}
        </span>
                {onCancel && (
                    <button type="button" onClick={onCancel} aria-label="Cancel">
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                <div>
                    <label className={label}>name *</label>
                    <input className={field} value={form.name} onChange={set("name")} placeholder="AI" />
                </div>
                <div>
                    <label className={label}>slug (auto if blank)</label>
                    <input className={field} value={form.slug} onChange={set("slug")} placeholder="ai" />
                </div>
                <div className="md:col-span-2">
                    <label className={label}>description</label>
                    <textarea className={`${field} min-h-[80px]`} value={form.description} onChange={set("description")} placeholder="What this domain explores" />
                </div>
                <div className="md:col-span-2">
                    <label className={label}>cover image url</label>
                    <input className={field} value={form.cover_image} onChange={set("cover_image")} placeholder="https://..." />
                </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                        Cancel
                    </button>
                )}
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-brand-purple px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50">
                    <Save className="h-3 w-3" /> {editing?.id ? "Update" : "Create"}
                </button>
            </div>
        </form>
    );
}