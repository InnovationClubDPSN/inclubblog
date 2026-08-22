import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import CardFx from "@/components/blog/CardFx";

function Cover({ post, className }) {
    const gradients = {
        "Artificial Intelligence": "from-brand-purple/30 to-brand-pink/20",
        Robotics: "from-brand-pink/30 to-brand-purple/10",
        "Design Systems": "from-brand-purple/20 to-brand-pink/30",
        Quantum: "from-brand-pink/20 to-brand-purple/30",
        Web3: "from-brand-purple/30 to-brand-pink/30",
        Research: "from-brand-pink/30 to-brand-purple/20",
    };
    const grad = gradients[post.category] || "from-brand-purple/20 to-brand-pink/20";

    return (
        <div className={`relative ${className} overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${grad}`} />
            <div className="absolute inset-0 blueprint-grid opacity-40" />
            {post.cover_image && (
                <img
                    src={post.cover_image}
                    alt={post.title}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                    className="relative h-full w-full object-cover opacity-80"
                />
            )}
            <div className="scan-line" />
        </div>
    );
}

export default function ArticleCard({ post, index, featured }) {
    if (!post) return null;

    const href = `/article/${post.slug}`;
    const num = String(index + 1).padStart(2, "0");

    if (featured) {
        return (
            <CardFx className="scan-hover relative col-span-1 flex flex-col border border-border bg-card transition-colors hover:border-brand-purple/40 md:col-span-2 md:row-span-2">
                <Link to={href} className="group relative flex flex-1 flex-col">
                    <Cover post={post} className="aspect-[16/10] border-b border-border" />
                    <span className="absolute left-4 top-4 z-20 border border-brand-purple/50 bg-background/60 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-brand-purple backdrop-blur">
            {post.category}
          </span>
                    <div className="flex flex-1 flex-col p-6 md:p-8">
            <span className="mb-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Featured · {post.read_time} min read
            </span>
                        <h2 className="text-2xl font-bold leading-tight tracking-tight md:text-4xl">
                            {post.title}
                        </h2>
                        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {post.subtitle}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-6">
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                {post.author}
              </span>
                            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-pink transition-transform group-hover:translate-x-1">
                Read <ArrowUpRight className="h-3 w-3" />
              </span>
                        </div>
                    </div>
                </Link>
            </CardFx>
        );
    }

    return (
        <CardFx className="scan-hover relative flex flex-col border border-border bg-card transition-colors hover:border-brand-purple/40">
            <Link to={href} className="group relative flex flex-1 flex-col">
                <Cover post={post} className="aspect-[4/3] border-b border-border" />
                <span className="absolute left-3 top-3 z-20 border border-brand-pink/40 bg-background/60 px-2 py-0.5 text-[8px] uppercase tracking-[0.2em] text-brand-pink backdrop-blur">
          {post.category}
        </span>
                <div className="flex flex-1 flex-col p-5">
          <span className="mb-2 text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
            {post.read_time} min read
          </span>
                    <h3 className="text-base font-semibold leading-snug tracking-tight md:text-lg">
                        {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {post.subtitle}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
              {post.author}
            </span>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-purple" />
                    </div>
                </div>
            </Link>
        </CardFx>
    );
}