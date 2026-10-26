import { Link } from "react-router-dom";
import { ArrowUpRight, Zap } from "lucide-react";
import { FALLBACK_POSTER, formatDay } from "@/lib/cyberWeek";

export default function CyberWeekBanner({ posterUrl, startsOn, endsOn }) {
    const poster = posterUrl || FALLBACK_POSTER;
    const from = formatDay(startsOn, { day: "2-digit", month: "short" });
    const to = formatDay(endsOn, { day: "2-digit", month: "short", year: "numeric" });

    return (
        <section className="cw-banner relative overflow-hidden border-b border-border bg-background blueprint-grid">
            <div aria-hidden="true" className="cw-orb cw-orb-a" />
            <div aria-hidden="true" className="cw-orb cw-orb-b" />

            <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 md:grid-cols-12 md:gap-16 md:px-8 md:py-24">
                <div className="flex justify-center md:col-span-5">
                    <div className="cw-float cw-poster-wrap w-full max-w-sm">
                        <span aria-hidden="true" className="cw-poster-ring" />
                        <img
                            src={poster}
                            alt="Cyber Awareness Week poster by Innovation Club, DPS Newtown"
                            loading="lazy"
                            className="relative block w-full rounded-2xl border border-white/10 shadow-2xl"
                        />
                    </div>
                </div>

                <div className="md:col-span-7">
                    <span className="mb-6 inline-flex items-center gap-2 border border-brand-pink/60 bg-brand-pink/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-brand-pink">
                        <Zap className="h-3.5 w-3.5" />
                        Innovation Club · DPS Newtown
                    </span>

                    <h2 className="font-heading text-5xl font-extrabold uppercase leading-[0.9] tracking-tight md:text-7xl">
                        <span className="block text-foreground">Cyber</span>
                        <span className="cw-title-grad block">Awareness</span>
                        <span className="block text-foreground">Week</span>
                    </h2>

                    {(from || to) && (
                        <p className="mt-6 font-mono text-sm uppercase tracking-[0.25em] text-muted-foreground md:text-base">
                            <span className="text-brand-purple">{from}</span> &mdash; <span className="text-brand-pink">{to}</span>
                        </p>
                    )}

                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
                        Threats, defences and a few surprises. Browse the brochures and posters as they go up, day by day.
                    </p>

                    <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        <Link
                            to="/cyber-week"
                            className="cw-cta group inline-flex items-center gap-3 bg-brand-pink px-7 py-4 font-mono text-sm font-bold uppercase tracking-[0.2em] text-white glow-pink transition-all duration-300 hover:-translate-y-1 hover:bg-brand-purple hover:glow-purple"
                        >
                            Check it out
                            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
