// Cycled per word so a multi-word title stays visually distinguishable even
// though the words are set tight/conjoined by design (tracking-tight, no
// extra gap) -- colour does the separating instead of spacing.
const WORD_COLORS = ["text-foreground", "text-brand-purple", "text-brand-pink"];

export default function PageHeader({ kicker, title, subtitle }) {
    const words = String(title || "").split(" ");
    return (
        <header className="border-b border-border blueprint-grid pt-16">
            <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
        <span className="inline-block animate-fade-up text-[10px] uppercase tracking-[0.25em] text-brand-pink">
          {kicker}<span className="ml-1 animate-blink">▋</span>
        </span>
                <h1 className="mt-4 text-3xl font-bold uppercase leading-[0.95] tracking-tight md:text-6xl">
                    {words.map((w, i) => (
                        <span key={i} className={`word-rise ${WORD_COLORS[i % WORD_COLORS.length]}`} style={{ animationDelay: `${0.15 + i * 0.06}s` }}>{w} </span>
                    ))}
                </h1>
                {subtitle && (
                    <p
                        className="mt-6 max-w-2xl animate-fade-up text-base leading-relaxed text-muted-foreground"
                        style={{ animationDelay: `${0.3 + words.length * 0.06}s` }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>
        </header>
    );
}