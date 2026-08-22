import { useEffect, useState } from "react";
import { db } from "@/api/dataClient";
import { useToast } from "@/components/ui/use-toast";
import AnnouncementForm from "./AnnouncementForm";
import AnnouncementList from "./AnnouncementList";
import { Plus } from "lucide-react";

export default function AdminAnnouncements() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { toast } = useToast();

    const load = () => {
        setLoading(true);
        db.entities.Announcement.list("-created_date", 200)
            .then((d) => { setItems(d || []); setLoading(false); })
            .catch(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const onSaved = () => { setEditing(null); setShowForm(false); load(); };
    const onDelete = async (a) => {
        if (!window.confirm(`Delete announcement "${a.title}"?`)) return;
        try {
            await db.entities.Announcement.delete(a.id);
            toast({ title: "Announcement deleted" });
            load();
        } catch (err) {
            toast({ title: "Delete failed", description: String(err?.message || err), variant: "destructive" });
        }
    };

    return (
        <div>
            <div className="mb-6 flex justify-end">
                {!showForm && (
                    <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-brand-purple px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink">
                        <Plus className="h-4 w-4" /> New Announcement
                    </button>
                )}
            </div>
            {showForm && (
                <div className="mb-10">
                    <AnnouncementForm editing={editing} onSaved={onSaved} onCancel={() => { setEditing(null); setShowForm(false); }} />
                </div>
            )}
            <div className="mb-6 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">// announcements · {items.length}</span>
                {loading && <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground animate-blink">syncing...</span>}
            </div>
            <AnnouncementList items={items} onEdit={(a) => { setEditing(a); setShowForm(true); }} onDelete={onDelete} />
        </div>
    );
}
