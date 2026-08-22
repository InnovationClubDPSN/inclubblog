import { useState } from "react";
import { db } from "@/api/dataClient";
import { useToast } from "@/components/ui/use-toast";
import { Save, X, Upload, Loader2 } from "lucide-react";

const ROLES = ["President", "Core Team", "Member"];

export default function MemberForm({ editing, domains, onSaved, onCancel }) {
    const [form, setForm] = useState(
        editing
            ? { ...editing, skills: editing.skills || "" }
            : { name: "", admission_number: "", role: "Member", domain: "", skills: "", class: "", section: "", bio: "", avatar: "", github: "", linkedin: "" }
    );
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const onUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const { file_url } = await db.integrations.Core.UploadFile({ file });
            setForm((f) => ({ ...f, avatar: file_url }));
        } catch (err) {
            toast({ title: "Upload failed", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name) { toast({ title: "Name is required", variant: "destructive" }); return; }
        setSaving(true);
        try {
            if (editing?.id) {
                await db.entities.Member.update(editing.id, form);
                toast({ title: "Member updated" });
            } else {
                await db.entities.Member.create(form);
                toast({ title: "Member added" });
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
    const isCore = form.role === "Core Team";
    const showBio = isCore || form.role === "President";
    const showAvatar = showBio;

    return (
        <form onSubmit={submit} className="border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-pink">// {editing?.id ? "edit_member" : "new_member"}</span>
                {onCancel && (
                    <button type="button" onClick={onCancel} aria-label="Cancel"><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                )}
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                <div>
                    <label className={label}>name *</label>
                    <input className={field} value={form.name} onChange={set("name")} placeholder="Full name" />
                </div>
                <div>
                    <label className={label}>admission number</label>
                    <input className={field} value={form.admission_number || ""} onChange={set("admission_number")} placeholder="e.g. 24A11001" />
                </div>
                <div>
                    <label className={label}>role</label>
                    <select className={field} value={form.role} onChange={set("role")}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div>
                    <label className={label}>domain</label>
                    <select className={field} value={form.domain} onChange={set("domain")}>
                        <option value="">— none —</option>
                        {domains.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className={label}>class</label>
                    <input className={field} value={form.class || ""} onChange={set("class")} placeholder="e.g. 11" />
                </div>
                <div>
                    <label className={label}>section</label>
                    <input className={field} value={form.section || ""} onChange={set("section")} placeholder="e.g. A" />
                </div>
                {isCore && (
                    <div>
                        <label className={label}>github</label>
                        <input className={field} value={form.github} onChange={set("github")} placeholder="https://github.com/..." />
                    </div>
                )}
                {isCore && (
                    <div className="md:col-span-2">
                        <label className={label}>linkedin</label>
                        <input className={field} value={form.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/in/..." />
                    </div>
                )}
                <div className="md:col-span-2">
                    <label className={label}>skills (comma separated)</label>
                    <input className={field} value={form.skills} onChange={set("skills")} placeholder="Python, Robotics, 3D Design" />
                </div>
                {showBio && (
                    <div className="md:col-span-2">
                        <label className={label}>bio</label>
                        <textarea className={`${field} min-h-[70px]`} value={form.bio} onChange={set("bio")} placeholder="Short bio" />
                    </div>
                )}
                {showAvatar && (
                    <div className="md:col-span-2">
                        <label className={label}>avatar</label>
                        <div className="flex items-center gap-3">
                            <label className="flex cursor-pointer items-center gap-2 border border-brand-purple/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black">
                                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                {uploading ? "Uploading…" : "Upload"}
                                <input type="file" accept="image/*" onChange={onUpload} className="hidden" disabled={uploading} />
                            </label>
                            {form.avatar && (
                                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-border">
                                    <img src={form.avatar} alt="avatar" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                </div>
                            )}
                            {form.avatar && (
                                <button type="button" onClick={() => setForm((f) => ({ ...f, avatar: "" }))} className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-brand-pink">Remove</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">Cancel</button>
                )}
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-brand-purple px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50">
                    <Save className="h-3 w-3" /> {editing?.id ? "Update" : "Add"}
                </button>
            </div>
        </form>
    );
}