import { useEffect, useState } from "react";
import { db } from "@/api/dataClient";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import Reveal from "@/components/blog/Reveal";
import DecorArt from "@/components/blog/DecorArt";
import { Github, Users } from "lucide-react";
import ProjectLinks from "@/components/blog/ProjectLinks";

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        Promise.all([
            db.entities.Project.list("-created_date", 100),
            db.entities.ProjectUpdate.list("-created_date", 500),
            db.entities.Member.list("name", 200),
        ])
            .then(([p, u, m]) => {
                if (!active) return;
                setProjects(p || []);
                setUpdates(u || []);
                setMembers(m || []);
                setLoading(false);
            })
            .catch(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const updatesFor = (pid) =>
        updates.filter((u) => u.project_id === pid).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />
            <PageHeader
                kicker="build log — projects"
                title="Active Projects"
                subtitle="Personal projects from members — live timelines, short notes, and GitHub repos."
            />
            <div className="mx-auto max-w-md px-4 pt-10 md:px-8">
                <DecorArt variant="circuit" className="mx-auto w-40 opacity-70" />
            </div>
            <section className="mx-auto max-w-5xl px-4 py-12 md:px-8">
                {loading ? (
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">// loading projects...</p>
                ) : projects.length === 0 ? (
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">// no active projects yet.</p>
                ) : (
                    <div className="space-y-8">
                        {projects.map((pr) => {
                            const ups = updatesFor(pr.id);
                            return (
                                <Reveal key={pr.id}>
                                    <div className="border border-border bg-card">
                                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
                                            <div>
                        <span className={`inline-block border px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] ${pr.status === "active" ? "border-brand-purple text-brand-purple" : pr.status === "completed" ? "border-green-500 text-green-500" : "border-muted-foreground text-muted-foreground"}`}>
                          {pr.status || "active"}
                        </span>
                                                <h2 className="mt-2 text-lg font-bold uppercase tracking-tight">{pr.title}</h2>
                                                {pr.member_name && <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">by {pr.member_name}</p>}
                                                {pr.collaborator_ids?.length > 0 && (
                                                    <p className="mt-1 flex flex-wrap items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                                                        <Users className="h-3 w-3" /> with{" "}
                                                        {pr.collaborator_ids.map((id) => members.find((m) => m.id === id)?.name || "member").join(", ")}
                                                    </p>
                                                )}
                                            </div>
                                            <a href={pr.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-border px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-foreground transition-colors hover:border-brand-purple hover:text-brand-purple">
                                                <Github className="h-3.5 w-3.5" /> repo
                                            </a>
                                        </div>
                                        {pr.links?.length > 0 && (
                                            <div className="px-5 pt-4">
                                                <ProjectLinks links={pr.links} />
                                            </div>
                                        )}
                                        {pr.description && <p className="px-5 py-4 text-xs leading-relaxed text-muted-foreground">{pr.description}</p>}
                                        {pr.problem_statement && (
                                            <div className="px-5 pb-4">
                                                <span className="text-[9px] uppercase tracking-[0.2em] text-brand-pink">// problem statement</span>
                                                <p className="mt-1 text-xs leading-relaxed text-foreground/80">{pr.problem_statement}</p>
                                            </div>
                                        )}
                                        {ups.length > 0 && (
                                            <div className="border-t border-border p-5">
                                                <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">// timeline</span>
                                                <div className="mt-4 space-y-4 border-l border-border pl-5">
                                                    {ups.map((u) => (
                                                        <div key={u.id} className="relative">
                                                            <span className="absolute -left-[26px] top-1 h-2 w-2 rounded-full bg-brand-purple" />
                                                            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                                                                <span>{new Date(u.created_date).toLocaleDateString()}</span>
                                                                {u.member_name && <span>· {u.member_name}</span>}
                                                            </div>
                                                            <p className="mt-1 text-xs leading-relaxed text-foreground/90">{u.body}</p>
                                                            {u.images?.length > 0 && (
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {u.images.map((img, k) => (
                                                                        <a key={k} href={img} target="_blank" rel="noreferrer" className="block h-16 w-16 overflow-hidden border border-border">
                                                                            <img src={img} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                )}
            </section>
            <Footer />
        </div>
    );
}