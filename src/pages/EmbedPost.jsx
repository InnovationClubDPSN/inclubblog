import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowUpRight, Clock } from "lucide-react";
import { db } from "@/api/dataClient";

// Minimal, iframe-friendly single-post card at /embed/post/:slug -- the
// target for the "Copy Embed Code" repost option (see RepostMenu.jsx). Kept
// deliberately small and free of Navbar/Footer/CursorReticle so it looks
// right dropped into a third-party page via <iframe>.
export default function EmbedPost() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        db.entities.Post.filter({ slug }, "-created_date", 1)
            .then((data) => { if (active) { setPost(data?.[0] || null); setLoading(false); } })
            .catch(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [slug]);

    if (loading) {
        return (
            <div className="flex h-full min-h-[200px] items-center justify-center bg-background p-6">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">// loading...</span>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex h-full min-h-[200px] items-center justify-center bg-background p-6">
                <span className="text-xs text-muted-foreground">// post not found</span>
            </div>
        );
    }

    return (
        <a
            href={`${window.location.origin}/article/${post.slug}`}
            target="_blank"
            rel="noreferrer"
            className="group flex h-full flex-col border border-border bg-background text-foreground no-underline"
        >
            {post.cover_image && (
                <div className="aspect-[16/9] w-full overflow-hidden border-b border-border">
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                </div>
            )}
            <div className="flex flex-1 flex-col p-4">
                <span className="text-[9px] uppercase tracking-[0.2em] text-brand-pink">{post.category}</span>
                <h3 className="mt-2 text-base font-bold leading-snug tracking-tight">{post.title}</h3>
                {post.subtitle && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{post.subtitle}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {post.read_time || 5} min · {post.author}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-brand-purple transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
            </div>
            <div className="border-t border-border px-4 py-2 text-center text-[8px] uppercase tracking-[0.25em] text-muted-foreground">
                Innovation Club · DPS Newtown
            </div>
        </a>
    );
}
