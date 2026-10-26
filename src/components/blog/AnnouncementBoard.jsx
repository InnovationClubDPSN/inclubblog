import { Megaphone, Pin } from "lucide-react";

// Active = not expired. Pinned announcements float to the top, then newest first.
export function activeAnnouncements(list) {
    const now = new Date();
    return (list || [])
        .filter((a) => !a.expires_at || new Date(a.expires_at) > now)
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.created_date) - new Date(a.created_date));
}

export default function AnnouncementBoard({ items = [] }) {
    const active = activeAnnouncements(items);
    if (!active.length) return null;

    return (
        <section className="border-b border-border bg-background">
            <div className="mx-auto max-w-7xl space-y-3 px-4 py-10 md:px-8">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    <Megaphone className="h-3.5 w-3.5 text-brand-purple" />
                    Announcements
                </div>
                {active.map((a) => (
                    <div
                        key={a.id}
                        className={`border p-4 md:p-5 ${a.pinned ? "border-brand-pink/50 bg-brand-pink/5" : "border-border bg-card"}`}
                    >
                        <div className="flex items-center gap-2">
                            {a.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-brand-pink" />}
                            <span className="text-sm font-bold md:text-base">{a.title}</span>
                            <span className="ml-auto shrink-0 text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                                {new Date(a.created_date).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-foreground/90 md:text-sm">{a.body}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
