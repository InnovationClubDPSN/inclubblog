import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Full-screen image viewer. `images` is a flat array of { src, alt, caption }.
// `index` is the open index (null/undefined closes it). Pass `onNavigate` to
// enable prev/next -- omit it (or pass a single-image array) to hide the arrows.
export default function Lightbox({ images, index, onClose, onNavigate }) {
    const open = index !== null && index !== undefined && images?.[index];

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight" && images.length > 1) onNavigate((index + 1) % images.length);
            if (e.key === "ArrowLeft" && images.length > 1) onNavigate((index - 1 + images.length) % images.length);
        };
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, index, images, onClose, onNavigate]);

    if (!open) return null;
    const img = images[index];

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-white/20 bg-black/40 text-white transition-colors hover:border-brand-pink hover:text-brand-pink"
            >
                <X className="h-5 w-5" />
            </button>

            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); onNavigate((index - 1 + images.length) % images.length); }}
                        aria-label="Previous image"
                        className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/40 text-white transition-colors hover:border-brand-purple hover:text-brand-purple md:left-6"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onNavigate((index + 1) % images.length); }}
                        aria-label="Next image"
                        className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/20 bg-black/40 text-white transition-colors hover:border-brand-purple hover:text-brand-purple md:right-6"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </>
            )}

            <div className="flex max-h-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
                <img
                    src={img.src}
                    alt={img.alt || ""}
                    className="max-h-[80vh] w-auto max-w-full border border-white/10 object-contain"
                />
                {(img.caption || images.length > 1) && (
                    <div className="mt-4 flex flex-col items-center gap-1 text-center">
                        {img.caption && <p className="text-xs text-white/80">{img.caption}</p>}
                        {images.length > 1 && (
                            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                                {index + 1} / {images.length}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
