import { ArrowDown } from "lucide-react";
import Counter from "@/components/blog/Counter";
import DecorArt from "@/components/blog/DecorArt";

export default function Hero({ featured, stats }) {
    const s = stats || {};
    const lines = [
        { t: "Innovation", cls: "text-foreground", d: "0.15s" },
        { t: "Club", cls: "text-brand-purple text-glow-purple", d: "0.3s" },
    ];
    const blocks = [
        { v: s.posts ?? 0, l: "posts" },
        { v: s.members ?? 0, l: "members" },
        { v: s.domains ?? 0, l: "domains" },
    ];

    return (
        <section className="relative min-h-screen w-full overflow-hidden border-b border-border blueprint-grid pt-16">
            <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-brand-purple/20 blur-[120px]" />
            <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-brand-pink/15 blur-[120px]" />

            <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-0 px-4 md:grid-cols-12 md:px-8">
                <div className="flex flex-col justify-center py-16 md:col-span-8 md:py-24">
          <span className="fade-up mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brand-pink" style={{ animationDelay: "0.05s" }}>
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-brand-pink" />
            New articles, updated live
          </span>

                    <h1 className="font-heading text-[14vw] font-extrabold uppercase leading-[0.85] tracking-tight md:text-[8rem]">
                        {lines.map((l, i) => (
                            <span key={i} className="block overflow-hidden">
                <span className={`hero-line ${l.cls}`} style={{ animationDelay: l.d }}>{l.t}</span>
              </span>
                        ))}
                    </h1>

                    <p className="fade-up mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-brand-pink" style={{ animationDelay: "0.6s" }}>Empowering Innovators of Tomorrow.</p>
                    <p className="fade-up mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base" style={{ animationDelay: "0.75s" }}>Where curiosity inspires discovery and innovation transforms ideas into meaningful solutions through research, technology, and collaboration.</p>

                    <div className="fade-up mt-10 flex flex-wrap items-center gap-4" style={{ animationDelay: "0.9s" }}>
                        <a href="#feed" className="group flex items-center gap-2 bg-brand-purple px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-brand-pink">
                            Enter the Feed
                            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                        </a>
                        <a href="#archive" className="border border-border px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-brand-purple hover:text-brand-purple">
                            Query Archive
                        </a>
                    </div>
                </div>

                <div className="fade-up flex flex-col justify-end border-t border-border py-10 md:col-span-4 md:border-l md:border-t-0 md:py-24 md:pl-8" style={{ animationDelay: "1.05s" }}>
                    <DecorArt variant="orbit" className="mb-6 w-28 opacity-70" />
                    <span className="mb-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Latest article</span>
                    {featured ? (
                        <a href="#feed" className="group block border border-border bg-card p-5 transition-colors hover:border-brand-purple/40">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-brand-pink">latest · {featured.category}</span>
                            <h3 className="mt-2 text-base font-bold leading-snug">{featured.title}</h3>
                            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{featured.subtitle}</p>
                        </a>
                    ) : (
                        <div className="border border-border bg-card p-5 text-xs text-muted-foreground">Loading…</div>
                    )}

                    <div className="mt-6 grid grid-cols-3 gap-px border border-border bg-border">
                        {blocks.map((b) => (
                            <div key={b.l} className="bg-card p-3 text-center">
                                <div className="text-xl font-bold text-brand-purple">
                                    <Counter value={b.v} pad={2} />
                                </div>
                                <div className="mt-1 text-[9px] uppercase tracking-[0.15em] text-muted-foreground">{b.l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </section>
    );
}