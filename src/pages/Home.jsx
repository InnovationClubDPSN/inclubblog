import { useEffect, useState } from "react";
import { db } from "@/api/dataClient";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Hero from "@/components/blog/Hero";
import CyberWeekBanner from "@/components/blog/CyberWeekBanner";
import BlogFeed from "@/components/blog/BlogFeed";
import About from "@/components/blog/About";
import Archive from "@/components/blog/Archive";
import Footer from "@/components/blog/Footer";
import Reveal from "@/components/blog/Reveal";
import Marquee from "@/components/blog/Marquee";
import QotdWidget from "@/components/blog/QotdWidget";
import { normalizeSettings } from "@/lib/cyberWeek";

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [members, setMembers] = useState([]);
    const [domains, setDomains] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [cyberSettings, setCyberSettings] = useState(() => normalizeSettings(null));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        Promise.allSettled([
            db.entities.Post.list("-created_date", 50),
            db.entities.Member.list("name", 100),
            db.entities.Domain.list("name", 100),
            db.entities.Announcement.list("-created_date", 50),
            db.entities.CyberWeekSettings.list(null, 1),
        ])
            .then(([p, m, d, a, cs]) => {
                if (!active) return;
                setPosts(p.status === "fulfilled" ? p.value || [] : []);
                setMembers(m.status === "fulfilled" ? m.value || [] : []);
                setDomains(d.status === "fulfilled" ? d.value || [] : []);
                setAnnouncements(a.status === "fulfilled" ? a.value || [] : []);
                // If the settings table is missing or unreadable, fall back to defaults (section stays on).
                setCyberSettings(normalizeSettings(cs.status === "fulfilled" ? cs.value?.[0] : null));
                setLoading(false);
            });
        return () => { active = false; };
    }, []);

    const featured = posts.find((p) => p.featured) || posts[0];
    const domainNames = domains.map((d) => d.name);
    const stats = { posts: posts.length, members: members.length, domains: domains.length };

    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />
            <main>
                <Hero featured={featured} stats={stats} announcements={announcements} />
                {!loading && cyberSettings.enabled && (
                    <CyberWeekBanner
                        startsOn={cyberSettings.starts_on}
                        endsOn={cyberSettings.ends_on}
                    />
                )}

                {loading ? (
                    <div className="border-b border-border py-32 text-center">
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">Loading articles…</span>
                    </div>
                ) : (
                    <>
                        <Reveal>
                            <Marquee
                                className="border-b border-border bg-card/40 py-5"
                                items={["Ideate", "Build", "Ship", "Research", "Innovate", "Collaborate"]}
                            />
                        </Reveal>
                        <Reveal><QotdWidget /></Reveal>
                        <Reveal><BlogFeed posts={posts} /></Reveal>
                        <Reveal><About /></Reveal>
                        <Reveal><Archive posts={posts} domains={domainNames} /></Reveal>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}