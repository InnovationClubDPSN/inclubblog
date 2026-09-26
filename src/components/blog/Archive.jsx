import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, PenLine } from "lucide-react";
import ArticleCard from "./ArticleCard";

export default function Archive({ posts, domains }) {
    const [filter, setFilter] = useState("All");
    const [query, setQuery] = useState("");

    const filters = ["All", ...(domains || [])];

    const filtered = useMemo(() => {
        return posts.filter((p) => {
            const matchCat = filter === "All" || p.category === filter;
            const q = query.toLowerCase().trim();
            const matchQuery =
                !q ||
                p.title?.toLowerCase().includes(q) ||
                p.subtitle?.toLowerCase().includes(q) ||
                p.tags?.some((t) => t.toLowerCase().includes(q));
            return matchCat && matchQuery;
        });
    }, [posts, filter, query]);

    return (
        <section id="archive" className="border-b border-border py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">02 — Article archive</span>
                        <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight md:text-5xl">Browse the Archive</h2>
                    </div>
                    <Link
                        to="/writers"
                        className="group flex items-center gap-2 border border-brand-purple/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black"
                    >
                        <PenLine className="h-3.5 w-3.5" /> Meet the Writers
                    </Link>
                </div>

                <div className="mb-10 border border-border bg-card">
                    <div className="flex items-center gap-2 border-b border-border px-4 py-2">
                        <span className="h-2 w-2 rounded-full bg-brand-pink" />
                        <span className="h-2 w-2 rounded-full bg-brand-purple" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Search &amp; filter</span>
                    </div>
                    <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                        <div className="flex flex-1 items-center gap-2 border border-border bg-background px-3 py-2">
                            <Search className="h-3.5 w-3.5 text-brand-purple" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search articles…"
                                className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {filters.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setFilter(c)}
                                    className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] transition-all ${
                                        filter === c ? "border-brand-purple bg-brand-purple text-black" : "border-border text-muted-foreground hover:border-brand-purple/50 hover:text-foreground"
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="border border-dashed border-border py-24 text-center">
                        <p className="text-sm text-muted-foreground">No matching articles — try another search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((p, i) => (
                            <ArticleCard key={p.id} post={p} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}