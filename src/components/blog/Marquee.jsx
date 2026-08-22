export default function Marquee({ items = [], className = "", separator = "/", speed = 26, repeat = 4 }) {
    // Repeat the sequence enough times (default 4x) so the track is always
    // wider than the viewport, then loop by exactly 1/repeat of the track
    // width. With only 2 copies, a short item list left the track narrower
    // than wide screens, so once the first copy scrolled past there was
    // nothing left to show until it wrapped -- a big blank gap right after
    // the last visible word (e.g. "Ideate"). More copies + a matching loop
    // distance keeps the strip continuously full.
    const row = Array.from({ length: repeat }, () => items).flat();
    const loopTo = -(100 / repeat) + "%";
    return (
        <div className={`overflow-hidden ${className}`}>
            <div className="marquee-track" style={{ animationDuration: speed + "s", "--marquee-end": loopTo }}>
                {row.map((it, i) => (
                    <span key={i} className="flex items-center text-2xl font-bold uppercase tracking-tight md:text-4xl">
            <span className="px-8">{it}</span>
            <span className="text-brand-purple">{separator}</span>
          </span>
                ))}
            </div>
        </div>
    );
}