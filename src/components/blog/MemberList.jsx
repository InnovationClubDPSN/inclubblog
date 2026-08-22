import { Pencil, Trash2 } from "lucide-react";

export default function MemberList({ items, onEdit, onDelete }) {
    if (!items.length) {
        return (
            <div className="border border-dashed border-border py-16 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    // no members yet. add one.
                </p>
            </div>
        );
    }
    return (
        <div className="border border-border bg-border">
            {items.map((m, i) => (
                <div key={m.id} className="flex items-center gap-4 border-b border-border bg-card px-4 py-3 last:border-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-xs font-bold text-brand-purple">
                        {m.avatar ? (
                            <img src={m.avatar} alt={m.name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        ) : (
                            m.name?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{m.name}</div>
                        <div className="truncate text-[10px] text-muted-foreground">
                            {m.role}{m.domain ? ` · ${m.domain}` : ""}
                        </div>
                        {m.skills && (
                            <div className="mt-1 truncate text-[10px] text-muted-foreground/70">skills: {m.skills}</div>
                        )}
                    </div>
                    <button onClick={() => onEdit(m)} className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple" aria-label="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onDelete(m)} className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-pink hover:text-brand-pink" aria-label="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            ))}
        </div>
    );
}