import { useRef } from "react";

export default function CardFx({ children, className = "", tilt = true, glow = true, ...rest }) {
    const ref = useRef(null);

    const onMove = (e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        el.style.setProperty("--mx", x + "px");
        el.style.setProperty("--my", y + "px");
        if (tilt) {
            const rx = ((y / r.height) - 0.5) * -7;
            const ry = ((x / r.width) - 0.5) * 7;
            el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        }
    };

    const onLeave = () => {
        const el = ref.current;
        if (!el) return;
        el.style.transform = "";
    };

    return (
        <div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className={`group relative ${className}`}
            style={{ transition: "transform .25s ease-out, border-color .3s ease, background-color .3s ease" }}
            {...rest}
        >
            {glow && (
                <div
                    className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: "radial-gradient(200px circle at var(--mx,50%) var(--my,50%), rgba(100,65,255,0.16), transparent 65%)" }}
                />
            )}
            {children}
        </div>
    );
}