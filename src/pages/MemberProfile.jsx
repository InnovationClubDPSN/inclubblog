import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Github, Linkedin, FileText, FolderGit2, ExternalLink, CalendarCheck, Pencil, Mail, Share2, Check } from "lucide-react";
import { db } from "@/api/dataClient";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import DecorArt from "@/components/blog/DecorArt";
import { getAttendance } from "@/lib/attendance";
import { getCurrentMember } from "@/lib/memberSession";

const skillsList = (s) => (s ? s.split(",").map((t) => t.trim()).filter(Boolean) : []);

// Avatar circle with a small edit badge overlaid on it -- only rendered for
// the member's own dossier, and only while their portal session is active.
// Clicking it opens ./portal, where the actual avatar/detail editing lives.
function Avatar({ m, size = "h-28 w-28", canEdit = false }) {
    return (
        <div className="relative shrink-0">
            <div className={`flex ${size} items-center justify-center overflow-hidden rounded-full border border-brand-purple/40 bg-brand-purple/10 text-4xl font-bold text-brand-purple`}>
                {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                ) : (
                    m.name?.charAt(0).toUpperCase()
                )}
            </div>
            {canEdit && (
                <Link
                    to="/portal"
                    aria-label="Edit your profile"
                    title="Edit your profile"
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-brand-purple bg-background text-brand-purple transition-colors hover:bg-brand-purple hover:text-black"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </Link>
            )}
        </div>
    );
}

// Stat box shown opposite the name / next to the moving circuit animation.
function StatsBox({ projectsCount, attendance, postsCount }) {
    const rows = [
        { label: "projects collaborated in", value: projectsCount },
        { label: "attendance", value: attendance === undefined ? "…" : attendance === null ? "—" : attendance, icon: CalendarCheck },
        { label: "posts tagged in", value: postsCount },
    ];
    return (
        <div className="w-full max-w-xs shrink-0 self-start border border-brand-purple/30 bg-card">
            <div className="border-b border-border px-4 py-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-brand-purple">// stats</span>
            </div>
            <div className="divide-y divide-border">
                {rows.map((r) => (
                    <div key={r.label} className="flex items-center justify-between gap-3 px-4 py-3">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{r.label} =</span>
                        <span className="text-sm font-bold text-foreground">{r.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Sits directly under StatsBox, for a visitor viewing someone else's
// dossier: a compact "connect" panel with quick share/contact actions. For
// the owner viewing their own dossier there's nothing to show here -- the
// edit affordance is the pencil badge on the avatar itself.
function QuickPanel({ member, isOwner }) {
    const [copied, setCopied] = useState(false);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard unavailable -- fail silent, nothing else to fall back to */
        }
    };

    if (isOwner) return null;

    return (
        <div className="mt-4 w-full max-w-xs shrink-0 border border-border bg-card">
            <div className="border-b border-border px-4 py-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">// connect</span>
            </div>
            <div className="flex flex-wrap gap-2 p-4">
                <button
                    onClick={copyLink}
                    className="flex items-center gap-2 border border-border px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple"
                >
                    {copied ? <Check className="h-3 w-3 text-brand-purple" /> : <Share2 className="h-3 w-3" />} {copied ? "copied" : "share"}
                </button>
                {member.github && (
                    <a href={member.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-border px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple">
                        <Github className="h-3 w-3" /> github
                    </a>
                )}
                {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-border px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple">
                        <Linkedin className="h-3 w-3" /> linkedin
                    </a>
                )}
                {member.email && (
                    <a href={`mailto:${member.email}`} className="flex items-center gap-2 border border-border px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple">
                        <Mail className="h-3 w-3" /> email
                    </a>
                )}
            </div>
        </div>
    );
}

export default function MemberProfile() {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [posts, setPosts] = useState([]);
    const [projects, setProjects] = useState([]);
    const [attendance, setAttendance] = useState(undefined); // undefined = still loading, null = no record found
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        Promise.allSettled([
            db.entities.Member.get(id),
            db.entities.Post.list("-created_date", 100),
            db.entities.Project.list("-created_date", 200),
        ]).then(([m, p, pr]) => {
            if (!active) return;
            const mem = m.status === "fulfilled" ? m.value : null;
            setMember(mem);
            const allPosts = p.status === "fulfilled" ? p.value || [] : [];
            const name = mem?.name;
            const mine = allPosts.filter((x) => {
                if (name && x.author === name) return true;
                if (name && Array.isArray(x.contributors)) {
                    return x.contributors.some((c) => (typeof c === "string" ? c === name : c?.name === name));
                }
                return false;
            });
            setPosts(mine);
            // Projects this member has equal charge over: ones they created,
            // or ones they're listed as a collaborator on.
            const allProjects = pr.status === "fulfilled" ? pr.value || [] : [];
            const myProjects = allProjects.filter((x) => x.member_id === id || (Array.isArray(x.collaborator_ids) && x.collaborator_ids.includes(id)));
            setProjects(myProjects);
            setLoading(false);

            if (mem) {
                getAttendance(mem).then((val) => { if (active) setAttendance(val); });
            }
        });
        return () => { active = false; };
    }, [id]);

    const currentMember = getCurrentMember();
    const isOwner = !!currentMember && currentMember.id === id;

    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />

            {loading ? (
                <div className="flex min-h-screen items-center justify-center pt-16">
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">// loading profile…</span>
                </div>
            ) : !member ? (
                <div className="flex min-h-screen flex-col items-center justify-center gap-6 pt-16">
                    <span className="text-sm text-muted-foreground">// error_404: member not found</span>
                    <Link to="/members" className="border border-brand-purple px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black">
                        Back to Members
                    </Link>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <header className="border-b border-border blueprint-grid pt-16">
                        <div className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-20">
                            <Link to="/members" className="mb-10 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-brand-pink">
                                <ArrowLeft className="h-3 w-3" /> /members
                            </Link>

                            <div className="flex flex-col items-start gap-8 md:flex-row md:items-start md:justify-between">
                                <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
                                    <Avatar m={member} canEdit={isOwner} />
                                    <div className="min-w-0">
                                        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">{member.role || "member"} · dossier</span>
                                        <h1 className="mt-2 text-3xl font-bold uppercase leading-[0.95] tracking-tight md:text-5xl">{member.name}</h1>
                                        {member.domain && (
                                            <span className="mt-4 inline-block border border-brand-purple/30 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-brand-purple">{member.domain}</span>
                                        )}
                                        {(member.class || member.section) && (
                                            <p className="mt-4 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                                                {member.class && `Class ${member.class}`}{member.class && member.section ? " · " : ""}{member.section && `Section ${member.section}`}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Stats box: sits opposite the name, next to the circuit animation below */}
                                <div className="w-full max-w-xs shrink-0">
                                    <StatsBox projectsCount={projects.length} attendance={attendance} postsCount={posts.length} />
                                    <QuickPanel member={member} isOwner={isOwner} />
                                </div>
                            </div>

                            <DecorArt variant="circuit" className="mt-10 w-full max-w-xs opacity-60" />
                        </div>
                    </header>

                    <div className="mx-auto max-w-5xl px-4 md:px-8">
                        {/* Bio + meta */}
                        <section className="grid grid-cols-1 gap-0 border-b border-border md:grid-cols-10">
                            <aside className="border-b border-border py-10 md:col-span-3 md:border-b-0 md:border-r md:py-16 md:pr-8">
                                <div className="md:sticky md:top-24">
                                    <span className="text-[10px] uppercase tracking-[0.25em] text-brand-purple">// metadata</span>
                                    <div className="mt-6 space-y-4 border border-border bg-card p-5">
                                        <div>
                                            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">role</div>
                                            <div className="text-xs font-semibold text-foreground">{member.role || "Member"}</div>
                                        </div>
                                        {member.domain && (
                                            <div className="border-t border-border pt-4">
                                                <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">domain</div>
                                                <div className="text-xs font-semibold text-brand-purple">{member.domain}</div>
                                            </div>
                                        )}
                                        {(member.class || member.section) && (
                                            <div className="border-t border-border pt-4">
                                                <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">class / section</div>
                                                <div className="text-xs font-semibold text-foreground">{member.class || "—"}{member.section ? ` · ${member.section}` : ""}</div>
                                            </div>
                                        )}
                                        <div className="flex gap-2 border-t border-border pt-4">
                                            {member.github && (
                                                <a href={member.github} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple"><Github className="h-4 w-4" /></a>
                                            )}
                                            {member.linkedin && (
                                                <a href={member.linkedin} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple"><Linkedin className="h-4 w-4" /></a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            <div className="py-10 md:col-span-7 md:py-16 md:pl-10">
                                {member.bio && (
                                    <div>
                                        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">// about</span>
                                        <p className="mt-4 text-base leading-relaxed text-foreground/90">{member.bio}</p>
                                    </div>
                                )}

                                {skillsList(member.skills).length > 0 && (
                                    <div className="mt-10">
                                        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-purple">// skills</span>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {skillsList(member.skills).map((s, i) => (
                                                <span key={i} className="border border-border bg-card px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Posts */}
                        <section className="border-b border-border py-16">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-brand-purple" />
                                <h2 className="text-lg font-bold uppercase tracking-tight">Articles</h2>
                                <span className="ml-2 text-[10px] text-muted-foreground">· {posts.length}</span>
                            </div>
                            {posts.length === 0 ? (
                                <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">// no articles published yet.</p>
                            ) : (
                                <div className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2">
                                    {posts.map((p) => (
                                        <Link key={p.id} to={`/article/${p.slug}`} className="group bg-card p-5 transition-colors hover:bg-brand-purple/5">
                                            <span className="text-[9px] uppercase tracking-[0.2em] text-brand-pink">{p.category || "general"}</span>
                                            <h3 className="mt-2 text-sm font-bold leading-snug group-hover:text-brand-purple">{p.title}</h3>
                                            {p.subtitle && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.subtitle}</p>}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Projects */}
                        <section className="py-16">
                            <div className="flex items-center gap-2">
                                <FolderGit2 className="h-4 w-4 text-brand-pink" />
                                <h2 className="text-lg font-bold uppercase tracking-tight">Projects</h2>
                                <span className="ml-2 text-[10px] text-muted-foreground">· {projects.length}</span>
                            </div>
                            {projects.length === 0 ? (
                                <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">// no projects linked yet.</p>
                            ) : (
                                <div className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2">
                                    {projects.map((pr) => (
                                        <div key={pr.id} className="bg-card p-5">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="text-sm font-bold">{pr.title}</h3>
                                                <span className="shrink-0 border border-border px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{pr.status || "active"}</span>
                                            </div>
                                            {pr.description && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{pr.description}</p>}
                                            {pr.github_url && (
                                                <a href={pr.github_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-brand-purple hover:text-brand-pink">
                                                    <ExternalLink className="h-3 w-3" /> repository
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </>
            )}

            <Footer />
        </div>
    );
}