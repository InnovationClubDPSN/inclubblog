import { useEffect, useState } from "react";
import { db } from "@/api/dataClient";
import { useToast } from "@/components/ui/use-toast";
import DomainForm from "./DomainForm";
import DomainList from "./DomainList";
import { Plus } from "lucide-react";

export default function AdminDomains() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { toast } = useToast();

    const load = () => {
        setLoading(true);
        db.entities.Domain.list("name", 100).then((d) => { setItems(d || []); setLoading(false); }).catch(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const onSaved = () => { setEditing(null); setShowForm(false); load(); };
    const onDelete = async (d) => {
        if (!window.confirm(`Delete domain "${d.name}"?`)) return;
        try {
            await db.entities.Domain.delete(d.id);
            toast({ title: "Domain deleted" });
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
                        <Plus className="h-4 w-4" /> New Domain
                    </button>
                )}
            </div>
            {showForm && (
                <div className="mb-10">
                    <DomainForm editing={editing} onSaved={onSaved} onCancel={() => { setEditing(null); setShowForm(false); }} />
                </div>
            )}
            <div className="mb-6 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">// domains · {items.length}</span>
                {loading && <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground animate-blink">syncing...</span>}
            </div>
            <DomainList items={items} onEdit={(d) => { setEditing(d); setShowForm(true); }} onDelete={onDelete} />
        </div>
    );
}