import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Download, Eye, FileText, Globe, Image as ImageIcon, Layers, ShieldCheck, X } from "lucide-react";
import { db } from "@/api/dataClient";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import Reveal from "@/components/blog/Reveal";
import Marquee from "@/components/blog/Marquee";
import Lightbox from "@/components/blog/Lightbox";
import {
    normalizeSettings,
    formatDay,
    eventDayLabel,
    isPdf,
    groupByDay,
} from "@/lib/cyberWeek";

const FILTERS = [
    { id: "all", label: "All" },
    { id: "brochure", label: "Brochures" },
    { id: "poster", label: "Posters" },
];

function displayUrl(url) {
    return String(url || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export default function CyberWeek() {
    const [settings, setSettings] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [pdfItem, setPdfItem] = useState(null);

    useEffect(() => {
        let active = true;
        Promise.allSettled([
            db.entities.CyberWeekSettings.list(null, 1),
            db.entities.CyberWeekItem.list("posted_on", 500),
        ]).then(([s, i]) => {
            if (!active) return;
            setSettings(normalizeSettings(s.status === "fulfilled" ? s.value?.[0] : null));
            setItems(i.status === "fulfilled" ? i.value || [] : []);
            setLoading(false);
        });
        return () => { active = false; };
    }, []);

    // Timeline reads oldest day first, so Day 01 comes first.
    const sorted = useMemo(
        () => [...items].sort((a, b) => (a.posted_on || "").localeCompare(b.posted_on || "") || (a.created_date || "").localeCompare(b.created_date || "")),
        [items]
    );

    const counts = useMemo(() => ({
        all: sorted.length,
        brochure: sorted.filter((i) => i.kind === "brochure").length,
        poster: sorted.filter((i) => i.kind === "poster").length,
    }), [sorted]);

    const visible = useMemo(
        () => (filter === "all" ? sorted : sorted.filter((i) => i.kind === filter)),
        [sorted, filter]
    );

    const groups = useMemo(() => groupByDay(visible), [visible]);

    // Only image items go into the lightbox; PDFs open in their own viewer.
    const imageItems = useMemo(() => visible.filter((i) => !isPdf(i)), [visible]);
    const lightboxImages = useMemo(
        () => imageItems.map((i) => ({ src: i.file_url, alt: i.title, caption: i.title })),
        [imageItems]
    );

    const daysPosted = useMemo(() => new Set(sorted.map((i) => i.posted_on)).size, [sorted]);

    // Admins can disable the section at any time; the page then leaves entirely.
    if (!loading && settings && !settings.enabled) return <Navigate to="/" replace />;

    const s = settings || normalizeSettings(null);

    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />

            {/* ---------- Hero ---------- */}
            <header className="cw-banner relative overflow-hidden border-b border-border blueprint-grid pt-32 md:pt-40">
                <div aria-hidden="true" className="cw-orb cw-orb-a" />
                <div aria-hidden="true" className="cw-orb cw-orb-b" />

                <div className="relative mx-auto max-w-7xl px-4 pb-20 md:px-8 md:pb-28">
                    <span className="mb-6 inline-flex items-center gap-2 border border-brand-pink/60 bg-brand-pink/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-brand-pink">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        // innovation club · dps newtown
                    </span>

                    <h1 className="font-heading text-6xl font-extrabold uppercase leading-[0.88] tracking-tight md:text-8xl">
                        <span className="block text-foreground">Cyber</span>
                        <span className="cw-title-grad block">Awareness</span>
                        <span className="block text-foreground">Week</span>
                    </h1>

                    <p className="mt-8 font-mono text-sm uppercase tracking-[0.25em] text-muted-foreground md:text-base">
                        <span className="text-brand-purple">{formatDay(s.starts_on, { day: "2-digit", month: "short" })}</span>
                        {" "}&mdash;{" "}
                        <span className="text-brand-pink">{formatDay(s.ends_on, { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </p>

                    <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                        Threats, defences and a few surprises. New brochures and posters land here every day, so check back often.
                    </p>

                    <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        <a
                            href={s.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cw-cta group inline-flex items-center gap-3 bg-brand-pink px-7 py-4 font-mono text-sm font-bold uppercase tracking-[0.2em] text-white glow-pink transition-all duration-300 hover:-translate-y-1 hover:bg-brand-purple hover:glow-purple"
                        >
                            <Globe className="h-4 w-4" />
                            Official website
                            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </a>
                        <span className="font-mono text-xs tracking-wider text-muted-foreground">{displayUrl(s.website_url)}</span>
                    </div>

                    <div className="mt-14 grid grid-cols-3 gap-px border border-border bg-border">
                        {[
                            { label: "Brochures", value: counts.brochure, color: "text-brand-pink", Icon: FileText },
                            { label: "Posters", value: counts.poster, color: "text-brand-purple", Icon: ImageIcon },
                            { label: "Days posted", value: daysPosted, color: "text-foreground", Icon: CalendarDays },
                        ].map(({ label, value, color, Icon }) => (
                            <div key={label} className="flex flex-col gap-2 bg-card/80 p-5 backdrop-blur md:p-7">
                                <Icon className={`h-4 w-4 ${color}`} />
                                <span className={`font-heading text-3xl font-extrabold md:text-5xl ${color}`}>
                                    {loading ? "--" : String(value).padStart(2, "0")}
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <Marquee
                className="border-b border-border bg-card/40 py-5"
                items={["Threats", "Defences", "Surprises", "Stay Alert", "Think Before You Click"]}
            />

            {/* ---------- Filters + timeline ---------- */}
            <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
                <div className="mb-14 flex flex-wrap items-center justify-between gap-6">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">// archive</span>
                        <h2 className="mt-2 font-heading text-3xl font-extrabold uppercase tracking-tight md:text-4xl">Brochures &amp; Posters</h2>
                    </div>
                    <div className="flex gap-px border border-border bg-border">
                        {FILTERS.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                                    filter === f.id ? "bg-brand-purple text-black" : "bg-card text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {f.label} <span className="opacity-70">{counts[f.id]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="border border-dashed border-border py-28 text-center">
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">// loading transmissions...</span>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="border border-dashed border-border py-28 text-center">
                        <Layers className="mx-auto mb-4 h-6 w-6 text-brand-purple" />
                        <p className="text-sm text-muted-foreground">// nothing posted yet. check back soon.</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* vertical timeline rail */}
                        <div aria-hidden="true" className="absolute bottom-0 left-3 top-0 w-px bg-gradient-to-b from-brand-purple via-brand-pink to-transparent md:left-4" />

                        <div className="space-y-20">
                            {groups.map((group) => {
                                const dayLabel = eventDayLabel(group.day, s.starts_on, s.ends_on);
                                return (
                                    <Reveal key={group.day}>
                                        <div className="relative pl-10 md:pl-14">
                                            <span aria-hidden="true" className="absolute left-[7px] top-3 h-3 w-3 rotate-45 bg-brand-pink glow-pink md:left-[11px]" />

                                            <div className="mb-8 flex flex-wrap items-end gap-x-6 gap-y-2">
                                                {dayLabel && (
                                                    <span className="cw-title-grad font-heading text-4xl font-extrabold uppercase leading-none md:text-5xl">{dayLabel}</span>
                                                )}
                                                <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-purple md:text-sm">
                                                    {formatDay(group.day, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                                                </span>
                                                <span className="mb-1 hidden h-px flex-1 bg-border sm:block" />
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                                {group.items.map((item) => {
                                                    const pdf = isPdf(item);
                                                    const isBrochure = item.kind === "brochure";
                                                    const imgIdx = pdf ? -1 : imageItems.findIndex((i) => i.id === item.id);
                                                    return (
                                                        <article
                                                            key={item.id}
                                                            className="group relative flex flex-col overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-purple/60 hover:shadow-[0_0_34px_rgba(100,65,255,0.28)]"
                                                        >
                                                            <div className="relative aspect-[3/4] overflow-hidden bg-background">
                                                                {pdf ? (
                                                                    <div className="cw-pdf-face flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
                                                                        <FileText className="h-16 w-16 text-brand-pink transition-transform duration-500 group-hover:scale-110" strokeWidth={1.25} />
                                                                        <span className="font-heading text-2xl font-extrabold uppercase tracking-tight text-foreground">PDF</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setPdfItem(item)}
                                                                            className="inline-flex items-center gap-2 border border-brand-purple/60 bg-brand-purple/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black"
                                                                        >
                                                                            <Eye className="h-3.5 w-3.5" /> Preview
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setLightboxIndex(imgIdx)}
                                                                        aria-label={`View ${item.title}`}
                                                                        className="block h-full w-full"
                                                                    >
                                                                        <img
                                                                            src={item.file_url}
                                                                            alt={item.title}
                                                                            loading="lazy"
                                                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                        />
                                                                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
                                                                            <Eye className="h-6 w-6 text-white" />
                                                                        </span>
                                                                    </button>
                                                                )}

                                                                <span
                                                                    className={`absolute left-3 top-3 border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur ${
                                                                        isBrochure
                                                                            ? "border-brand-pink/70 bg-black/60 text-brand-pink"
                                                                            : "border-brand-purple/70 bg-black/60 text-brand-purple"
                                                                    }`}
                                                                >
                                                                    {isBrochure ? "Brochure" : "Poster"}
                                                                </span>
                                                            </div>

                                                            <div className="flex flex-1 flex-col gap-2 p-5">
                                                                <h3 className="text-sm font-bold uppercase leading-snug tracking-tight md:text-base">{item.title}</h3>
                                                                {item.description && (
                                                                    <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                                                                )}
                                                                <div className="mt-auto flex items-center gap-2 pt-4">
                                                                    <a
                                                                        href={item.file_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex flex-1 items-center justify-center gap-2 border border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-brand-pink hover:text-brand-pink"
                                                                    >
                                                                        <Download className="h-3.5 w-3.5" /> {pdf ? "Open PDF" : "Full size"}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </Reveal>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>

            {/* ---------- Closing CTA ---------- */}
            <section className="relative overflow-hidden border-t border-border blueprint-grid">
                <div aria-hidden="true" className="cw-orb cw-orb-b" />
                <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-24 text-center md:px-8">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">// want the full picture?</span>
                    <h2 className="font-heading text-4xl font-extrabold uppercase tracking-tight md:text-6xl">
                        Head to the <span className="cw-title-grad">official site</span>
                    </h2>
                    <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                        Schedules, speakers and everything else for the week live on the official Cyber Awareness Week website.
                    </p>
                    <a
                        href={s.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cw-cta group inline-flex items-center gap-3 bg-brand-purple px-7 py-4 font-mono text-sm font-bold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:-translate-y-1 hover:bg-brand-pink hover:text-white"
                    >
                        {displayUrl(s.website_url)}
                        <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </a>
                </div>
            </section>

            <Footer />

            <Lightbox
                images={lightboxImages}
                index={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
                onNavigate={setLightboxIndex}
            />

            {pdfItem && <PdfViewer item={pdfItem} onClose={() => setPdfItem(null)} />}
        </div>
    );
}

// In-page PDF viewer. Some browsers block PDFs inside frames, so "Open in new tab" is always offered.
function PdfViewer({ item, onClose }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm md:p-8" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="flex h-full max-h-[92vh] w-full max-w-5xl flex-col border border-brand-purple/50 bg-card shadow-[0_0_60px_rgba(100,65,255,0.3)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                    <span className="truncate text-xs font-bold uppercase tracking-tight">{item.title}</span>
                    <div className="flex shrink-0 items-center gap-2">
                        <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:border-brand-pink hover:text-brand-pink">
                            <ArrowUpRight className="h-3 w-3" /> New tab
                        </a>
                        <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:border-brand-pink hover:text-brand-pink">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <iframe title={item.title} src={item.file_url} className="h-[75vh] w-full flex-1 bg-white" />
            </div>
        </div>
    );
}
