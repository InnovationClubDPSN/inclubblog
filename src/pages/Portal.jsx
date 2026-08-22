import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "@/api/dataClient";
import { getCurrentMember, logoutMember, contributorMatches, admissionDigits, refreshCurrentMember, postProjectUpdate, hasChargeOfProject } from "@/lib/memberSession";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import PostForm from "@/components/blog/PostForm";
import ProjectForm from "@/components/blog/ProjectForm";
import PasswordSetup from "@/components/blog/PasswordSetup";
import ProfileForm from "@/components/blog/ProfileForm";
import ProjectLinks from "@/components/blog/ProjectLinks";
import { Github, LogOut, Plus, Pencil, Send, Loader2, Upload, Vote, X, ShieldCheck, Users, Megaphone, Pin } from "lucide-react";

// Active = not expired. Pinned announcements float to the top, then newest first.
function activeAnnouncements(list) {
    const now = new Date();
    return (list || [])
        .filter((a) => !a.expires_at || new Date(a.expires_at) > now)
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.created_date) - new Date(a.created_date));
}

function wordCount(s) {
    return (s || "").trim().split(/\s+/).filter(Boolean).length;
}

export default function Portal() {
    const [member, setMember] = useState(() => getCurrentMember());
    const [posts, setPosts] = useState([]);
    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState(null);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [updateText, setUpdateText] = useState({});
    const [updateImages, setUpdateImages] = useState({});
    const [uploadingImages, setUploadingImages] = useState({});
    const [postingUpdate, setPostingUpdate] = useState({});
    const navigate = useNavigate();
    const { toast } = useToast();

    const reload = () => {
        if (!member) { setLoading(false); return; }
        setLoading(true);
        Promise.all([
            db.entities.Post.list("-created_date", 200),
            db.entities.Project.list("-created_date", 100),
            db.entities.ProjectUpdate.list("-created_date", 500),
            db.entities.Member.list("name", 200),
            db.entities.Announcement.list("-created_date", 50),
        ])
            .then(([p, pr, u, m, a]) => {
                setPosts(p || []);
                // Projects you have equal charge over: ones you created, or
                // ones you're listed as a collaborator on.
                setProjects((pr || []).filter((x) => hasChargeOfProject(member, x)));
                setUpdates(u || []);
                setMembers(m || []);
                setAnnouncements(a || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => { reload();   }, [member?.id]);

    // Sync the full member record from the database so admin-entered details
    // (class, section, skills, bio, domain) load into the portal form/banner.
    useEffect(() => {
        refreshCurrentMember()
            .then((full) => { if (full) setMember(full); })
            .catch(() => {});
    }, []);

    if (!member) {
        return (
            <div className="min-h-screen bg-background">
                <CursorReticle />
                <Navbar />
                <PageHeader kicker="members — portal" title="Member Portal" subtitle="Log in with your admission number to manage your posts and projects." />
                <div className="mx-auto max-w-md px-4 py-16 text-center md:px-8">
                    <Link to="/member-login" className="inline-block border border-brand-purple px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black">
                        → Member Login
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const doLogout = () => { logoutMember(); setMember(null); navigate("/"); };
    const goAdmin = () => { try { sessionStorage.setItem("ic_admin_unlocked", "1"); } catch {} navigate("/admin"); };
    const field = "w-full border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand-purple focus:outline-none";

    // First-login password gate
    if (member.needsPassword) {
        return (
            <div className="min-h-screen bg-background">
                <CursorReticle />
                <Navbar />
                <PageHeader kicker="members — portal" title="Member Portal" subtitle={`Welcome, ${member.name}. Set a password to continue.`} />
                <div className="mx-auto max-w-md px-4 py-10 md:px-8">
                    <PasswordSetup onSet={(updated) => { setMember(updated); reload(); }} />
                    <button onClick={doLogout} className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-brand-pink">
                        <LogOut className="h-3 w-3" /> cancel & logout
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const myPosts = posts.filter((p) => contributorMatches(member.name, p.contributors));
    const voteId = admissionDigits(member.admission_number) || member.admission_number || "";

    const onPickImages = async (projectId, files) => {
        const arr = Array.from(files || []);
        if (!arr.length) return;
        setUploadingImages((s) => ({ ...s, [projectId]: true }));
        try {
            const urls = [];
            for (const f of arr) {
                const { file_url } = await db.integrations.Core.UploadFile({ file: f });
                urls.push(file_url);
            }
            setUpdateImages((s) => ({ ...s, [projectId]: [...(s[projectId] || []), ...urls] }));
        } catch (err) {
            toast({ title: "Image upload failed", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setUploadingImages((s) => ({ ...s, [projectId]: false }));
        }
    };

    const removeImage = (projectId, idx) => {
        setUpdateImages((s) => ({ ...s, [projectId]: (s[projectId] || []).filter((_, i) => i !== idx) }));
    };

    const addUpdate = async (projectId) => {
        const text = (updateText[projectId] || "").trim();
        if (wordCount(text) > 30) {
            toast({ title: "Updates must be 30 words or fewer", variant: "destructive" });
            return;
        }
        setPostingUpdate((s) => ({ ...s, [projectId]: true }));
        try {
            await postProjectUpdate(projectId, text, updateImages[projectId] || []);
            toast({ title: "Update posted" });
            setUpdateText((s) => ({ ...s, [projectId]: "" }));
            setUpdateImages((s) => ({ ...s, [projectId]: [] }));
            reload();
        } catch (err) {
            toast({ title: "Failed to post update", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setPostingUpdate((s) => ({ ...s, [projectId]: false }));
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />
            <PageHeader kicker="members — portal" title="Member Portal" subtitle={`Signed in as ${member.name}${member.role ? ` · ${member.role}` : ""}`} />
            <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-purple">// session active</span>
                    <div className="flex items-center gap-2">
                        {String(member.role || "").toLowerCase() === "president" && (
                            <button onClick={goAdmin} className="flex items-center gap-2 border border-brand-purple/50 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black">
                                <ShieldCheck className="h-3 w-3" /> admin
                            </button>
                        )}
                        <button onClick={doLogout} className="flex items-center gap-2 border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-brand-pink hover:text-brand-pink">
                            <LogOut className="h-3 w-3" /> logout
                        </button>
                    </div>
                </div>

                {/* Announcements — admin-issued, visible to members only, in-portal */}
                {activeAnnouncements(announcements).length > 0 && (
                    <section className="mb-10 space-y-3">
                        {activeAnnouncements(announcements).map((a) => (
                            <div key={a.id} className={`border p-4 ${a.pinned ? "border-brand-pink/50 bg-brand-pink/5" : "border-border bg-card"}`}>
                                <div className="flex items-center gap-2">
                                    {a.pinned ? <Pin className="h-3.5 w-3.5 shrink-0 text-brand-pink" /> : <Megaphone className="h-3.5 w-3.5 shrink-0 text-brand-purple" />}
                                    <span className="text-sm font-bold">{a.title}</span>
                                    <span className="ml-auto shrink-0 text-[9px] uppercase tracking-[0.15em] text-muted-foreground">{new Date(a.created_date).toLocaleDateString()}</span>
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-foreground/90">{a.body}</p>
                            </div>
                        ))}
                    </section>
                )}

                {/* Voting link */}
                <a
                    href={`https://incvoting.vercel.app/?id=${voteId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-10 flex items-center justify-between gap-3 border border-brand-pink/40 bg-card px-5 py-4 transition-colors hover:border-brand-pink"
                >
          <span className="flex items-center gap-2">
            <Vote className="h-4 w-4 text-brand-pink" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">Club Discussions — Vote</span>
          </span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-brand-pink">open ↗</span>
                </a>

                {/* My details — class / section / domain / skills / bio */}
                <section className="mb-14">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">// your details</span>
                            <h2 className="mt-2 text-xl font-bold uppercase tracking-tight">My Details</h2>
                        </div>
                        <button
                            onClick={() => setProfileOpen((v) => !v)}
                            className="flex items-center gap-2 border border-brand-purple/50 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black"
                        >
                            <Pencil className="h-3 w-3" /> {profileOpen ? "close" : "edit"}
                        </button>
                    </div>

                    <div className="mb-5 flex flex-wrap gap-x-6 gap-y-2 border border-border bg-card px-5 py-4 text-xs">
                        {member.class && <span><span className="text-muted-foreground">Class:</span> <strong className="ml-1">{member.class}</strong></span>}
                        {member.section && <span><span className="text-muted-foreground">Section:</span> <strong className="ml-1">{member.section}</strong></span>}
                        {member.domain && <span><span className="text-muted-foreground">Domain:</span> <strong className="ml-1">{member.domain}</strong></span>}
                        {member.skills && <span><span className="text-muted-foreground">Skills:</span> <strong className="ml-1">{member.skills}</strong></span>}
                        {!member.class && !member.section && !member.domain && !member.skills && (
                            <span className="text-muted-foreground">// no details yet — click edit to add your class, section & domain.</span>
                        )}
                    </div>

                    {profileOpen && (
                        <ProfileForm
                            member={member}
                            onSaved={(updated) => { setMember(updated); setProfileOpen(false); }}
                        />
                    )}
                </section>

                {/* Posts the member contributes to */}
                <section className="mb-14">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">// posts you contribute to</span>
                    <h2 className="mt-2 mb-6 text-xl font-bold uppercase tracking-tight">Contributed Posts</h2>
                    {editingPost ? (
                        <PostForm editing={editingPost} onSaved={() => { setEditingPost(null); reload(); }} onCancel={() => setEditingPost(null)} />
                    ) : loading ? (
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">// loading...</p>
                    ) : myPosts.length === 0 ? (
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">// no posts assigned to you yet.</p>
                    ) : (
                        <div className="grid gap-px border border-border bg-border">
                            {myPosts.map((p) => (
                                <div key={p.id} className="flex items-center justify-between gap-3 bg-card px-5 py-4">
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-bold">{p.title}</div>
                                        <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{p.category}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link to={`/article/${p.slug}`} className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-brand-purple">view</Link>
                                        <button onClick={() => setEditingPost(p)} className="flex items-center gap-1 border border-brand-purple/50 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black">
                                            <Pencil className="h-3 w-3" /> edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Active projects */}
                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">// your projects</span>
                            <h2 className="mt-2 text-xl font-bold uppercase tracking-tight">Active Projects</h2>
                        </div>
                        <button onClick={() => { setEditingProject(null); setShowProjectForm((v) => !v); }} className="flex items-center gap-2 border border-brand-purple/50 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black">
                            <Plus className="h-3 w-3" /> new project
                        </button>
                    </div>

                    {showProjectForm && (
                        <div className="mb-6">
                            <ProjectForm
                                editing={editingProject}
                                member={member}
                                members={members}
                                onSaved={() => { setShowProjectForm(false); setEditingProject(null); reload(); }}
                                onCancel={() => { setShowProjectForm(false); setEditingProject(null); }}
                            />
                        </div>
                    )}

                    {loading ? (
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">// loading...</p>
                    ) : projects.length === 0 ? (
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">// no projects yet — create one (GitHub link required).</p>
                    ) : (
                        <div className="space-y-6">
                            {projects.map((pr) => {
                                const ups = updates.filter((u) => u.project_id === pr.id).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
                                return (
                                    <div key={pr.id} className="border border-border bg-card">
                                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
                                            <div className="min-w-0">
                                                <span className="text-[9px] uppercase tracking-[0.15em] text-brand-purple">{pr.status || "active"}</span>
                                                {pr.member_id !== member.id && pr.member_name !== member.name && (
                                                    <span className="ml-2 text-[9px] uppercase tracking-[0.15em] text-brand-pink">// collaborating</span>
                                                )}
                                                <h3 className="mt-1 text-base font-bold">{pr.title}</h3>
                                                {pr.member_name && pr.member_id !== member.id && (
                                                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">created by {pr.member_name}</p>
                                                )}
                                                {pr.description && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{pr.description}</p>}
                                                {pr.problem_statement && (
                                                    <div className="mt-3 border-l-2 border-brand-pink/50 pl-3">
                                                        <span className="text-[9px] uppercase tracking-[0.2em] text-brand-pink">// problem</span>
                                                        <p className="mt-1 text-xs leading-relaxed text-foreground/80">{pr.problem_statement}</p>
                                                    </div>
                                                )}
                                                <a href={pr.github_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-brand-purple hover:text-brand-pink">
                                                    <Github className="h-3 w-3" /> repo
                                                </a>
                                                {pr.links?.length > 0 && (
                                                    <div className="mt-3">
                                                        <ProjectLinks links={pr.links} />
                                                    </div>
                                                )}
                                                {pr.collaborator_ids?.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                                        <Users className="h-3 w-3 text-muted-foreground" />
                                                        {pr.collaborator_ids.map((id) => (
                                                            <span key={id} className="border border-border px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                                                                {members.find((m) => m.id === id)?.name || "member"}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button onClick={() => { setEditingProject(pr); setShowProjectForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center gap-1 border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple">
                                                <Pencil className="h-3 w-3" /> edit
                                            </button>
                                        </div>

                                        {ups.length > 0 && (
                                            <div className="border-t border-border p-5">
                                                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">// updates ({ups.length})</span>
                                                <div className="mt-4 space-y-4 border-l border-border pl-5">
                                                    {ups.map((u) => (
                                                        <div key={u.id} className="relative">
                                                            <span className="absolute -left-[26px] top-1 h-2 w-2 rounded-full bg-brand-pink" />
                                                            <div className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">{new Date(u.created_date).toLocaleDateString()}</div>
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

                                        {/* Add update */}
                                        <div className="border-t border-border p-5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                                add update (max 30 words · {wordCount(updateText[pr.id] || "")}/30)
                                            </label>
                                            <textarea
                                                className={`${field} mt-2 min-h-[80px]`}
                                                value={updateText[pr.id] || ""}
                                                onChange={(e) => setUpdateText((s) => ({ ...s, [pr.id]: e.target.value }))}
                                                placeholder="What did you work on?"
                                            />
                                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                                <label className="flex cursor-pointer items-center gap-2 border border-border px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple">
                                                    {uploadingImages[pr.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                                    attach images
                                                    <input type="file" accept="image/*" multiple className="hidden" disabled={uploadingImages[pr.id]} onChange={(e) => onPickImages(pr.id, e.target.files)} />
                                                </label>
                                                <button onClick={() => addUpdate(pr.id)} disabled={postingUpdate[pr.id]} className="flex items-center gap-2 bg-brand-purple px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50">
                                                    {postingUpdate[pr.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} post update
                                                </button>
                                            </div>
                                            {(updateImages[pr.id] || []).length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {(updateImages[pr.id] || []).map((img, k) => (
                                                        <div key={k} className="relative h-16 w-16 overflow-hidden border border-border">
                                                            <img src={img} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                                                            <button type="button" onClick={() => removeImage(pr.id, k)} className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center bg-background/80 text-brand-pink hover:bg-brand-pink hover:text-black">
                                                                <X className="h-2.5 w-2.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-10">
                        <Link to="/projects" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-brand-purple">→ view all public projects</Link>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
}