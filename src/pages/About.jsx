import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import Reveal from "@/components/blog/Reveal";
import Counter from "@/components/blog/Counter";
import CardFx from "@/components/blog/CardFx";
import { Code2, Cpu, Palette, Lightbulb, ArrowUpRight } from "lucide-react";

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

const STATS = [
    { value: 2005, label: "Founded", pad: 0, suffix: "" },
    { value: 12, label: "Acre campus", pad: 0, suffix: "" },
    { value: 4, label: "Focus domains", pad: 0, suffix: "" },
];

const SectionLabel = ({ children }) => (
    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-brand-pink">
        <span className="h-px w-6 bg-brand-pink" />
        {children}
    </span>
);

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

            {/* Campus banner with framing */}
            <section className="mx-auto max-w-5xl px-4 pt-14 md:px-8">
                <Reveal>
                    <div className="group relative">
                        <div className="pointer-events-none absolute -inset-2 border border-brand-purple/20 transition-all duration-500 group-hover:-inset-3 group-hover:border-brand-pink/40" />
                        <div className="relative overflow-hidden border border-border">
                            <img
                                src={SCHOOL_IMG}
                                alt="DPS Newtown campus"
                                className="h-[36vh] w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105 md:h-[46vh]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                            <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-white">
                                DPS Newtown · Campus
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* Stats strip */}
            <Reveal>
                <section className="mx-auto mt-10 max-w-5xl px-4 md:px-8">
                    <div className="grid grid-cols-3 gap-px border border-border bg-border">
                        {STATS.map((s) => (
                            <div key={s.label} className="bg-card p-5 text-center md:p-8">
                                <p className="text-3xl font-bold text-brand-purple md:text-5xl">
                                    <Counter value={s.value} pad={s.pad} duration={1600} />
                                    {s.suffix}
                                </p>
                                <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </Reveal>

            {/* Who we are */}
            <Reveal>
                <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-12 md:px-8 md:py-24">
                    <div className="md:col-span-5">
                        <SectionLabel>Who we are</SectionLabel>
                        <h2 className="mt-4 text-3xl font-bold uppercase leading-[1.05] tracking-tight md:text-4xl">
                            Systematic
                            <span className="block text-brand-purple">Brilliance</span>
                        </h2>
                    </div>
                    <div className="md:col-span-7">
                        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
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
                    </div>
                </section>
            </Reveal>

            {/* What we do */}
            <Reveal>
                <section className="mx-auto max-w-5xl px-4 pb-16 md:px-8 md:pb-24">
                    <SectionLabel>What we do</SectionLabel>
                    <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight md:text-4xl">Four domains</h2>
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {PILLARS.map((p, i) => (
                            <CardFx key={p.title} className="flex h-full flex-col border border-border bg-card p-6 transition-colors hover:border-brand-purple/60 md:p-8">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center border border-brand-purple/40 text-brand-purple transition-all duration-300 group-hover:rotate-6 group-hover:border-brand-pink group-hover:text-brand-pink">
                                        <p.icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-4xl font-bold text-brand-purple/15 transition-colors group-hover:text-brand-pink/30">
                                        0{i + 1}
                                    </span>
                                </div>
                                <h3 className="mt-6 text-sm font-bold uppercase tracking-wide">{p.title}</h3>
                                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground md:text-sm">{p.desc}</p>
                                <ArrowUpRight className="mt-6 h-4 w-4 text-brand-purple opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100" />
                            </CardFx>
                        ))}
                    </div>
                </section>
            </Reveal>

            {/* The school */}
            <Reveal>
                <section className="border-t border-border">
                    <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 md:grid-cols-12 md:px-8 md:py-24">
                        <div className="md:col-span-4">
                            <div className="relative border border-border bg-card p-8 text-center">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-purple to-transparent" />
                                <img
                                    src={SCHOOL_LOGO}
                                    alt="Delhi Public School, Newtown"
                                    className="mx-auto w-full max-w-[180px] rounded-md transition-transform duration-500 hover:scale-105"
                                />
                                <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-brand-pink">
                                    Service Before Self
                                </p>
                            </div>
                        </div>
                        <div className="md:col-span-8">
                            <SectionLabel>The school</SectionLabel>
                            <h2 className="mt-4 text-3xl font-bold uppercase leading-[1.05] tracking-tight md:text-4xl">
                                Delhi Public School,
                                <span className="block text-brand-purple">Newtown</span>
                            </h2>
                            <p className="mt-6 text-sm leading-relaxed text-muted-foreground md:text-base">
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
            <section className="relative overflow-hidden border-y border-border bg-card/40">
                <div className="blueprint-grid absolute inset-0 opacity-60" />
                <div className="relative mx-auto max-w-4xl px-4 py-20 text-center md:px-8 md:py-28">
                    <p className="text-2xl font-bold tracking-tight md:text-4xl">
                        <span className="bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple bg-clip-text text-transparent">
                            “Empowering Innovators of Tomorrow.”
                        </span>
                    </p>
                </div>
            </section>

            {/* Credits */}
            <Reveal>
                <section className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
                    <SectionLabel>Credits</SectionLabel>
                    <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight md:text-4xl">The people behind it</h2>
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <CardFx className="border border-border bg-card p-6 md:p-8">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-purple">Founders</span>
                            <p className="mt-4 text-lg font-bold uppercase tracking-tight">Reyansh Kumar</p>
                            <p className="text-lg font-bold uppercase tracking-tight text-brand-pink">&amp; Soham Sahu</p>
                        </CardFx>
                        <CardFx className="border border-border bg-card p-6 md:p-8">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-purple">Teacher In Charges</span>
                            <p className="mt-4 text-lg font-bold uppercase tracking-tight">Deepti ma'am</p>
                            <p className="text-lg font-bold uppercase tracking-tight text-brand-pink">&amp; Madhurima ma'am</p>
                        </CardFx>
                    </div>
                </section>
            </Reveal>

            <Footer />
        </div>
    );
}
