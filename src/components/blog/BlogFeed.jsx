import ArticleCard from "./ArticleCard";

export default function BlogFeed({ posts }) {
    const featured = posts.find((p) => p.featured) || posts[0];
    const rest = posts.filter((p) => p.id !== featured?.id).slice(0, 5);

    return (
        <section id="feed" className="border-b border-border py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
                <div className="mb-12 flex items-end justify-between border-b border-border pb-6">
                    <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">
              01 — Latest articles
            </span>
                        <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight md:text-5xl">
                            Latest Articles
                        </h2>
                    </div>
                    <span className="hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:block">
            {posts.length} articles
          </span>
                </div>

                {posts.length === 0 ? (
                    <div className="border border-dashed border-border py-32 text-center">
                        <p className="text-sm text-muted-foreground">
                            No articles yet — check back soon.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
                        {featured && <ArticleCard post={featured} index={0} featured />}
                        {rest.map((p, i) => (
                            <ArticleCard key={p.id} post={p} index={i + 1} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}