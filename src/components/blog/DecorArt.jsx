function Orbit() {
    const nodes = [0, 1, 2, 3, 4, 5];
    return (
        <svg viewBox="0 0 200 200" className="w-full h-auto" fill="none">
            <circle cx="100" cy="100" r="72" stroke="rgba(100,65,255,0.25)" strokeWidth="0.6" strokeDasharray="2 4" />
            <g className="animate-spin-slow" style={{ transformOrigin: "100px 100px" }}>
                {nodes.map((i) => {
                    const a = (i / 6) * Math.PI * 2;
                    const x = 100 + Math.cos(a) * 72;
                    const y = 100 + Math.sin(a) * 72;
                    return (
                        <g key={i}>
                            <line x1="100" y1="100" x2={x} y2={y} stroke="rgba(100,65,255,0.18)" strokeWidth="0.5" />
                            <circle cx={x} cy={y} r="5" fill="#6441ff" className="animate-node-pulse" style={{ transformOrigin: `${x}px ${y}px` }} />
                        </g>
                    );
                })}
            </g>
            <circle cx="100" cy="100" r="9" fill="none" stroke="#ff0066" strokeWidth="1" className="animate-glow-pulse" />
            <circle cx="100" cy="100" r="3" fill="#ff0066" />
        </svg>
    );
}

function Circuit() {
    const pts = [[50, 60], [90, 40], [140, 70], [190, 50]];
    return (
        <svg viewBox="0 0 200 120" className="w-full h-auto" fill="none">
            <path d="M10 60 H50 L60 40 L90 40 L100 70 L140 70 L150 50 L190 50" stroke="#6441ff" strokeWidth="1" className="animate-dash" />
            <path d="M10 90 H70 L80 70 H120 L130 100 H190" stroke="#ff0066" strokeWidth="0.8" className="animate-dash" style={{ animationDuration: "4s" }} />
            {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="2.5" fill="#ff0066" className="animate-node-pulse" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${i * 0.3}s` }} />
            ))}
        </svg>
    );
}

function Wave() {
    const bars = Array.from({ length: 16 });
    return (
        <svg viewBox="0 0 200 80" className="w-full h-auto" fill="none">
            {bars.map((_, i) => {
                const x = 8 + i * 12;
                return (
                    <rect key={i} x={x} y={20} width="6" height="40" fill={i % 2 ? "#6441ff" : "#ff0066"} opacity="0.55" className="animate-bar" style={{ animationDelay: `${i * 0.1}s`, transformOrigin: `${x + 3}px 60px` }} />
                );
            })}
        </svg>
    );
}

function GridArt() {
    const dots = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) dots.push([20 + c * 40, 20 + r * 40, (r + c) % 2]);
    return (
        <svg viewBox="0 0 160 160" className="w-full h-auto" fill="none">
            <rect x="10" y="10" width="140" height="140" stroke="rgba(100,65,255,0.15)" strokeWidth="0.6" strokeDasharray="3 3" />
            {dots.map(([x, y, i], idx) => (
                <circle key={idx} cx={x} cy={y} r="3" fill={i ? "#ff0066" : "#6441ff"} opacity="0.65" className="animate-node-pulse" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${idx * 0.12}s` }} />
            ))}
        </svg>
    );
}

const MAP = { orbit: Orbit, circuit: Circuit, wave: Wave, grid: GridArt };

export default function DecorArt({ variant = "orbit", className = "" }) {
    const Cmp = MAP[variant] || Orbit;
    return (
        <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
            <Cmp />
        </div>
    );
}