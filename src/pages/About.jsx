import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import Reveal from "@/components/blog/Reveal";
import { Code2, Cpu, Palette, Lightbulb } from "lucide-react";

const SCHOOL_LOGO = "/images/school-logo-about.png";
const SCHOOL_IMG = "/images/school-photo.png";

const PILLARS = [
    {
        icon: Code2,
        title: "Digital Creation",
        desc: "Programming, app development, and software engineering that turn ideas into impactful digital experiences.",
    },
    {
        icon: Cpu,
        title: "Engineering & Robotics",
        desc: "From embedded systems and automation to intelligent robotics — building the technology that powers innovation.",
    },
    {
        icon: Palette,
        title: "Design & Visual Media",
        desc: "3D design, photography, videography, and digital storytelling where creativity meets technology.",
    },
    {
        icon: Lightbulb,
        title: "Innovation & Research",
        desc: "Ideation, emerging technologies, and interdisciplinary exploration that shape the solutions of tomorrow.",
    },
];

export default function About() {
    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />
            <PageHeader
                kicker="About"
                title="The Innovation Club"
                subtitle="Empowering Innovators of Tomorrow at Delhi Public School, Newtown."
            />

            {/* Campus banner */}
            <section className="mx-auto max-w-5xl px-4 md:px-8">
                <div className="relative overflow-hidden border border-border">
                    <img
                        src={SCHOOL_IMG}
                        alt="DPS Newtown campus"
                        className="h-[36vh] w-full object-cover md:h-[46vh]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                </div>
            </section>

            {/* Who we are */}
            <Reveal>
                <section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-20">
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Who we are</h2>
                    <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
                        The Innovation Club is a collective of thinkers, builders, and researchers at
                        Delhi Public School, Newtown. We treat every idea as a structure to be engineered —
                        a place where curiosity inspires discovery and innovation transforms ideas into
                        meaningful solutions through research, technology, and collaboration.
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                        From programming and app development to robotics, design, and interdisciplinary
                        research, the club gives students a lab to experiment, build, and showcase their
                        work — at hackathons, exhibitions, and competitions at every level.
                    </p>
                </section>
            </Reveal>

            {/* What we do */}
            <Reveal>
                <section className="mx-auto max-w-5xl px-4 pb-16 md:px-8 md:pb-20">
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What we do</h2>
                    <div className="mt-6 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
                        {PILLARS.map((p) => (
                            <div key={p.title} className="group bg-card p-6 transition-colors hover:bg-secondary">
                                <p.icon className="h-7 w-7 text-brand-purple transition-colors group-hover:text-brand-pink" />
                                <h3 className="mt-4 text-sm font-bold uppercase tracking-wide">{p.title}</h3>
                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </Reveal>

            {/* The school */}
            <Reveal>
                <section className="border-t border-border">
                    <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-16 md:grid-cols-12 md:px-8 md:py-20">
                        <div className="md:col-span-4">
                            <div className="border border-border bg-card p-6 text-center">
                                <img
                                    src={SCHOOL_LOGO}
                                    alt="Delhi Public School, Newtown"
                                    className="mx-auto w-full max-w-[180px] rounded-md"
                                />
                                <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-brand-pink">
                                    Service Before Self
                                </p>
                            </div>
                        </div>
                        <div className="md:col-span-8">
                            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Delhi Public School, Newtown</h2>
                            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                                DPS Newtown, under the aegis of the DPS Society, is a state-of-the-art modern
                                school — the only DPS situated in the heart of Newtown. Spread over a sprawling
                                12-acre plush campus, the school is equipped with the best of amenities, giving
                                students ample opportunities to manifest their talents. Since its inception on
                                25th April 2005, the school has striven to provide a holistic education experience
                                that ensures high standards of academic excellence, complemented by a kaleidoscope
                                of co-curricular activities.
                            </p>
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* Motto */}
            <section className="border-t border-b border-border bg-card/40">
                <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-8 md:py-20">
                    <p className="text-xl font-bold tracking-tight md:text-2xl text-brand-purple">
                        "Empowering Innovators of Tomorrow."
                    </p>
                </div>
            </section>

            {/* Credits */}
            <Reveal>
                <section className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-20">
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Credits</h2>
                    <div className="mt-6 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
                        <div className="bg-card p-6">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-purple">Founders</span>
                            <p className="mt-3 text-sm leading-relaxed text-foreground">Reyansh Kumar &amp; Soham Sahu</p>
                        </div>
                        <div className="bg-card p-6">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-purple">Teacher In Charges</span>
                            <p className="mt-3 text-sm leading-relaxed text-foreground">Deepti ma'am &amp; Madhurima ma'am</p>
                        </div>
                    </div>
                </section>
            </Reveal>

            <Footer />
        </div>
    );
}