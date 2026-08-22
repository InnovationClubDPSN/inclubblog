import { useEffect, useState } from "react";
import { db } from "@/api/dataClient";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import Reveal from "@/components/blog/Reveal";
import DecorArt from "@/components/blog/DecorArt";
import { Github, Linkedin, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const skillsList = (s) => (s ? s.split(",").map((t) => t.trim()).filter(Boolean) : []);

function Avatar({ m, size = "h-16 w-16" }) {
    return (
        <div className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-purple/40 bg-brand-purple/10 text-lg font-bold text-brand-purple`}>
            {m.avatar ? (
                <img src={m.avatar} alt={m.name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
                m.name?.charAt(0).toUpperCase()
            )}
        </div>
    );
}

function Links({ m }) {
    if (!m.github && !m.linkedin) return null;
    return (
        <div className="mt-4 flex gap-2">
            {m.github && (
                <a href={m.github} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple"><Github className="h-3.5 w-3.5" /></a>
            )}
            {m.linkedin && (
                <a href={m.linkedin} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple"><Linkedin className="h-3.5 w-3.5" /></a>
            )}
        </div>
    );
}

export default function Members() {
    const [members, setMembers] = useState([]);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            db.entities.Member.list("name", 200),
            db.entities.Domain.list("name", 100),
        ]).then(([m, d]) => { setMembers(m || []); setDomains(d || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const q = query.trim().toLowerCase();
    const matches = (m) => {
        if (!q) return true;
        return [m.name, m.domain, m.skills, m.role, m.class, m.section, m.bio]
            .filter(Boolean).join(" ").toLowerCase().includes(q);
    };
    const filtered = members.filter(matches);
    const presidents = filtered.filter((m) => (m.role || "").toLowerCase() === "president");
    const core = filtered.filter((m) => (m.role || "").toLowerCase() === "core team");
    const general = filtered.filter((m) => {
        const r = (m.role || "").toLowerCase();
        return r === "member" || r === "" || (r !== "president" && r !== "core team");
    });

    const grouped = domains.map((d) => ({ domain: d.name, members: general.filter((m) => m.domain === d.name) }))
        .filter((g) => g.members.length);
    const ungrouped = general.filter((m) => !m.domain);
    if (ungrouped.length) grouped.push({ domain: "General", members: ungrouped });

    const colsClass = (n) =>
        n <= 1 ? "grid-cols-1" :
            n === 2 ? "grid-cols-1 sm:grid-cols-2" :
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    const genCols = (n) =>
        n <= 1 ? "grid-cols-1" :
            n === 2 ? "grid-cols-2" :
                n === 3 ? "grid-cols-2 sm:grid-cols-3" :
                    n === 4 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" :
                        "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />
            <PageHeader
                kicker="directory — members"
                title="The Collective"
                subtitle="The minds behind the matrix — researchers, builders, and designers engineering the frontier at DPS Newtown."
            />
            <div className="mx-auto max-w-md px-4 pt-10 md:px-8">
                <DecorArt variant="grid" className="mx-auto w-40 opacity-70" />
            </div>
            <div className="mx-auto max-w-md px-4 md:px-8">
                <div className="flex items-center gap-2 border border-border bg-card px-3 py-2">
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="search by name, domain, class, skills…"
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
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">// loading roster...</p>
                ) : (
                    <div className="space-y-20">
                        {/* Presidents */}
                        {presidents.length > 0 && (
                            <Reveal>
                                <div>
                                    <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">// 01 — presidents</span>
                                    <h2 className="mt-2 mb-8 text-2xl font-bold uppercase tracking-tight md:text-3xl">Presidents</h2>
                                    <div className={`grid gap-px border border-border bg-border ${colsClass(presidents.length)}`}>
                                        {presidents.map((m) => (
                                            <div key={m.id} onClick={() => navigate(`/member/${m.id}`)} className="cursor-pointer bg-card p-6 transition-colors hover:bg-brand-purple/5">
                                                <div className="flex items-center gap-4">
                                                    <Avatar m={m} />
                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-sm font-bold">{m.name}</h3>
                                                        <p className="text-[10px] uppercase tracking-[0.15em] text-brand-pink">President</p>
                                                    </div>
                                                </div>
                                                {m.bio && <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{m.bio}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        )}

                        {/* Core Team */}
                        {core.length > 0 && (
                            <Reveal>
                                <div>
                                    <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">// 02 — core_team</span>
                                    <h2 className="mt-2 mb-8 text-2xl font-bold uppercase tracking-tight md:text-3xl">Core Team</h2>
                                    <div className={`grid gap-px border border-border bg-border ${colsClass(core.length)}`}>
                                        {core.map((m) => {
                                            const skills = skillsList(m.skills);
                                            return (
                                                <div key={m.id} onClick={() => navigate(`/member/${m.id}`)} className="cursor-pointer bg-card p-6 transition-colors hover:bg-brand-purple/5">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar m={m} />
                                                        <div className="min-w-0">
                                                            <h3 className="truncate text-sm font-bold">{m.name}</h3>
                                                            <p className="text-[10px] uppercase tracking-[0.15em] text-brand-pink">Core Team</p>
                                                            {(m.class || m.section) && (
                                                                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                                                    {m.class && `Cl ${m.class}`}{m.class && m.section ? " · " : ""}{m.section && `Sec ${m.section}`}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {m.bio && <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{m.bio}</p>}
                                                    {m.domain && (
                                                        <span className="mt-4 inline-block border border-brand-purple/30 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-brand-purple">{m.domain}</span>
                                                    )}
                                                    {skills.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                                            {skills.map((s, i) => (
                                                                <span key={i} className="border border-border bg-background px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{s}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <Links m={m} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Reveal>
                        )}

                        {/* General members by domain */}
                        {grouped.length > 0 && (
                            <Reveal>
                                <div>
                                    <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">// 03 — members</span>
                                    <h2 className="mt-2 mb-8 text-2xl font-bold uppercase tracking-tight md:text-3xl">Members</h2>
                                    <div className="space-y-10">
                                        {grouped.map((g) => (
                                            <div key={g.domain} className="border border-border bg-card">
                                                <div className="border-b border-border px-5 py-3">
                                                    <span className="text-[10px] uppercase tracking-[0.25em] text-brand-purple">{g.domain}</span>
                                                    <span className="ml-3 text-[10px] text-muted-foreground">· {g.members.length}</span>
                                                </div>
                                                <div className={`grid gap-px bg-border ${genCols(g.members.length)}`}>
                                                    {g.members.map((m) => {
                                                        const skills = skillsList(m.skills);
                                                        return (
                                                            <div key={m.id} onClick={() => navigate(`/member/${m.id}`)} className="group relative cursor-pointer bg-card px-4 py-3 transition-colors hover:bg-brand-purple/5">
                                                                <div className="text-sm font-bold">{m.name}</div>
                                                                <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-56 -translate-x-1/2 border border-brand-purple/40 bg-background p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.4)] group-hover:block">
                                                                    <div className="text-xs font-bold text-foreground">{m.name}</div>
                                                                    <div className="mt-2 space-y-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                                                        {m.domain && <div><span className="text-muted-foreground/60">domain:</span> <span className="ml-1 text-brand-purple">{m.domain}</span></div>}
                                                                        <div>
                                                                            <span className="text-muted-foreground/60">class:</span>{" "}
                                                                            <span className="text-foreground">{m.class || "—"}</span>
                                                                            <span className="mx-1 text-muted-foreground/40">·</span>
                                                                            <span className="text-muted-foreground/60">sec:</span>{" "}
                                                                            <span className="text-foreground">{m.section || "—"}</span>
                                                                        </div>
                                                                    </div>
                                                                    {skills.length > 0 && (
                                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                                            {skills.map((s, i) => (
                                                                                <span key={i} className="border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{s}</span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        )}

                        {!presidents.length && !core.length && !grouped.length && (
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">// {query ? `no members match "${query}".` : "roster empty."}</p>
                        )}
                    </div>
                )}
            </section>
            <Footer />
        </div>
    );
}