import { useEffect, useRef } from "react";

export default function CanvasBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let w = 0, h = 0, raf = 0, running = true;
        let particles = [], shapes = [];
        const mouse = { x: -9999, y: -9999, active: false };

        const resize = () => {
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.min(180, Math.floor((w * h) / 11000));
            particles = new Array(count).fill(0).map(() => ({
                x: Math.random() * w, y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45,
                r: Math.random() * 2.6 + 1,
                c: Math.random() > 0.5 ? "#6441ff" : "#ff0066",
                g: Math.random() * 10 + 5,
            }));
            shapes = new Array(8).fill(0).map(() => ({
                x: Math.random() * w, y: Math.random() * h,
                s: Math.random() * 70 + 40, rot: Math.random() * Math.PI * 2,
                vr: (Math.random() - 0.5) * 0.004,
                vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
                type: Math.floor(Math.random() * 3),
            }));
        };

        const drawShape = (s) => {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rot);
            ctx.strokeStyle = "rgba(100,65,255,0.13)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (s.type === 0) { ctx.moveTo(0, -s.s / 2); ctx.lineTo(s.s / 2, s.s / 2); ctx.lineTo(-s.s / 2, s.s / 2); ctx.closePath(); }
            else if (s.type === 1) { ctx.rect(-s.s / 2, -s.s / 2, s.s, s.s); }
            else { for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const px = Math.cos(a) * s.s / 2, py = Math.sin(a) * s.s / 2; i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.closePath(); }
            ctx.stroke();
            ctx.restore();
        };

        const step = () => {
            if (!running) return;
            ctx.clearRect(0, 0, w, h);
            shapes.forEach((s) => {
                s.x += s.vx; s.y += s.vy; s.rot += s.vr;
                if (s.x < -s.s) s.x = w + s.s; if (s.x > w + s.s) s.x = -s.s;
                if (s.y < -s.s) s.y = h + s.s; if (s.y > h + s.s) s.y = -s.s;
                drawShape(s);
            });
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                // mouse repel
                if (mouse.active) {
                    const dx = p.x - mouse.x, dy = p.y - mouse.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < 16000) {
                        const d = Math.sqrt(d2) || 1;
                        const f = (1 - d / 127) * 0.8;
                        p.x += (dx / d) * f; p.y += (dy / d) * f;
                    }
                }
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = p.c;
                ctx.shadowBlur = p.g;
                ctx.shadowColor = p.c;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x, dy = p.y - q.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 155) {
                        ctx.globalAlpha = (1 - dist / 155) * 0.3;
                        ctx.strokeStyle = "#6441ff";
                        ctx.lineWidth = 0.7;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }
                // mouse connections
                if (mouse.active) {
                    const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                    if (md < 180) {
                        ctx.globalAlpha = (1 - md / 200) * 0.6;
                        ctx.strokeStyle = "#ff0066";
                        ctx.lineWidth = 0.9;
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = "#ff0066";
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                }
            }
            ctx.globalAlpha = 1;
            raf = requestAnimationFrame(step);
        };

        const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; };
        const onLeave = () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999; };
        const onVis = () => {
            running = !document.hidden;
            if (running) { cancelAnimationFrame(raf); raf = requestAnimationFrame(step); }
        };

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseout", onLeave);
        document.addEventListener("visibilitychange", onVis);

        if (reduce) { step(); cancelAnimationFrame(raf); }
        else raf = requestAnimationFrame(step);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseout", onLeave);
            document.removeEventListener("visibilitychange", onVis);
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0" />
            <div className="absolute left-3 top-3 h-8 w-8 border-l border-t border-brand-purple/30" />
            <div className="absolute right-3 top-3 h-8 w-8 border-r border-t border-brand-purple/30" />
            <div className="absolute bottom-3 left-3 h-8 w-8 border-b border-l border-brand-purple/30" />
            <div className="absolute bottom-3 right-3 h-8 w-8 border-b border-r border-brand-purple/30" />
        </div>
    );
}