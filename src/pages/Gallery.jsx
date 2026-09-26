import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Expand } from "lucide-react";
import { db } from "@/api/dataClient";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import Reveal from "@/components/blog/Reveal";
import DecorArt from "@/components/blog/DecorArt";
import Lightbox from "@/components/blog/Lightbox";

// A gallery tile can come from a dedicated gallery entry, or from a blog
// post's cover + additional images -- both render the same way below.
function postToTile(post) {
    const images = [post.cover_image, ...(Array.isArray(post.images) ? post.images : [])].filter(Boolean);
    if (!images.length) return null;
    return {
        id: `post-${post.id}`,
        title: post.title,
        description: post.subtitle,
        images,
        created_date: post.created_date,
        href: `/article/${post.slug}`,
        sourceLabel: "From the blog",
    };
}

function galleryToTile(g) {
    const images = Array.isArray(g.images) ? g.images : [];
    if (!images.length) return null;
    return {
        id: `gallery-${g.id}`,
        title: g.title,
        description: g.description,
        images,
        created_date: g.created_date,
        href: null,
        sourceLabel: null,
    };
}

export default function Gallery() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    // Every image across every tile, in display order, so the viewer can
    // step from the last picture of one tile straight into the next.
    const flatImages = useMemo(() => {
        const flat = [];
        for (const tile of items) {
            tile.images.forEach((src, i) => {
                flat.push({ src, alt: `${tile.title || "gallery"} ${i + 1}`, caption: tile.title });
            });
        }
        return flat;
    }, [items]);

    // Running start-offset of each tile's images within `flatImages`, so a
    // click inside a given tile can resolve to the right global index.
    const tileOffsets = useMemo(() => {
        let offset = 0;
        return items.map((tile) => {
            const start = offset;
            offset += tile.images.length;
            return start;
        });
    }, [items]);

    useEffect(() => {
        let active = true;
        Promise.allSettled([
            db.entities.Gallery.list("-created_date", 100),
            db.entities.Post.list("-created_date", 100),
        ]).then(([g, p]) => {
            if (!active) return;
            const galleryTiles = (g.status === "fulfilled" ? g.value || [] : []).map(galleryToTile);
            const postTiles = (p.status === "fulfilled" ? p.value || [] : []).map(postToTile);
            const combined = [...galleryTiles, ...postTiles]
                .filter(Boolean)
                .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
            setItems(combined);
            setLoading(false);
        });
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
                            {items.map((g, tileIdx) => {
                                const imgs = g.images;
                                const offset = tileOffsets[tileIdx];
                                return (
                                    <figure key={g.id} className="break-inside-avoid border border-border bg-card overflow-hidden transition-colors hover:border-brand-purple/40">
                                        <div className={`grid ${imgs.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-0.5`}>
                                            {imgs.map((src, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setLightboxIndex(offset + i)}
                                                    className="group relative block w-full overflow-hidden"
                                                    aria-label="View image"
                                                >
                                                    <img
                                                        src={src}
                                                        alt={`${g.title || "gallery"} ${i + 1}`}
                                                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
                                                        <Expand className="h-4 w-4 text-white" />
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        {(g.title || g.description) && (
                                            <figcaption className="p-4">
                                                {g.sourceLabel && <span className="mb-1 block text-[9px] uppercase tracking-[0.15em] text-brand-pink">{g.sourceLabel}</span>}
                                                {g.title && (
                                                    g.href ? (
                                                        <Link to={g.href} className="text-sm font-bold uppercase tracking-tight transition-colors hover:text-brand-purple">
                                                            {g.title}
                                                        </Link>
                                                    ) : (
                                                        <h3 className="text-sm font-bold uppercase tracking-tight">{g.title}</h3>
                                                    )
                                                )}
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
            <Lightbox
                images={flatImages}
                index={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
                onNavigate={setLightboxIndex}
            />
        </div>
    );
}