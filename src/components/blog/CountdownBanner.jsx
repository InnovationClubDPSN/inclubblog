import { useEffect, useState } from "react";
import { ShieldAlert, Lock } from "lucide-react";

// 27 Oct 2026, 00:00 IST
const TARGET = new Date("2026-10-27T00:00:00+05:30").getTime();

const pad = (n) => String(n).padStart(2, "0");

function getRemaining() {
    const diff = Math.max(TARGET - Date.now(), 0);
    return {
        done: diff === 0,
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
    };
}

export default function CountdownBanner() {
    const [t, setT] = useState(getRemaining);

    useEffect(() => {
        const id = setInterval(() => setT(getRemaining()), 1000);
        return () => clearInterval(id);
    }, []);

    const units = [
        { v: t.d, l: "days" },
        { v: t.h, l: "hours" },
        { v: t.m, l: "mins" },
        { v: t.s, l: "secs" },
    ];

    return (
        <section className="relative overflow-hidden border-b border-border bg-card/40 blueprint-grid">
            <div className="pointer-events-none absolute -right-32 top-0 h-72 w-72 rounded-full bg-brand-purple/15 blur-[110px]" />
            <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 md:grid-cols-12 md:px-8 md:py-20">
                <div className="md:col-span-7">
                    <span className="mb-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brand-pink">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span className="h-1.5 w-1.5 animate-blink rounded-full bg-brand-pink" />
                        {t.done ? "Access granted" : "Incoming transmission · Coming soon"}
                    </span>

                    <h2 className="font-heading text-4xl font-extrabold uppercase leading-[0.95] tracking-tight md:text-6xl">
                        {t.done ? (
                            <span className="text-brand-purple text-glow-purple">It's live.</span>
                        ) : (
                            <>
                                Something is <span className="text-brand-purple text-glow-purple">loading</span>
                                <span className="animate-blink">_</span>
                            </>
                        )}
                    </h2>

                    <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm text-muted-foreground md:text-base">
                        <Lock className="h-4 w-4 text-brand-purple" />
                        <span>27.10.2026 &mdash; Cyber</span>
                        <span className="select-none rounded-sm bg-foreground/90 px-2 text-transparent" aria-label="redacted">██████</span>
                        <span>Week</span>
                    </p>
                    <p className="mt-3 max-w-lg text-xs leading-relaxed text-muted-foreground md:text-sm">
                        Threats, defences and a few surprises. Details are encrypted until the timer hits zero. Stay sharp.
                    </p>
                </div>

                <div className="md:col-span-5">
                    <div className="grid grid-cols-4 gap-px border border-border bg-border">
                        {units.map((u) => (
                            <div key={u.l} className="bg-card p-3 text-center md:p-5">
                                <div className="font-mono text-3xl font-bold tabular-nums text-brand-purple md:text-5xl">
                                    {pad(u.v)}
                                </div>
                                <div className="mt-2 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{u.l}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        &gt; decrypting<span className="animate-blink">...</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
