import { Pencil, Trash2 } from "lucide-react";

export default function PostList({ posts, onEdit, onDelete }) {
    if (!posts.length) {
        return (
            <div className="border border-dashed border-border py-16 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    // no posts yet. publish your first.
                </p>
            </div>
        );
    }

    return (
        <div className="border border-border bg-border">
            {posts.map((p, i) => (
                <div
                    key={p.id}
                    className="flex items-center gap-4 border-b border-border bg-card px-4 py-3 last:border-0"
                >
          <span className="text-[10px] text-muted-foreground">
            {String(i + 1).padStart(2, "0")}
          </span>
                    <span className="hidden w-32 shrink-0 border border-brand-purple/30 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-brand-purple sm:inline-block">
            {p.category}
          </span>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{p.title}</div>
                        <div className="truncate text-[10px] text-muted-foreground">
                            /{p.slug} · {p.read_time}m{p.featured ? " · featured" : ""}
                        </div>
                    </div>
                    <button
                        onClick={() => onEdit(p)}
                        className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple"
                        aria-label="Edit"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(p)}
                        className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-pink hover:text-brand-pink"
                        aria-label="Delete"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            ))}
        </div>
    );
}