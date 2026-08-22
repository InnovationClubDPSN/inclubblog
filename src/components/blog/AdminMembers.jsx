import { useEffect, useState } from "react";
import { db } from "@/api/dataClient";
import { useToast } from "@/components/ui/use-toast";
import MemberForm from "./MemberForm";
import MemberList from "./MemberList";
import MemberCsvImport from "./MemberCsvImport";
import { Plus, Upload } from "lucide-react";

export default function AdminMembers() {
    const [items, setItems] = useState([]);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showCsv, setShowCsv] = useState(false);
    const { toast } = useToast();

    const load = () => {
        setLoading(true);
        db.entities.Member.list("name", 100).then((d) => { setItems(d || []); setLoading(false); }).catch(() => setLoading(false));
    };
    useEffect(() => {
        load();
        db.entities.Domain.list("name", 100).then((d) => setDomains(d || [])).catch(() => {});
    }, []);

    const onSaved = () => { setEditing(null); setShowForm(false); load(); };
    const onDelete = async (m) => {
        if (!window.confirm(`Remove "${m.name}"?`)) return;
        try {
            await db.entities.Member.delete(m.id);
            toast({ title: "Member removed" });
            load();
        } catch (err) {
            toast({ title: "Delete failed", description: String(err?.message || err), variant: "destructive" });
        }
    };

    return (
        <div>
            <div className="mb-6 flex flex-wrap justify-end gap-3">
                {!showForm && (
                    <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-brand-purple px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink">
                        <Plus className="h-4 w-4" /> New Member
                    </button>
                )}
                <button onClick={() => setShowCsv((v) => !v)} className={`flex items-center gap-2 border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${showCsv ? "border-brand-pink text-brand-pink" : "border-border text-foreground hover:border-brand-purple hover:text-brand-purple"}`}>
                    <Upload className="h-4 w-4" /> Bulk CSV
                </button>
            </div>
            {showCsv && (
                <MemberCsvImport onDone={load} />
            )}
            {showForm && (
                <div className="mb-10">
                    <MemberForm editing={editing} domains={domains} onSaved={onSaved} onCancel={() => { setEditing(null); setShowForm(false); }} />
                </div>
            )}
            <div className="mb-6 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">// members · {items.length}</span>
                {loading && <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground animate-blink">syncing...</span>}
            </div>
            <MemberList items={items} onEdit={(m) => { setEditing(m); setShowForm(true); }} onDelete={onDelete} />
        </div>
    );
}