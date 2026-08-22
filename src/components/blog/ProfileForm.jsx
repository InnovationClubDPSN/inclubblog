import { useEffect, useRef, useState } from "react";
import { db } from "@/api/dataClient";
import { updateMemberProfile } from "@/lib/memberSession";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Camera } from "lucide-react";

const field =
    "w-full border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand-purple focus:outline-none";

export default function ProfileForm({ member, onSaved }) {
    const [domains, setDomains] = useState([]);
    const [form, setForm] = useState({
        class: member.class || "",
        section: member.section || "",
        domain: member.domain || "",
        skills: member.skills || "",
        bio: member.bio || "",
        github: member.github || "",
        linkedin: member.linkedin || "",
    });
    const [avatar, setAvatar] = useState(member.avatar || "");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const isCore =
        String(member.role || "").toLowerCase() === "core team" ||
        String(member.role || "").toLowerCase() === "president";

    useEffect(() => {
        db.entities.Domain.list("name", 100)
            .then((d) => setDomains(d || []))
            .catch(() => {});
    }, []);

    // Re-sync form when the full member record arrives from the database.
    useEffect(() => {
        setForm({
            class: member.class || "",
            section: member.section || "",
            domain: member.domain || "",
            skills: member.skills || "",
            bio: member.bio || "",
            github: member.github || "",
            linkedin: member.linkedin || "",
        });
    }, [member.class, member.section, member.domain, member.skills, member.bio, member.github, member.linkedin]);

    useEffect(() => { setAvatar(member.avatar || ""); }, [member.avatar]);

    const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

    const onPickAvatar = async (file) => {
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const { file_url } = await db.integrations.Core.UploadFile({ file });
            setAvatar(file_url);
            const updated = await updateMemberProfile({ avatar: file_url });
            toast({ title: "Profile photo updated" });
            onSaved?.(updated);
        } catch (err) {
            toast({ title: "Photo upload failed", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                class: form.class.trim(),
                section: form.section.trim(),
                domain: form.domain,
                skills: form.skills.trim(),
                github: form.github.trim(),
                linkedin: form.linkedin.trim(),
            };
            if (isCore) payload.bio = form.bio.trim();
            const updated = await updateMemberProfile(payload);
            toast({ title: "Details saved" });
            onSaved?.(updated);
        } catch (err) {
            toast({ title: "Failed to save", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-5 border border-border bg-card p-5">
            <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Profile photo</label>
                <div className="mt-2 flex items-center gap-4">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-purple/40 bg-brand-purple/10 text-xl font-bold text-brand-purple">
                        {avatar ? (
                            <img src={avatar} alt={member.name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        ) : (
                            member.name?.charAt(0).toUpperCase()
                        )}
                        {uploadingAvatar && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                                <Loader2 className="h-4 w-4 animate-spin text-brand-purple" />
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        disabled={uploadingAvatar}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 border border-border px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple disabled:opacity-50"
                    >
                        <Camera className="h-3 w-3" /> {avatar ? "change photo" : "upload photo"}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingAvatar}
                        onChange={(e) => onPickAvatar(e.target.files?.[0])}
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Class</label>
                    <input className={`${field} mt-2`} value={form.class} onChange={set("class")} placeholder="e.g. 11" />
                </div>
                <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Section</label>
                    <input className={`${field} mt-2`} value={form.section} onChange={set("section")} placeholder="e.g. A" />
                </div>
            </div>

            <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Domain</label>
                <select className={`${field} mt-2`} value={form.domain} onChange={set("domain")}>
                    <option value="">— select domain —</option>
                    {domains.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Skills <span className="normal-case text-muted-foreground/70">(comma separated)</span>
                </label>
                <input className={`${field} mt-2`} value={form.skills} onChange={set("skills")} placeholder="Python, Design, Robotics" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">GitHub URL</label>
                    <input className={`${field} mt-2`} value={form.github} onChange={set("github")} placeholder="https://github.com/username" />
                </div>
                <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">LinkedIn URL</label>
                    <input className={`${field} mt-2`} value={form.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/in/username" />
                </div>
            </div>

            {isCore && (
                <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-brand-pink">Bio</label>
                    <textarea className={`${field} mt-2 min-h-[90px]`} value={form.bio} onChange={set("bio")} placeholder="A short bio about you…" />
                </div>
            )}

            <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-brand-purple px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50"
            >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} save details
            </button>
        </form>
    );
}