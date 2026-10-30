// Shared heading for homepage sections: numbered kicker, big title, optional
// right-aligned meta, and a gradient rule underneath.
export default function SectionHeading({ index, kicker, title, meta }) {
    return (
        <div className="relative mb-12 flex items-end justify-between gap-6 pb-6">
            <div>
                <span className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-brand-pink">
                    {index && <span className="border border-brand-pink/40 px-1.5 py-0.5">{index}</span>}
                    {kicker}
                </span>
                <h2 className="mt-3 text-3xl font-extrabold uppercase tracking-tight md:text-5xl">{title}</h2>
            </div>
            {meta && (
                <span className="hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:block">{meta}</span>
            )}
            <span className="absolute inset-x-0 bottom-0 h-px bg-border" />
            <span className="absolute bottom-0 left-0 h-px w-24 bg-gradient-to-r from-brand-purple to-brand-pink" />
        </div>
    );
}
