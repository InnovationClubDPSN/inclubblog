import ReactMarkdown from "react-markdown";
import { Megaphone, Pin, ArrowUpRight } from "lucide-react";

// Active = not expired. Pinned announcements float to the top, then newest first.
export function activeAnnouncements(list) {
    const now = new Date();
    return (list || [])
        .filter((a) => !a.expires_at || new Date(a.expires_at) > now)
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.created_date) - new Date(a.created_date));
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Markdown element overrides. Everything renders as React nodes (no raw HTML),
// so announcement text can't inject markup. Links open in a new tab.
const mdComponents = {
    p: ({ node: _n, ...props }) => <p className="ann-p" {...props} />,
    strong: ({ node: _n, ...props }) => <strong className="ann-strong" {...props} />,
    em: ({ node: _n, ...props }) => <em className="ann-em" {...props} />,
    a: ({ node: _n, ...props }) => <a className="ann-link" target="_blank" rel="noopener noreferrer" {...props} />,
    ul: ({ node: _n, ...props }) => <ul className="ann-ul" {...props} />,
    ol: ({ node: _n, ...props }) => <ol className="ann-ol" {...props} />,
    li: ({ node: _n, ...props }) => <li className="ann-li" {...props} />,
    code: ({ node: _n, ...props }) => <code className="ann-code" {...props} />,
};

export function AnnouncementCard({ a, index = 0 }) {
    const isNew = Date.now() - new Date(a.created_date).getTime() < DAY_MS;

    return (
        <article
            className={`ann-enter group relative ${a.pinned ? "ann-pinned" : "ann-plain"}`}
            style={{ animationDelay: `${index * 140}ms` }}
        >
            <div className="ann-inner relative h-full overflow-hidden bg-card p-5 md:p-7">
                <span aria-hidden="true" className="ann-sheen" />

                <div className="flex flex-wrap items-center gap-3">
                    {a.pinned ? (
                        <span className="inline-flex items-center gap-1.5 border border-brand-pink/60 bg-brand-pink/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-brand-pink">
                            <Pin className="h-3 w-3" /> pinned
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 border border-brand-purple/50 bg-brand-purple/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-brand-purple">
                            <Megaphone className="h-3 w-3" /> notice
                        </span>
                    )}
                    {isNew && (
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-brand-pink">
                            <span className="ann-live-dot inline-block h-1.5 w-1.5 rounded-full bg-brand-pink" />
                            new
                        </span>
                    )}
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {new Date(a.created_date).toLocaleDateString()}
                    </span>
                </div>

                <h3 className={`mt-4 font-heading text-2xl font-extrabold uppercase leading-[1.05] tracking-tight md:text-4xl ${a.pinned ? "ann-title-shine" : "text-foreground"}`}>
                    {a.title}
                </h3>

                <div className="ann-body mt-4 text-sm leading-relaxed text-foreground/90 md:text-base">
                    <ReactMarkdown components={mdComponents}>{a.body || ""}</ReactMarkdown>
                </div>

                {a.expires_at && (
                    <div className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        <ArrowUpRight className="h-3 w-3 text-brand-purple" />
                        expires {new Date(a.expires_at).toLocaleString()}
                    </div>
                )}
            </div>
        </article>
    );
}
