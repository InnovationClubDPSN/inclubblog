import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PenLine, Search, X, ArrowUpRight } from "lucide-react";
import { db } from "@/api/dataClient";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import Reveal from "@/components/blog/Reveal";
import DecorArt from "@/components/blog/DecorArt";

function Avatar({ member, name }) {
    return (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-purple/40 bg-brand-purple/10 text-base font-bold text-brand-purple">
            {member?.avatar ? (
                <img src={member.avatar} alt={name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
                name?.charAt(0).toUpperCase()
            )}
        </div>
    );
}

// Builds one writer per unique name across post authors + contributors,
// matching against the member directory (by name) for avatar/domain/id.
function buildWriters(posts, members) {
    const byName = new Map();
    const memberByName = new Map(members.map((m) => [m.name?.trim().toLowerCase(), m]));

    const touch = (name, post, asContributor) => {
        const key = (name || "").trim();
        if (!key) return;
        const lower = key.toLowerCase();
        if (!byName.has(lower)) {
            byName.set(lower, {
                name: key,
                member: memberByName.get(lower) || null,
                authored: [],
                contributed: [],
            });
        }
        const entry = byName.get(lower);
        const list = asContributor ? entry.contributed : entry.authored;
        if (!list.some((p) => p.id === post.id)) list.push(post);
    };

    for (const post of posts) {
        touch(post.author, post, false);
        for (const c of post.contributors || []) {
            const name = typeof c === "string" ? c : c?.name;
            touch(name, post, true);
        }
    }

    return Array.from(byName.values())
        .map((w) => ({ ...w, total: w.authored.length + w.contributed.length }))
        .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

export default function BlogWriters() {
    const [posts, setPosts] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;
        Promise.allSettled([
            db.entities.Post.list("-created_date", 200),
            db.entities.Member.list("name", 200),
        ]).then(([p, m]) => {
            if (!active) return;
            setPosts(p.status === "fulfilled" ? p.value || [] : []);
            setMembers(m.status === "fulfilled" ? m.value || [] : []);
            setLoading(false);
        });
        return () => { active = false; };
    }, []);

    const writers = useMemo(() => buildWriters(posts, members), [posts, members]);

    const q = query.trim().toLowerCase();
    const filtered = writers.filter((w) => !q || w.name.toLowerCase().includes(q));

    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />
            <PageHeader
                kicker="archive — blog writers"
                title="Blog Writers"
                subtitle="Every author and contributor behind the archive's articles, and what they've written."
            />
            <div className="mx-auto max-w-md px-4 pt-10 md:px-8">
                <DecorArt variant="circuit" className="mx-auto w-40 opacity-70" />
            </div>
            <div className="mx-auto max-w-md px-4 md:px-8">
                <div className="flex items-center gap-2 border border-border bg-card px-3 py-2">
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="search writers…"
                        className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    {query && (
                        <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-brand-pink" aria-label="Clear search">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
                {loading ? (
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">// loading writers...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">// {query ? `no writers match "${query}".` : "no posts published yet."}</p>
                ) : (
                    <Reveal>
                        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
                            {filtered.map((w) => (
                                <div key={w.name} className="bg-card p-6">
                                    <div
                                        className={`flex items-center gap-4 ${w.member ? "cursor-pointer" : ""}`}
                                        onClick={() => w.member && navigate(`/member/${w.member.id}`)}
                                    >
                                        <Avatar member={w.member} name={w.name} />
                                        <div className="min-w-0">
                                            <h3 className="truncate text-sm font-bold">{w.name}</h3>
                                            <p className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-brand-purple">
                                                <PenLine className="h-3 w-3" />
                                                {w.authored.length} {w.authored.length === 1 ? "post" : "posts"}
                                                {w.contributed.length > 0 && ` · ${w.contributed.length} contributed`}
                                            </p>
                                            {w.member?.domain && (
                                                <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{w.member.domain}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-1.5 border-t border-border pt-4">
                                        {[...w.authored, ...w.contributed.filter((p) => !w.authored.some((a) => a.id === p.id))]
                                            .slice(0, 5)
                                            .map((p) => (
                                                <Link
                                                    key={p.id}
                                                    to={`/article/${p.slug}`}
                                                    className="group flex items-center justify-between gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                                >
                                                    <span className="truncate">{p.title}</span>
                                                    <ArrowUpRight className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                                                </Link>
                                            ))}
                                        {w.total > 5 && (
                                            <p className="pt-1 text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70">+{w.total - 5} more</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                )}
            </section>
            <Footer />
        </div>
    );
}
