import { useEffect, useState } from "react";
import { db } from "@/api/dataClient";
import { useToast } from "@/components/ui/use-toast";
import { normalizeSettings, formatDay, isPdf, groupByDay } from "@/lib/cyberWeek";
import { Plus, Save, X, Pencil, Trash2, Upload, Loader2, Power, FileText, Image as ImageIcon, Globe } from "lucide-react";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*";
const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
const emptyItem = { title: "", kind: "poster", posted_on: today(), description: "" };

const field = "w-full border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand-purple focus:outline-none";
const label = "text-[10px] uppercase tracking-[0.2em] text-muted-foreground";

export default function AdminCyberWeek() {
    const { toast } = useToast();
    const [settings, setSettings] = useState(normalizeSettings(null));
    const [settingsForm, setSettingsForm] = useState(normalizeSettings(null));
    const [savingSettings, setSavingSettings] = useState(false);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyItem);
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const loadSettings = () =>
        db.entities.CyberWeekSettings.list(null, 1)
            .then((rows) => {
                const s = normalizeSettings(rows?.[0]);
                setSettings(s);
                setSettingsForm(s);
            })
            .catch((err) => toast({ title: "Could not load Cyber Week settings", description: String(err?.message || err), variant: "destructive" }));

    const loadItems = () => {
        setLoading(true);
        db.entities.CyberWeekItem.list("-posted_on", 500)
            .then((rows) => { setItems(rows || []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { loadSettings(); loadItems(); }, []);

    // ---------- Settings ----------
    const saveSettings = async (patch, okMessage) => {
        setSavingSettings(true);
        try {
            const row = await db.cyberWeek.saveSettings(patch);
            const s = normalizeSettings(row);
            setSettings(s);
            setSettingsForm(s);
            toast({ title: okMessage });
        } catch (err) {
            toast({ title: "Save failed", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setSavingSettings(false);
        }
    };

    const toggleEnabled = () => {
        const next = !settings.enabled;
        if (!next && !window.confirm("Disable Cyber Awareness Week? The home-page section and the /cyber-week page will be removed until you enable it again.")) return;
        saveSettings({ enabled: next }, next ? "Section enabled" : "Section disabled");
    };

    const submitSettings = (e) => {
        e.preventDefault();
        if (!/^https?:\/\//i.test(settingsForm.website_url || "")) {
            toast({ title: "Website must start with http:// or https://", variant: "destructive" });
            return;
        }
        if (settingsForm.ends_on && settingsForm.starts_on && settingsForm.ends_on < settingsForm.starts_on) {
            toast({ title: "End date is before start date", variant: "destructive" });
            return;
        }
        saveSettings(
            { website_url: settingsForm.website_url, starts_on: settingsForm.starts_on, ends_on: settingsForm.ends_on },
            "Settings saved"
        );
    };

    // ---------- Items ----------
    const startNew = () => { setEditing(null); setForm(emptyItem); setFile(null); setShowForm(true); };
    const startEdit = (it) => {
        setEditing(it);
        setForm({ title: it.title || "", kind: it.kind || "poster", posted_on: it.posted_on || today(), description: it.description || "" });
        setFile(null);
        setShowForm(true);
    };
    const cancel = () => { setEditing(null); setForm(emptyItem); setFile(null); setShowForm(false); };

    const pickFile = (e) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (!f) return;
        const ok = f.type === "application/pdf" || /\.pdf$/i.test(f.name) || f.type.startsWith("image/");
        if (!ok) {
            toast({ title: "Unsupported file", description: "Upload a PDF or an image (JPG, PNG, WEBP).", variant: "destructive" });
            return;
        }
        setFile(f);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
        if (!editing && !file) { toast({ title: "Choose a PDF or image to upload", variant: "destructive" }); return; }

        setSaving(true);
        try {
            const meta = {
                title: form.title.trim(),
                kind: form.kind,
                posted_on: form.posted_on,
                description: form.description.trim(),
            };
            if (editing?.id) {
                // Editing keeps the existing file. To replace a file, delete the item and upload again.
                await db.entities.CyberWeekItem.update(editing.id, meta);
                toast({ title: "Item updated" });
            } else {
                const { file_url } = await db.integrations.Core.UploadFile({ file });
                const isPdfFile = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
                await db.entities.CyberWeekItem.create({ ...meta, file_url, file_type: isPdfFile ? "pdf" : "image" });
                toast({ title: "Posted to Cyber Awareness Week" });
            }
            cancel();
            loadItems();
        } catch (err) {
            toast({ title: "Save failed", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async (it) => {
        if (!window.confirm(`Delete "${it.title}"?`)) return;
        try {
            await db.entities.CyberWeekItem.delete(it.id);
            toast({ title: "Item deleted" });
            loadItems();
        } catch (err) {
            toast({ title: "Delete failed", description: String(err?.message || err), variant: "destructive" });
        }
    };

    const filePicked = { isPdf: !!file && (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) };
    const groups = groupByDay(items);
    const enabled = settings.enabled;

    return (
        <div className="space-y-10">
            {/* ---------- Section status ---------- */}
            <div className="flex flex-col gap-4 border border-border bg-card p-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">// cyber_week_section</span>
                    <div className="mt-2 flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${enabled ? "bg-brand-purple animate-glow-pulse" : "bg-muted-foreground"}`} />
                        <span className="text-lg font-bold uppercase tracking-tight">{enabled ? "Live on home page" : "Disabled — hidden everywhere"}</span>
                    </div>
                    <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
                        When disabled, the banner is removed from the home page and /cyber-week redirects to the home page. Uploads are kept and return when re-enabled.
                    </p>
                </div>
                <button
                    onClick={toggleEnabled}
                    disabled={savingSettings}
                    className={`flex shrink-0 items-center justify-center gap-2 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors disabled:opacity-50 ${
                        enabled ? "border border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-black" : "bg-brand-purple text-black hover:bg-brand-pink"
                    }`}
                >
                    <Power className="h-4 w-4" /> {enabled ? "Disable section" : "Enable section"}
                </button>
            </div>

            {/* ---------- Settings ---------- */}
            <form onSubmit={submitSettings} className="border border-border bg-card">
                <div className="border-b border-border px-5 py-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-purple">// settings</span>
                </div>
                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
                    <div className="md:col-span-3">
                        <label className={label}>official website link *</label>
                        <div className="relative">
                            <Globe className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input className={`${field} pl-9`} value={settingsForm.website_url} onChange={(e) => setSettingsForm((f) => ({ ...f, website_url: e.target.value }))} placeholder="https://cyberawarenessweek.vercel.app/" />
                        </div>
                    </div>
                    <div>
                        <label className={label}>event starts</label>
                        <input type="date" className={field} value={settingsForm.starts_on} onChange={(e) => setSettingsForm((f) => ({ ...f, starts_on: e.target.value }))} />
                    </div>
                    <div>
                        <label className={label}>event ends</label>
                        <input type="date" className={field} value={settingsForm.ends_on} onChange={(e) => setSettingsForm((f) => ({ ...f, ends_on: e.target.value }))} />
                    </div>
                    <div className="flex items-end">
                        <button type="submit" disabled={savingSettings} className="flex w-full items-center justify-center gap-2 bg-brand-purple px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50">
                            {savingSettings ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save settings
                        </button>
                    </div>
                </div>
            </form>

            {/* ---------- Items header ---------- */}
            <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">// brochures &amp; posters · {items.length}</span>
                {!showForm && (
                    <button onClick={startNew} className="flex items-center gap-2 bg-brand-purple px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink">
                        <Plus className="h-4 w-4" /> New upload
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={submit} className="border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-5 py-3">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-pink">// {editing?.id ? "edit_item" : "new_item"}</span>
                        <button type="button" onClick={cancel} aria-label="Cancel"><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className={label}>title *</label>
                            <input className={field} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Phishing awareness poster" />
                        </div>
                        <div>
                            <label className={label}>type *</label>
                            <select className={field} value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}>
                                <option value="poster">Poster</option>
                                <option value="brochure">Brochure</option>
                            </select>
                        </div>
                        <div>
                            <label className={label}>posted on *</label>
                            <input type="date" className={field} value={form.posted_on} onChange={(e) => setForm((f) => ({ ...f, posted_on: e.target.value }))} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={label}>description</label>
                            <textarea className={`${field} min-h-[60px]`} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional caption" />
                        </div>
                        {!editing?.id && (
                            <div className="md:col-span-2">
                                <label className={label}>file * (PDF or image)</label>
                                <label className="mt-1 flex cursor-pointer items-center gap-3 border border-dashed border-brand-purple/50 px-4 py-4 text-brand-purple transition-colors hover:bg-brand-purple/10">
                                    {file ? (
                                        filePicked.isPdf ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />
                                    ) : (
                                        <Upload className="h-5 w-5" />
                                    )}
                                    <span className="truncate text-xs">{file ? `${file.name} (${(file.size / 1024).toFixed(0)} KB)` : "Choose a PDF or JPG/PNG/WEBP"}</span>
                                    <input type="file" accept={ACCEPT} onChange={pickFile} className="hidden" />
                                </label>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
                        <button type="button" onClick={cancel} className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">Cancel</button>
                        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-brand-purple px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50">
                            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} {editing?.id ? "Update" : "Post"}
                        </button>
                    </div>
                </form>
            )}

            {/* ---------- Items list, grouped by day ---------- */}
            {loading ? (
                <div className="border border-dashed border-border py-16 text-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground animate-blink">syncing...</span>
                </div>
            ) : groups.length === 0 ? (
                <div className="border border-dashed border-border py-16 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">// nothing posted yet. upload the first one.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {groups.map((group) => (
                        <div key={group.day}>
                            <div className="mb-3 flex items-center gap-4">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-purple">{formatDay(group.day, { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</span>
                                <span className="h-px flex-1 bg-border" />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {group.items.map((it) => {
                                    const pdf = isPdf(it);
                                    return (
                                        <div key={it.id} className="flex flex-col border border-border bg-card">
                                            <div className="flex h-36 items-center justify-center overflow-hidden bg-background">
                                                {pdf ? (
                                                    <FileText className="h-12 w-12 text-brand-pink" strokeWidth={1.25} />
                                                ) : (
                                                    <img src={it.file_url} alt={it.title} className="h-full w-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] uppercase tracking-[0.15em] ${it.kind === "brochure" ? "text-brand-pink" : "text-brand-purple"}`}>{it.kind}</span>
                                                    <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">· {pdf ? "pdf" : "image"}</span>
                                                </div>
                                                <div className="mt-1 truncate text-sm font-semibold">{it.title}</div>
                                                <div className="mt-3 flex gap-2">
                                                    <a href={it.file_url} target="_blank" rel="noopener noreferrer" className="flex h-8 items-center border border-border px-3 text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple">Open</a>
                                                    <button onClick={() => startEdit(it)} className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                                                    <button onClick={() => onDelete(it)} className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-pink hover:text-brand-pink" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
