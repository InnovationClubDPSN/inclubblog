import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import { activeAnnouncements, AnnouncementCard } from "@/components/blog/AnnouncementBoard";
import DecorArt from "@/components/blog/DecorArt";

// Strip markdown syntax and links so the preview reads as plain text.
function excerpt(md) {
    return (md || "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[*_`#>]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export default function AnnouncementPreview({ items = [] }) {
    const [open, setOpen] = useState(false);
    const [origin, setOrigin] = useState("50% 50%");
    const list = activeAnnouncements(items);
    const top = list[0];

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    // No active announcements: keep the decorative art that was here before.
    if (!top) return <DecorArt variant="orbit" className="mb-6 w-28 opacity-70" />;

    const onOpen = (e) => {
        // Zoom the overlay out of the preview's position on screen.
        const r = e.currentTarget.getBoundingClientRect();
        const x = ((r.left + r.width / 2) / window.innerWidth) * 100;
        const y = ((r.top + r.height / 2) / window.innerHeight) * 100;
        setOrigin(`${x}% ${y}%`);
        setOpen(true);
    };

    return (
        <>
            <button type="button" onClick={onOpen} className="group ann-preview mb-6 block w-full text-left" aria-label="Open announcements">
                <div className={top.pinned ? "ann-pinned" : "ann-plain"}>
                    <div className="relative overflow-hidden bg-card p-5">
                        <span aria-hidden="true" className="ann-sheen" />
                        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em]">
                            <span className="ann-live-dot inline-block h-1.5 w-1.5 rounded-full bg-brand-pink" />
                            <span className="text-brand-pink">live</span>
                            <span className="text-muted-foreground">/ announcements</span>
                            <span className="ml-auto text-muted-foreground">{String(list.length).padStart(2, "0")} active</span>
                        </div>
                        <h3 className={`mt-3 font-heading text-lg font-extrabold uppercase leading-tight ${top.pinned ? "ann-title-shine" : "text-foreground"}`}>
                            {top.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{excerpt(top.body)}</p>
                        <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-brand-purple">
                            <span>{list.length > 1 ? `+${list.length - 1} more · ` : ""}open</span>
                            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                    </div>
                </div>
            </button>

            {open && createPortal(
                <div
                    className="ann-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
                    onClick={() => setOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Announcements"
                >
                    <div
                        className="ann-modal-panel relative max-h-[88vh] w-full max-w-3xl overflow-y-auto border border-brand-purple/40 bg-background shadow-2xl"
                        style={{ transformOrigin: origin }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-5 py-3 backdrop-blur">
                            <span className="ann-live-dot inline-block h-2 w-2 rounded-full bg-brand-pink" />
                            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-foreground">
                                <span className="text-brand-pink">Live</span> / Announcements
                            </span>
                            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                {String(list.length).padStart(2, "0")} active
                            </span>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Close announcements"
                                className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-pink hover:text-brand-pink"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-6 p-5 md:p-8">
                            {list.map((a, i) => (
                                <AnnouncementCard key={a.id} a={a} index={i} />
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
