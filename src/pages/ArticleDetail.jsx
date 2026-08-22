import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, User, Users, Tag, ExternalLink, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { db } from "@/api/dataClient";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import DecorArt from "@/components/blog/DecorArt";
import CommentsSection from "@/components/blog/CommentsSection";
import RepostMenu from "@/components/blog/RepostMenu";

export default function ArticleDetail() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        db.entities.Post
            .filter({ slug }, "-created_date", 1)
            .then((data) => {
                if (active) {
                    setPost(data?.[0] || null);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [slug]);

    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />

            {loading ? (
                <div className="flex min-h-screen items-center justify-center pt-16">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">
            // loading dossier...
          </span>
                </div>
            ) : !post ? (
                <div className="flex min-h-screen flex-col items-center justify-center gap-6 pt-16">
          <span className="text-sm text-muted-foreground">
            // error_404: document not found
          </span>
                    <Link
                        to="/"
                        className="border border-brand-purple px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black"
                    >
                        Return to Feed
                    </Link>
                </div>
            ) : (
                <>
                    {/* Hero header */}
                    <header className="border-b border-border blueprint-grid pt-16">
                        <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
                            <div className="mb-8 flex items-center justify-between">
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-brand-pink"
                                >
                                    <ArrowLeft className="h-3 w-3" /> /feed
                                </Link>
                                <RepostMenu post={post} />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">
                {post.category} · dossier
              </span>
                            <h1 className="mt-4 text-3xl font-bold uppercase leading-[0.95] tracking-tight md:text-6xl">
                                {post.title}
                            </h1>
                            {post.subtitle && (
                                <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
                                    {post.subtitle}
                                </p>
                            )}
                            <DecorArt variant="circuit" className="mt-8 w-full max-w-sm opacity-60" />
                        </div>
                    </header>

                    {/* Cover image */}
                    {post.cover_image && (
                        <div className="mx-auto max-w-4xl px-4 pt-10 md:px-8">
                            <div className="overflow-hidden border border-border">
                                <img
                                    src={post.cover_image}
                                    alt={post.title}
                                    loading="lazy"
                                    onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                                    className="h-auto max-h-[520px] w-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Body: metadata column + content */}
                    <div className="mx-auto max-w-7xl px-4 md:px-8">
                        <div className="grid grid-cols-1 gap-0 md:grid-cols-10">
                            {/* Metadata column */}
                            <aside className="border-b border-border py-10 md:col-span-3 md:border-b-0 md:border-r md:py-16 md:pr-8">
                                <div className="md:sticky md:top-24">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-brand-purple">
                    // metadata
                  </span>

                                    <div className="mt-6 space-y-4 border border-border bg-card p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center border border-brand-purple/40 bg-brand-purple/10">
                                                <User className="h-4 w-4 text-brand-purple" />
                                            </div>
                                            <div>
                                                <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                                                    author_id
                                                </div>
                                                <div className="text-xs font-semibold">{post.author}</div>
                                            </div>
                                        </div>

                                        {post.contributors?.length > 0 && (
                                            <div className="border-t border-border pt-4">
                                                <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                                                    <Users className="h-3 w-3" /> contributors
                                                </div>
                                                <div className="mt-2 space-y-1.5">
                                                    {post.contributors.map((c, i) => {
                                                        const name = typeof c === "string" ? c : c?.name;
                                                        const role = typeof c === "string" ? "" : c?.role;
                                                        return (
                                                            <div key={i} className="flex items-center justify-between gap-2">
                                                                <span className="text-[11px] font-semibold">{name}</span>
                                                                {role && <span className="text-[9px] uppercase tracking-[0.15em] text-brand-purple">{role}</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
                                            <Clock className="h-3 w-3 text-brand-pink" />
                                            {post.read_time || 5} min read
                                        </div>
                                    </div>

                                    {post.tags?.length > 0 && (
                                        <div className="mt-6">
                      <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                        <Tag className="h-3 w-3" /> tags
                      </span>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {post.tags.map((t) => (
                                                    <span
                                                        key={t}
                                                        className="border border-border px-2 py-1 text-[10px] text-muted-foreground"
                                                    >
                            {t}
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </aside>

                            {/* Content */}
                            <article className="py-10 md:col-span-7 md:py-16 md:pl-10">
                                <div className="prose-content max-w-none text-[15px] leading-[1.7] text-foreground/90">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ node, ...p }) => <h2 className="mt-10 mb-4 text-2xl font-bold uppercase tracking-tight text-foreground" {...p} />,
                                            h2: ({ node, ...p }) => <h2 className="mt-10 mb-4 text-xl font-bold uppercase tracking-tight text-foreground" {...p} />,
                                            h3: ({ node, ...p }) => <h3 className="mt-8 mb-3 text-lg font-bold uppercase tracking-tight text-brand-purple" {...p} />,
                                            p: ({ node, ...p }) => <p className="mb-5" {...p} />,
                                            ul: ({ node, ...p }) => <ul className="mb-5 list-none space-y-2 pl-0" {...p} />,
                                            ol: ({ node, ...p }) => <ol className="mb-5 list-none space-y-2 pl-0" {...p} />,
                                            li: ({ node, ...p }) => <li className="relative pl-6 before:absolute before:left-0 before:content-['›'] before:text-brand-pink" {...p} />,
                                            blockquote: ({ node, ...p }) => <blockquote className="my-8 border-l-2 border-brand-purple py-2 pl-6 text-xl font-bold italic leading-snug text-foreground" {...p} />,
                                            code: ({ node, ...p }) => <code className="rounded border border-border bg-card px-1.5 py-0.5 text-[13px] text-brand-pink" {...p} />,
                                            pre: ({ node, ...p }) => <pre className="my-6 overflow-x-auto border border-border bg-card p-4 text-[13px]" {...p} />,
                                            a: ({ node, ...p }) => <a className="text-brand-purple underline underline-offset-2 hover:text-brand-pink" {...p} />,
                                        }}
                                    >
                                        {post.body}
                                    </ReactMarkdown>
                                </div>

                                {post.tech_tip && (
                                    <div className="mt-12 border border-brand-purple/40 bg-card p-6">
                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-brand-purple">
                      <Lightbulb className="h-3.5 w-3.5" /> Tech Tip of the Week
                    </span>
                                        <div className="mt-3 text-sm leading-relaxed text-foreground/90">
                                            <ReactMarkdown>{post.tech_tip}</ReactMarkdown>
                                        </div>
                                        {post.tech_tip_author && (
                                            <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                                — {post.tech_tip_author}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {post.links?.length > 0 && (
                                    <div className="mt-12 border border-border bg-card p-5">
                                        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">// links</span>
                                        <div className="mt-4 space-y-2">
                                            {post.links.map((l, i) => (
                                                <a
                                                    key={i}
                                                    href={l}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 break-all text-xs text-brand-purple underline-offset-2 hover:text-brand-pink hover:underline"
                                                >
                                                    <ExternalLink className="h-3 w-3 shrink-0" /> {l}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <CommentsSection postId={post.id} />

                                <div className="mt-16 border-t border-border pt-8">
                                    <Link
                                        to="/"
                                        className="inline-flex items-center gap-2 border border-border px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-brand-purple hover:text-brand-purple"
                                    >
                                        <ArrowLeft className="h-3 w-3" /> Back to Feed
                                    </Link>
                                </div>
                            </article>
                        </div>
                    </div>
                </>
            )}

            <Footer />
        </div>
    );
}