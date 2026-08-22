import { useEffect, useRef, useState } from "react";

export default function Reveal({ children, className = "", delay = 0, as = "div" }) {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);
    const Tag = as;

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setShown(true);
                    io.disconnect();
                }
            },
            { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            className={`reveal ${shown ? "in" : ""} ${className}`}
            style={{ transitionDelay: delay + "ms" }}
        >
            {children}
        </Tag>
    );
}