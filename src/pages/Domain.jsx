import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "@/api/dataClient";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import ArticleCard from "@/components/blog/ArticleCard";
import Reveal from "@/components/blog/Reveal";
import DecorArt from "@/components/blog/DecorArt";
import { ArrowLeft } from "lucide-react";

export default function DomainPage() {
    const { slug } = useParams();
    const [domain, setDomain] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        db.entities.Domain.filter({ slug }, "name", 1)
            .then(async (d) => {
                if (!active) return;
                const dom = d?.[0] || null;
                setDomain(dom);
                if (dom) {
                    const p = await db.entities.Post.filter({ category: dom.name }, "-created_date", 50);
                    if (active) setPosts(p || []);
                }
                setLoading(false);
            })
            .catch(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [slug]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">// loading domain...</span>
            </div>
        );
    }

    if (!domain) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 pt-16">
                <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">// error_404: domain not found</span>
                <Link to="/" className="border border-brand-purple px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black">
                    Return to Feed
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />
            <PageHeader kicker={`domain — ${domain.slug}`} title={domain.name} subtitle={domain.description} />
            <div className="mx-auto max-w-md px-4 pt-10 md:px-8">
                <DecorArt variant="grid" className="mx-auto w-40 opacity-70" />
            </div>
            <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
                <Link to="/" className="mb-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-brand-pink">
                    <ArrowLeft className="h-3 w-3" /> /feed
                </Link>

                {posts.length === 0 ? (
                    <div className="border border-dashed border-border py-24 text-center">
                        <p className="text-sm text-muted-foreground">// no posts in this domain yet.</p>
                    </div>
                ) : (
                    <Reveal>
                        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                            {posts.map((p, i) => (
                                <ArticleCard key={p.id} post={p} index={i} />
                            ))}
                        </div>
                    </Reveal>
                )}
            </section>
            <Footer />
        </div>
    );
}