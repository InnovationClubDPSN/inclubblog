import ArticleCard from "./ArticleCard";
import SectionHeading from "./SectionHeading";

export default function BlogFeed({ posts }) {
    const featured = posts.find((p) => p.featured) || posts[0];
    const rest = posts.filter((p) => p.id !== featured?.id).slice(0, 5);

    return (
        <section id="feed" className="border-b border-border py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
                <SectionHeading index="01" kicker="Latest articles" title="Latest Articles" meta={`${posts.length} articles`} />

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