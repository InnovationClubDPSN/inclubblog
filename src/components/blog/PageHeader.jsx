// Cycled per word so a multi-word title stays visually distinguishable even
// though the words are set tight/conjoined by design -- colour does the
// separating instead of spacing.
const WORD_COLORS = ["text-foreground", "text-brand-purple", "text-brand-pink"];

export default function PageHeader({ kicker, title, subtitle }) {
    const words = String(title || "").split(" ");
    return (
        <header className="relative overflow-hidden border-b border-border blueprint-grid pt-20">
            <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-brand-purple/20 blur-[120px]" />
            <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-brand-pink/15 blur-[120px]" />
            {/* fade the grid out toward the bottom so the page flows into content */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
                <span className="inline-flex animate-fade-up items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-brand-pink">
                    <span className="h-px w-8 bg-brand-pink" />
                    {kicker}
                    <span className="animate-blink">▋</span>
                </span>
                <h1 className="mt-5 max-w-4xl text-4xl font-extrabold uppercase leading-[0.95] tracking-tight md:text-7xl">
                    {words.map((w, i) => (
                        <span
                            key={i}
                            className={`word-rise mr-[0.28em] ${WORD_COLORS[i % WORD_COLORS.length]}`}
                            style={{ animationDelay: `${0.15 + i * 0.06}s` }}
                        >
                            {w}{" "}
                        </span>
                    ))}
                </h1>
                {subtitle && (
                    <p
                        className="mt-6 max-w-2xl animate-fade-up border-l-2 border-brand-purple/60 pl-4 text-sm leading-relaxed text-muted-foreground md:text-base"
                        style={{ animationDelay: `${0.3 + words.length * 0.06}s` }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-purple/70 to-transparent" />
        </header>
    );
}
