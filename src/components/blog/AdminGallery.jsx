import { useEffect, useState } from "react";
import { db } from "@/api/dataClient";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Save, X, Pencil, Trash2, Upload, Loader2 } from "lucide-react";

const MAX_IMAGES = 10;
const empty = { title: "", description: "", images: [] };

export default function AdminGallery() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(0);
    const { toast } = useToast();

    const load = () => {
        setLoading(true);
        db.entities.Gallery.list("-created_date", 100)
            .then((g) => { setItems(g || []); setLoading(false); })
            .catch(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const startNew = () => { setEditing(null); setForm(empty); setShowForm(true); };
    const startEdit = (g) => { setEditing(g); setForm({ title: g.title || "", description: g.description || "", images: Array.isArray(g.images) ? [...g.images] : [] }); setShowForm(true); };
    const cancel = () => { setEditing(null); setForm(empty); setShowForm(false); };

    const onFiles = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const room = MAX_IMAGES - form.images.length;
        if (room <= 0) {
            toast({ title: `Max ${MAX_IMAGES} images per entry`, variant: "destructive" });
            return;
        }
        const picked = files.slice(0, room);
        for (const file of picked) {
            setUploading((n) => n + 1);
            try {
                const { file_url } = await db.integrations.Core.UploadFile({ file });
                setForm((f) => ({ ...f, images: [...f.images, file_url] }));
            } catch (err) {
                toast({ title: "Upload failed", description: String(err?.message || err), variant: "destructive" });
            } finally {
                setUploading((n) => n - 1);
            }
        }
        e.target.value = "";
    };

    const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.title) { toast({ title: "Title is required", variant: "destructive" }); return; }
        if (!form.images.length) { toast({ title: "Add at least one image", variant: "destructive" }); return; }
        setSaving(true);
        try {
            if (editing?.id) {
                await db.entities.Gallery.update(editing.id, { ...form });
                toast({ title: "Gallery entry updated" });
            } else {
                await db.entities.Gallery.create({ ...form });
                toast({ title: "Gallery entry created" });
            }
            cancel();
            load();
        } catch (err) {
            toast({ title: "Save failed", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async (g) => {
        if (!window.confirm(`Delete "${g.title}"?`)) return;
        try {
            await db.entities.Gallery.delete(g.id);
            toast({ title: "Entry deleted" });
            load();
        } catch (err) {
            toast({ title: "Delete failed", description: String(err?.message || err), variant: "destructive" });
        }
    };

    const field = "w-full border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand-purple focus:outline-none";
    const label = "text-[10px] uppercase tracking-[0.2em] text-muted-foreground";

    return (
        <div>
            <div className="mb-6 flex justify-end">
                {!showForm && (
                    <button onClick={startNew} className="flex items-center gap-2 bg-brand-purple px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink">
                        <Plus className="h-4 w-4" /> New Entry
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={submit} className="mb-10 border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-5 py-3">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-pink">// {editing?.id ? "edit_entry" : "new_entry"}</span>
                        <button type="button" onClick={cancel} aria-label="Cancel"><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-5">
                        <div>
                            <label className={label}>title *</label>
                            <input className={field} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Robotics showcase 2026" />
                        </div>
                        <div>
                            <label className={label}>description</label>
                            <textarea className={`${field} min-h-[70px]`} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional caption" />
                        </div>
                        <div>
                            <label className={label}>images * · {form.images.length}/{MAX_IMAGES}</label>
                            <div className="flex flex-wrap gap-2">
                                {form.images.map((src, i) => (
                                    <div key={i} className="relative h-20 w-20 overflow-hidden border border-border">
                                        <img src={src} alt={`img ${i + 1}`} className="h-full w-full object-cover" />
                                        <button type="button" onClick={() => removeImage(i)} className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-background/80 text-brand-pink hover:bg-background">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                {form.images.length < MAX_IMAGES && (
                                    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-brand-purple/50 text-brand-purple transition-colors hover:bg-brand-purple/10">
                                        {uploading > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        <span className="text-[8px] uppercase tracking-[0.1em]">{uploading > 0 ? "uploading" : "add"}</span>
                                        <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
                        <button type="button" onClick={cancel} className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">Cancel</button>
                        <button type="submit" disabled={saving || uploading > 0} className="flex items-center gap-2 bg-brand-purple px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50">
                            <Save className="h-3 w-3" /> {editing?.id ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            )}

            <div className="mb-6 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">// gallery · {items.length}</span>
                {loading && <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground animate-blink">syncing...</span>}
            </div>

            {!items.length ? (
                <div className="border border-dashed border-border py-16 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">// no entries yet. create one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((g) => {
                        const imgs = Array.isArray(g.images) ? g.images : [];
                        return (
                            <div key={g.id} className="border border-border bg-card">
                                <div className="grid grid-cols-2 gap-0.5">
                                    {imgs.slice(0, 4).map((src, i) => (
                                        <img key={i} src={src} alt={g.title} className="h-28 w-full object-cover" />
                                    ))}
                                </div>
                                <div className="p-4">
                                    <div className="truncate text-sm font-semibold">{g.title}</div>
                                    <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-brand-purple">{imgs.length} images</div>
                                    <div className="mt-3 flex gap-2">
                                        <button onClick={() => startEdit(g)} className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                                        <button onClick={() => onDelete(g)} className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-pink hover:text-brand-pink" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}