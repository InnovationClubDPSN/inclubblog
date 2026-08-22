import { Pencil, Trash2 } from "lucide-react";

export default function DomainList({ items, onEdit, onDelete }) {
    if (!items.length) {
        return (
            <div className="border border-dashed border-border py-16 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    // no domains yet. create one.
                </p>
            </div>
        );
    }
    return (
        <div className="border border-border bg-border">
            {items.map((d, i) => (
                <div key={d.id} className="flex items-center gap-4 border-b border-border bg-card px-4 py-3 last:border-0">
                    <span className="text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{d.name}</div>
                        <div className="truncate text-[10px] text-muted-foreground">/{d.slug}{d.description ? ` · ${d.description}` : ""}</div>
                    </div>
                    <button onClick={() => onEdit(d)} className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple" aria-label="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onDelete(d)} className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-pink hover:text-brand-pink" aria-label="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            ))}
        </div>
    );
}