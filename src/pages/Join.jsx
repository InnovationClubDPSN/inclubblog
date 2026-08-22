import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import DecorArt from "@/components/blog/DecorArt";
import { Link } from "react-router-dom";

const STEPS = [
    { n: "01", t: "Discover an Idea", d: "Start with a problem you want to solve or an idea you're excited to explore. Every project begins with curiosity, and you don't need prior experience to get started." },
    { n: "02", t: "Create Your Project", d: "Register your project with the club, define your objectives, and outline a roadmap. This becomes the foundation for everything you'll build." },
    { n: "03", t: "Set Up Your Repository", d: "Create a GitHub repository to organize your code, designs, documentation, and progress. Keeping your work well-documented makes collaboration and development much easier." },
    { n: "04", t: "Connect with the Community", d: "Reach out to mentors and fellow members for feedback, technical guidance, and collaboration. Share updates, ask questions, and grow alongside a community of builders." },
    { n: "05", t: "Build, Iterate & Improve", d: "Develop your project through continuous experimentation and testing. Refine your ideas, overcome challenges, and turn early concepts into polished, impactful solutions." },
    { n: "06", t: "Compete & Showcase", d: "Take your project beyond the club by participating in hackathons, exhibitions, research conferences, and competitions at intercity, national, and international levels. Present your work, gain recognition, and create opportunities for future collaborations and achievements. 🚀" },
];

export default function Join() {
    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />
            <PageHeader
                kicker="protocol — join"
                title="Join the Club"
                subtitle="Six steps from a spark of curiosity to the global stage. The door is open — walk through it."
            />
            <div className="mx-auto max-w-md px-4 pt-10 md:px-8">
                <DecorArt variant="wave" className="mx-auto w-48 opacity-70" />
            </div>
            <section className="mx-auto max-w-4xl px-4 py-16 md:px-8">
                <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
                    {STEPS.map((s) => (
                        <div key={s.n} className="bg-card p-6 md:p-8">
                            <span className="text-[10px] font-bold text-brand-purple">{s.n}</span>
                            <h3 className="mt-2 text-lg font-bold uppercase tracking-tight">{s.t}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 border border-brand-purple/40 bg-card p-6 text-center md:p-10">
                    <h3 className="text-xl font-bold uppercase tracking-tight md:text-2xl">Ready to begin?</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                        Reach out and tell us what you want to build. We'll point you to the right domain and your first session.
                    </p>
                    <Link to="/contact" className="mt-6 inline-flex items-center gap-2 bg-brand-purple px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink">
                        Get in touch →
                    </Link>
                </div>
            </section>
            <Footer />
        </div>
    );
}