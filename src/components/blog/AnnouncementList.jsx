import { Pencil, Trash2, Pin } from "lucide-react";

export default function AnnouncementList({ items, onEdit, onDelete }) {
    if (!items.length) {
        return (
            <div className="border border-dashed border-border py-16 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    // no announcements yet. post one.
                </p>
            </div>
        );
    }
    return (
        <div className="border border-border bg-border">
            {items.map((a) => {
                const expired = a.expires_at && new Date(a.expires_at) < new Date();
                return (
                    <div key={a.id} className="flex items-start gap-4 border-b border-border bg-card px-4 py-3 last:border-0">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                {a.pinned && <Pin className="h-3 w-3 shrink-0 text-brand-pink" />}
                                <span className="truncate text-sm font-semibold">{a.title}</span>
                                {expired && <span className="shrink-0 border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-muted-foreground">expired</span>}
                            </div>
                            <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{a.body}</p>
                            <div className="mt-1 text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70">
                                {new Date(a.created_date).toLocaleString()}
                                {a.expires_at && ` · expires ${new Date(a.expires_at).toLocaleString()}`}
                            </div>
                        </div>
                        <button onClick={() => onEdit(a)} className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple" aria-label="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => onDelete(a)} className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-pink hover:text-brand-pink" aria-label="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
