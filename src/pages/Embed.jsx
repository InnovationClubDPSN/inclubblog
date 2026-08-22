import { useEffect, useState } from "react";
import { db } from "@/api/dataClient";
import Hero from "@/components/blog/Hero";
import BlogFeed from "@/components/blog/BlogFeed";
import About from "@/components/blog/About";
import Archive from "@/components/blog/Archive";
import Reveal from "@/components/blog/Reveal";
import Marquee from "@/components/blog/Marquee";

export default function Embed() {
    const [posts, setPosts] = useState([]);
    const [members, setMembers] = useState([]);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        Promise.all([
            db.entities.Post.list("-created_date", 50),
            db.entities.Member.list("name", 100),
            db.entities.Domain.list("name", 100),
        ])
            .then(([p, m, d]) => {
                if (!active) return;
                setPosts(p || []);
                setMembers(m || []);
                setDomains(d || []);
                setLoading(false);
            })
            .catch(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const featured = posts.find((p) => p.featured) || posts[0];
    const domainNames = domains.map((d) => d.name);
    const stats = { posts: posts.length, members: members.length, domains: domains.length };

    return (
        <div className="min-h-screen bg-background">
            <main>
                <Hero featured={featured} stats={stats} />
                {loading ? (
                    <div className="border-b border-border py-32 text-center">
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">// assembling feed...</span>
                    </div>
                ) : (
                    <>
                        <Reveal>
                            <Marquee
                                className="border-b border-border bg-card/40 py-5"
                                items={["Ideate", "Build", "Ship", "Research", "Innovate", "Collaborate"]}
                            />
                        </Reveal>
                        <Reveal><BlogFeed posts={posts} /></Reveal>
                        <Reveal><About /></Reveal>
                        <Reveal><Archive posts={posts} domains={domainNames} /></Reveal>
                    </>
                )}
            </main>
        </div>
    );
}