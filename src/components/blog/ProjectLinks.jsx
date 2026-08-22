import { Figma, ExternalLink } from "lucide-react";

export default function ProjectLinks({ links }) {
    const arr = Array.isArray(links) ? links.filter(Boolean) : [];
    if (!arr.length) return null;
    return (
        <div className="flex flex-wrap gap-2">
            {arr.map((url, i) => {
                const isFigma = /figma\.com/i.test(url);
                return (
                    <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 border border-border px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-foreground transition-colors hover:border-brand-purple hover:text-brand-purple"
                    >
                        {isFigma ? <Figma className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
                        {isFigma ? "figma" : "link"}
                    </a>
                );
            })}
        </div>
    );
}