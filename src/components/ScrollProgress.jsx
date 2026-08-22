import { useEffect, useState } from "react";

export default function ScrollProgress() {
    const [pct, setPct] = useState(0);
    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement;
            const max = h.scrollHeight - h.clientHeight;
            setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (
        <div className="pointer-events-none fixed left-0 top-0 z-[60] h-0.5 w-full bg-transparent">
            <div className="h-full bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple transition-[width] duration-75 ease-out" style={{ width: pct + "%" }} />
        </div>
    );
}