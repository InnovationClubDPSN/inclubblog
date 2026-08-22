import { useEffect, useRef, useState } from "react";

export default function Counter({ value = 0, duration = 1400, pad = 2, className = "" }) {
    const [n, setN] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        started.current = false;
        const el = ref.current;
        if (!el) return;
        const run = () => {
            started.current = true;
            const start = performance.now();
            const target = Number(value) || 0;
            const tick = (now) => {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                setN(Math.round(eased * target));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting && !started.current) {
                    run();
                    io.disconnect();
                }
            },
            { threshold: 0.4 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [value, duration]);

    const display = pad ? String(n).padStart(pad, "0") : String(n);
    return <span ref={ref} className={className}>{display}</span>;
}