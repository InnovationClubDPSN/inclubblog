import { useEffect, useState } from "react";
import { db } from "@/api/dataClient";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import Reveal from "@/components/blog/Reveal";
import DecorArt from "@/components/blog/DecorArt";

export default function Gallery() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        db.entities.Gallery.list("-created_date", 100)
            .then((g) => { if (active) { setItems(g || []); setLoading(false); } })
            .catch(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />
            <PageHeader
                kicker="archive — gallery"
                title="Gallery"
                subtitle="Moments, projects, and experiments from the Innovation Club — captured in pixels."
            />
            <div className="mx-auto max-w-md px-4 pt-10 md:px-8">
                <DecorArt variant="wave" className="mx-auto w-48 opacity-70" />
            </div>
            <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
                {loading ? (
                    <div className="border border-dashed border-border py-24 text-center">
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">// loading gallery...</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="border border-dashed border-border py-24 text-center">
                        <p className="text-sm text-muted-foreground">// no entries yet. check back soon.</p>
                    </div>
                ) : (
                    <Reveal>
                        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
                            {items.map((g) => {
                                const imgs = Array.isArray(g.images) ? g.images : [];
                                if (!imgs.length) return null;
                                return (
                                    <figure key={g.id} className="group break-inside-avoid border border-border bg-card overflow-hidden transition-colors hover:border-brand-purple/40">
                                        <div className={`grid ${imgs.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-0.5`}>
                                            {imgs.map((src, i) => (
                                                <div key={i} className="overflow-hidden">
                                                    <img
                                                        src={src}
                                                        alt={`${g.title || "gallery"} ${i + 1}`}
                                                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {(g.title || g.description) && (
                                            <figcaption className="p-4">
                                                {g.title && <h3 className="text-sm font-bold uppercase tracking-tight">{g.title}</h3>}
                                                {g.description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{g.description}</p>}
                                                <span className="mt-2 inline-block text-[9px] uppercase tracking-[0.15em] text-brand-purple">{imgs.length} {imgs.length === 1 ? "image" : "images"}</span>
                                            </figcaption>
                                        )}
                                    </figure>
                                );
                            })}
                        </div>
                    </Reveal>
                )}
            </section>
            <Footer />
        </div>
    );
}