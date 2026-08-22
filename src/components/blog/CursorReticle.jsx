import { useEffect, useState } from "react";

export default function CursorReticle() {
    const [pos, setPos] = useState({ x: -100, y: -100 });
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const isTouch = window.matchMedia("(pointer: coarse)").matches;
        if (isTouch) return;

        const move = (e) => {
            setPos({ x: e.clientX, y: e.clientY });
            setVisible(true);
        };
        const leave = () => setVisible(false);

        window.addEventListener("mousemove", move);
        document.addEventListener("mouseleave", leave);
        return () => {
            window.removeEventListener("mousemove", move);
            document.removeEventListener("mouseleave", leave);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            className="pointer-events-none fixed z-[9999] hidden md:block"
            style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
        >
            <div className="relative h-8 w-8">
                <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-brand-pink/60" />
                <div className="absolute top-1/2 left-0 h-px w-8 -translate-y-1/2 bg-brand-pink/60" />
                <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-purple" />
            </div>
        </div>
    );
}