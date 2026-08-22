import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import DecorArt from "@/components/blog/DecorArt";

const RULES = [
    { t: "Intellectual honesty", d: "Credit the work of others. Never present borrowed ideas as your own. Cite sources, data, and collaborators." },
    { t: "Rigor before reach", d: "Verify before you publish. A hypothesis you cannot falsify is a belief, not a finding." },
    { t: "Respect the room", d: "We come from different domains and levels. Disagree with ideas, never with people. Listen before you respond." },
    { t: "Build, don't gatekeep", d: "Share methods, code, and failures openly. The frontier grows when knowledge compounds." },
    { t: "Safety is non-negotiable", d: "In the lab and in the field, follow safety protocols. No result is worth a preventable injury." },
    { t: "Leave the door open", d: "Mentor those behind you. The collective is only as strong as its next generation." },
    { t: "Regular attendance", d: "Show up consistently. Sessions, reviews, and builds happen together — your presence is your commitment. Missing sessions without notice lets your team and your project down." },
    { t: "Consistency over intensity", d: "Sustained, steady effort beats sporadic bursts. Track your progress, meet your own deadlines, and keep your repository and documentation up to date week after week." },
];

export default function CodeOfConduct() {
    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />
            <PageHeader
                kicker="protocol — code of conduct"
                title="Code of Conduct"
                subtitle="The rules of engagement for every member of the Innovation Club."
            />
            <div className="mx-auto max-w-md px-4 pt-10 md:px-8">
                <DecorArt variant="circuit" className="mx-auto w-56 opacity-70" />
            </div>
            <section className="mx-auto max-w-4xl px-4 py-16 md:px-8">
                <div className="space-y-px border border-border bg-border">
                    {RULES.map((r, i) => (
                        <div key={r.t} className="bg-card p-6 md:p-8">
                            <h3 className="text-sm font-bold uppercase tracking-tight text-brand-purple md:text-base">
                                {String(i + 1).padStart(2, "0")} · {r.t}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.d}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-10 border-l-2 border-brand-pink pl-4 text-sm leading-relaxed text-muted-foreground">
                    Violations should be reported to the club leads. We address them with the same rigor we apply to our research — quietly, fairly, and constructively.
                </p>
            </section>
            <Footer />
        </div>
    );
}