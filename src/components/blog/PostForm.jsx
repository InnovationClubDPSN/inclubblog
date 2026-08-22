import { useEffect, useState } from "react";
import { db } from "@/api/dataClient";
import { useToast } from "@/components/ui/use-toast";
import { Save, X, Upload, Loader2, Check } from "lucide-react";

const EMPTY = {
    title: "",
    subtitle: "",
    slug: "",
    category: "",
    general: false,
    tags: "",
    author: "",
    cover_image: "",
    featured: false,
    body: "",
    links: "",
    contributors: [],
    tech_tip: "",
    tech_tip_author: "",
};

function slugify(s) {
    return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

function normContributors(arr) {
    if (!Array.isArray(arr)) return [];
    return arr
        .map((c) => (typeof c === "string" ? { name: c, role: "" } : { name: c?.name || "", role: c?.role || "" }))
        .filter((c) => c.name);
}

export default function PostForm({ editing, onSaved, onCancel }) {
    const [form, setForm] = useState(() =>
        editing
            ? {
                ...editing,
                tags: (editing.tags || []).join(", "),
                links: (editing.links || []).join("\n"),
                contributors: normContributors(editing.contributors),
                general: (editing.category || "") === "General",
            }
            : { ...EMPTY }
    );
    const [domains, setDomains] = useState([]);
    const [members, setMembers] = useState([]);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        db.entities.Domain.list("name", 100).then((d) => setDomains(d || [])).catch(() => {});
        db.entities.Member.list("name", 200).then((m) => setMembers(m || [])).catch(() => {});
    }, []);

    const set = (k) => (e) => {
        const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((f) => ({ ...f, [k]: v }));
    };

    const toggleContributor = (m) => setForm((f) => {
        const exists = f.contributors.some((c) => c.name === m.name);
        if (exists) return { ...f, contributors: f.contributors.filter((c) => c.name !== m.name) };
        const defaultRole = (m.role || "").toLowerCase() === "president" ? "President" : (m.domain || "Core Team");
        return { ...f, contributors: [...f.contributors, { name: m.name, role: defaultRole }] };
    });
    const setContributorRole = (name, role) => setForm((f) => ({
        ...f,
        contributors: f.contributors.map((c) => (c.name === name ? { ...c, role } : c)),
    }));

    const onUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const { file_url } = await db.integrations.Core.UploadFile({ file });
            setForm((f) => ({ ...f, cover_image: file_url }));
        } catch (err) {
            toast({ title: "Upload failed", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.body) {
            toast({ title: "Title and body are required", variant: "destructive" });
            return;
        }
        setSaving(true);
        const slug = form.slug ? slugify(form.slug) : slugify(form.title);
        const read_time = Math.max(1, Math.ceil(form.body.trim().split(/\s+/).length / 200));
        const category = form.general ? "General" : (form.category || (domains[0] && domains[0].name) || "General");
        const payload = {
            title: form.title,
            subtitle: form.subtitle,
            slug,
            category,
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
            author: form.author || "Innovation Club",
            cover_image: form.cover_image,
            featured: !!form.featured,
            body: form.body,
            read_time,
            contributors: form.contributors,
            links: form.links.split("\n").map((t) => t.trim()).filter(Boolean),
            tech_tip: form.tech_tip || "",
            tech_tip_author: form.tech_tip_author || "",
        };
        try {
            if (editing?.id) {
                await db.entities.Post.update(editing.id, payload);
                toast({ title: "Post updated" });
            } else {
                await db.entities.Post.create(payload);
                toast({ title: "Post published" });
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
          // {editing?.id ? "edit_post" : "new_post"}
        </span>
                {onCancel && (
                    <button type="button" onClick={onCancel} aria-label="Cancel">
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <label className={label}>title *</label>
                    <input className={field} value={form.title} onChange={set("title")} placeholder="Post title" />
                </div>
                <div className="md:col-span-2">
                    <label className={label}>subtitle</label>
                    <input className={field} value={form.subtitle} onChange={set("subtitle")} placeholder="One-line summary" />
                </div>

                <div>
                    <label className={label}>domain</label>
                    <select className={field} value={form.category} onChange={set("category")} disabled={form.general}>
                        {domains.length === 0 && <option value="">Loading domains…</option>}
                        <option value="">— none —</option>
                        {domains.map((d) => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                    </select>
                    <label className="mt-2 flex items-center gap-2">
                        <input type="checkbox" checked={form.general} onChange={set("general")} className="accent-brand-purple" />
                        <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">general post (no domain)</span>
                    </label>
                </div>
                <div>
                    <label className={label}>slug (auto if blank)</label>
                    <input className={field} value={form.slug} onChange={set("slug")} placeholder="auto-from-title" />
                </div>

                <div className="md:col-span-2">
                    <label className={label}>author</label>
                    <input className={field} value={form.author} onChange={set("author")} placeholder="Author name" />
                </div>

                <div className="md:col-span-2 border-t border-border pt-4">
                    <label className={label}>tech tip of the week (optional)</label>
                    <textarea className={`${field} min-h-[80px]`} value={form.tech_tip} onChange={set("tech_tip")} placeholder="A short technical tip shown on the post." />
                    <label className={`${label} mt-3 block`}>tech tip author</label>
                    <input className={field} value={form.tech_tip_author} onChange={set("tech_tip_author")} placeholder="Who wrote the tip" />
                </div>

                <div className="md:col-span-2">
                    <label className={label}>contributors (members)</label>
                    <div className="mt-2 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
                        {members.length === 0 && (
                            <div className="bg-card px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">No members found</div>
                        )}
                        {members.map((m) => {
                            const sel = form.contributors.some((c) => c.name === m.name);
                            const cr = form.contributors.find((c) => c.name === m.name);
                            return (
                                <div key={m.id} className="bg-card p-3">
                                    <button type="button" onClick={() => toggleContributor(m)} className="flex w-full items-center justify-between gap-2 text-left">
                                        <span className="truncate text-xs font-semibold">{m.name}</span>
                                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center border ${sel ? "border-brand-purple bg-brand-purple text-black" : "border-border text-transparent"}`}>
                      <Check className="h-2.5 w-2.5" />
                    </span>
                                    </button>
                                    <p className="mt-1 truncate text-[9px] uppercase tracking-[0.15em] text-brand-purple">{m.role}{m.domain ? ` · ${m.domain}` : ""}</p>
                                    {sel && (
                                        <input className={`${field} mt-2`} value={cr?.role || ""} onChange={(e) => setContributorRole(m.name, e.target.value)} placeholder="contributor role (e.g. Research Lead)" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className={label}>links (one per line — shown on the post)</label>
                    <textarea className={`${field} min-h-[90px]`} value={form.links} onChange={set("links")} placeholder={"https://...\nhttps://..."} />
                </div>

                <div className="md:col-span-2">
                    <label className={label}>tags (comma separated)</label>
                    <input className={field} value={form.tags} onChange={set("tags")} placeholder="neural-networks, cognition" />
                </div>

                <div className="md:col-span-2">
                    <label className={label}>cover image</label>
                    <div className="flex items-center gap-3">
                        <label className="flex cursor-pointer items-center gap-2 border border-brand-purple/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black">
                            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                            {uploading ? "Uploading…" : "Upload"}
                            <input type="file" accept="image/*" onChange={onUpload} className="hidden" disabled={uploading} />
                        </label>
                        {form.cover_image && (
                            <div className="relative h-12 w-20 overflow-hidden border border-border">
                                <img src={form.cover_image} alt="cover" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                            </div>
                        )}
                        {form.cover_image && (
                            <button type="button" onClick={() => setForm((f) => ({ ...f, cover_image: "" }))} className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-brand-pink">
                                Remove
                            </button>
                        )}
                    </div>
                    {form.cover_image && (
                        <p className="mt-2 break-all text-[9px] text-muted-foreground">{form.cover_image}</p>
                    )}
                </div>

                <label className="flex items-center gap-3 md:col-span-2">
                    <input type="checkbox" checked={form.featured} onChange={set("featured")} className="accent-brand-purple" />
                    <span className={label}>featured (hero slot)</span>
                </label>

                <div className="md:col-span-2">
                    <label className={label}>body (markdown) *</label>
                    <textarea
                        className={`${field} min-h-[260px] font-mono leading-relaxed`}
                        value={form.body}
                        onChange={set("body")}
                        placeholder={"## Heading\n\nWrite your article in markdown..."}
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-brand-purple px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50"
                >
                    <Save className="h-3 w-3" /> {editing?.id ? "Update" : "Publish"}
                </button>
            </div>
        </form>
    );
}