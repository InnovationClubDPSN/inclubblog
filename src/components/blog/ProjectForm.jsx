import { useMemo, useState } from "react";
import { saveMemberProject } from "@/lib/memberSession";
import { useToast } from "@/components/ui/use-toast";
import { Save, X, Plus, Users } from "lucide-react";

const STATUSES = ["active", "completed", "paused"];

export default function ProjectForm({ editing, member, members = [], onSaved, onCancel }) {
    const [form, setForm] = useState(
        editing
            ? { ...editing, links: editing.links || [], collaborator_ids: editing.collaborator_ids || [] }
            : { title: "", description: "", github_url: "", problem_statement: "", links: [], status: "active", collaborator_ids: [] }
    );
    const [saving, setSaving] = useState(false);
    const [collabQuery, setCollabQuery] = useState("");
    const { toast } = useToast();

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    // Members who can be added as collaborators: not yourself, not already added.
    const collabOptions = useMemo(() => {
        const q = collabQuery.trim().toLowerCase();
        return members
            .filter((m) => m.id !== member?.id && !(form.collaborator_ids || []).includes(m.id))
            .filter((m) => !q || m.name?.toLowerCase().includes(q))
            .slice(0, 6);
    }, [members, member, form.collaborator_ids, collabQuery]);

    const addCollaborator = (id) => {
        setForm((f) => ({ ...f, collaborator_ids: [...(f.collaborator_ids || []), id] }));
        setCollabQuery("");
    };
    const removeCollaborator = (id) => {
        setForm((f) => ({ ...f, collaborator_ids: (f.collaborator_ids || []).filter((c) => c !== id) }));
    };
    const collaboratorName = (id) => members.find((m) => m.id === id)?.name || "member";

    const submit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.github_url) {
            toast({ title: "Title and GitHub URL are required (GitHub is compulsory)", variant: "destructive" });
            return;
        }
        if (!/^https?:\/\//i.test(form.github_url)) {
            toast({ title: "GitHub URL must start with http(s)://", variant: "destructive" });
            return;
        }
        setSaving(true);
        const payload = {
            id: editing?.id,
            title: form.title,
            description: form.description,
            problem_statement: form.problem_statement || "",
            github_url: form.github_url,
            links: form.links || [],
            status: form.status || "active",
            collaborator_ids: form.collaborator_ids || [],
        };
        try {
            await saveMemberProject(payload);
            toast({ title: editing?.id ? "Project updated" : "Project created" });
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
          // {editing?.id ? "edit_project" : "new_project"}
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
                    <input className={field} value={form.title} onChange={set("title")} placeholder="Project title" />
                </div>
                <div>
                    <label className={label}>description</label>
                    <textarea className={`${field} min-h-[80px]`} value={form.description} onChange={set("description")} placeholder="What is this project about?" />
                </div>
                <div>
                    <label className={label}>problem statement</label>
                    <textarea className={`${field} min-h-[80px]`} value={form.problem_statement || ""} onChange={set("problem_statement")} placeholder="What problem does this project solve?" />
                </div>
                <div>
                    <label className={label}>github url * (compulsory)</label>
                    <input className={field} value={form.github_url} onChange={set("github_url")} placeholder="https://github.com/..." />
                </div>
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label className={label}>links (figma, docs, etc.)</label>
                        <button type="button" onClick={() => setForm((f) => ({ ...f, links: [...(f.links || []), ""] }))} className="flex items-center gap-1 border border-brand-purple/50 px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black">
                            <Plus className="h-3 w-3" /> add
                        </button>
                    </div>
                    <div className="space-y-2">
                        {(form.links || []).map((lnk, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input className={field} value={lnk} onChange={(e) => setForm((f) => { const links = [...(f.links || [])]; links[i] = e.target.value; return { ...f, links }; })} placeholder="https://figma.com/..." />
                                <button type="button" onClick={() => setForm((f) => ({ ...f, links: (f.links || []).filter((_, k) => k !== i) }))} className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-pink hover:text-brand-pink" aria-label="Remove link">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <label className={label}>status</label>
                    <select className={field} value={form.status} onChange={set("status")}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className={`${label} flex items-center gap-1.5`}>
                        <Users className="h-3 w-3" /> collaborators
                    </label>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                        Collaborators have equal charge over this project — they can edit it and post updates, same as you.
                    </p>
                    {(form.collaborator_ids || []).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {form.collaborator_ids.map((id) => (
                                <span key={id} className="flex items-center gap-1.5 border border-brand-purple/40 bg-brand-purple/10 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-brand-purple">
                                    {collaboratorName(id)}
                                    <button type="button" onClick={() => removeCollaborator(id)} aria-label={`Remove ${collaboratorName(id)}`}>
                                        <X className="h-3 w-3 hover:text-brand-pink" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <input
                        className={`${field} mt-3`}
                        value={collabQuery}
                        onChange={(e) => setCollabQuery(e.target.value)}
                        placeholder="Search members by name…"
                    />
                    {collabQuery && collabOptions.length > 0 && (
                        <div className="mt-2 border border-border bg-background">
                            {collabOptions.map((m) => (
                                <button
                                    type="button"
                                    key={m.id}
                                    onClick={() => addCollaborator(m.id)}
                                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-brand-purple/10 hover:text-brand-purple"
                                >
                                    {m.name}
                                    <Plus className="h-3 w-3" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">Cancel</button>
                )}
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-brand-purple px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50">
                    <Save className="h-3 w-3" /> {editing?.id ? "Update" : "Create"}
                </button>
            </div>
        </form>
    );
}