import { useRef, useState } from "react";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import Reveal from "@/components/blog/Reveal";
import Counter from "@/components/blog/Counter";
import CardFx from "@/components/blog/CardFx";
import {
    Play,
    Users,
    CalendarDays,
    Globe,
    Ticket,
    MessageCircle,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Trophy,
    Layers,
    FlaskConical,
    Cpu,
} from "lucide-react";
import { Link } from "react-router-dom";

const WHATSAPP_INTERNS_URL = "https://chat.whatsapp.com/CmJi5pbFoVt0meDCeOlSLJ";
const MONTAGE_SRC = "/videos/montage.mp4";
const MONTAGE_POSTER = "/videos/montage-poster.jpg";

const STEPS = [
    { n: "01", t: "Create Your Project", d: "Register your project with the club, define your objectives, and outline a roadmap. This becomes the foundation for everything you'll build." },
    { n: "02", t: "Set Up Your Repository", d: "Create a GitHub repository to organize your code, designs, documentation, and progress. Keeping your work well-documented makes collaboration and development much easier." },
    { n: "03", t: "Connect with the Community", d: "Reach out to mentors and fellow members for feedback, technical guidance, and collaboration. Share updates, ask questions, and grow alongside a community of builders." },
    { n: "04", t: "Build, Iterate & Improve", d: "Develop your project through continuous experimentation and testing. Refine your ideas, overcome challenges, and turn early concepts into polished, impactful solutions." },
    { n: "05", t: "Compete & Showcase", d: "Take your project beyond the club by participating in hackathons, exhibitions, research conferences, and competitions at intercity, national, and international levels. Present your work, gain recognition, and create opportunities for future collaborations and achievements. 🚀" },
];

const WHY_JOIN = [
    { icon: Users, t: "Community & Mentorship", d: "Get real help from the community, and learn from seniors who have already walked the path you're on." },
    { icon: Cpu, t: "More Involving, Higher Value", d: "A more hands-on, engaging way to learn and build, and a cost-effective choice that delivers greater value for every student who takes part." },
    { icon: CalendarDays, t: "Weekly Sessions", d: "A steady weekly rhythm of building, learning and sharing, so your projects keep moving forward." },
    { icon: Globe, t: "International Exposure", d: "Work on international projects and get a window into what innovators around the world are building." },
    { icon: Ticket, t: "Run Yuvakarshan", d: "Get behind the scenes of Yuvakarshan, DPS Newtown's annual interschool fest, as part of the club's tech department." },
];

const FLAGSHIPS = [
    { icon: Trophy, t: "Interschool Competitions", d: "Our club has taken part in more than 30 interschool events, testing our ideas against the best from other schools.", stat: 30, suffix: "+" },
    { icon: Layers, t: "SEED Project", d: "Made in 3D – Seed the Future Entrepreneurs is an entrepreneurship programme where school students combine creativity, technology and 3D design to solve everyday community challenges with innovative solutions." },
    { icon: FlaskConical, t: "GEMA Young Scientist", d: "The GEMA International Young Scientist Award is an international platform designed to encourage scientific thinking, creativity and innovation among young students." },
    { icon: Globe, t: "InterDPS Tech Fest", d: "Schools from across the DPS Society come together to compete in one tech festival, with events spanning robotics, hackathons, cryptography, content creation and more." },
];

const WHY_LEFT = WHY_JOIN.slice(0, 4);

const ADMISSION_PATH = [
    { t: "Build & share in Classes 6–8", d: "Create your projects and send them to us through Innovation Club Interns while you're in middle school." },
    { t: "Apply in Class 9", d: "Once you reach Class 9, apply to join the club. Intake is capped at 20 new members every year." },
    { t: "Interview & test", d: "A verbal discussion of your skills and a small test. Your middle-school submissions carry the most weight." },
];
const WHY_FEATURE = WHY_JOIN[4];

function MontagePlayer() {
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);

    const start = () => {
        const v = videoRef.current;
        if (!v) return;
        v.play().catch(() => {});
    };

    return (
        <div className="group relative overflow-hidden border border-border bg-card">
            <video
                ref={videoRef}
                src={MONTAGE_SRC}
                poster={MONTAGE_POSTER}
                controls
                playsInline
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                className="aspect-video w-full bg-black"
            />
            {!playing && (
                <button
                    type="button"
                    onClick={start}
                    aria-label="Play montage"
                    className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/10"
                >
                    <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-purple text-black transition-transform duration-300 group-hover:scale-110 md:h-24 md:w-24">
                        <span className="absolute inset-0 animate-ping rounded-full bg-brand-purple/40" />
                        <Play className="relative ml-1 h-8 w-8 fill-current md:h-10 md:w-10" />
                    </span>
                </button>
            )}
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 bg-black/70 px-3 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand-pink" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-white">Montage</span>
            </div>
        </div>
    );
}

function StepExplorer() {
    const [active, setActive] = useState(0);
    const step = STEPS[active];
    const progress = ((active + 1) / STEPS.length) * 100;
    const prev = () => setActive((i) => Math.max(0, i - 1));
    const next = () => setActive((i) => Math.min(STEPS.length - 1, i + 1));

    return (
        <div>
            <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-5">
                {STEPS.map((s, i) => {
                    const on = i === active;
                    const done = i < active;
                    return (
                        <button
                            key={s.n}
                            type="button"
                            onClick={() => setActive(i)}
                            aria-pressed={on}
                            className={`group relative bg-card p-3 text-left transition-colors md:p-4 ${i === STEPS.length - 1 ? "col-span-2 md:col-span-1" : ""} ${on ? "bg-secondary" : "hover:bg-secondary/60"}`}
                        >
                            <span className={`block text-[10px] font-bold ${on || done ? "text-brand-pink" : "text-brand-purple"}`}>{s.n}</span>
                            <span className={`mt-1 block text-[11px] font-semibold uppercase leading-tight tracking-tight ${on ? "text-foreground" : "text-muted-foreground"}`}>
                                {s.t}
                            </span>
                            {on && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-brand-purple to-brand-pink" />}
                        </button>
                    );
                })}
            </div>

            <div className="h-0.5 w-full bg-border">
                <div className="h-full bg-gradient-to-r from-brand-purple to-brand-pink transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            <div key={step.n} className="relative min-h-[11rem] animate-fade-up border border-t-0 border-border bg-card p-6 md:p-10">
                <span className="text-6xl font-bold text-brand-purple/15 md:text-8xl" aria-hidden="true">{step.n}</span>
                <h3 className="mt-2 text-xl font-bold uppercase tracking-tight md:text-2xl">{step.t}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{step.d}</p>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4">
                <button
                    type="button"
                    onClick={prev}
                    disabled={active === 0}
                    className="inline-flex items-center gap-2 border border-border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors hover:border-brand-purple hover:text-brand-purple disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <span className="text-[10px] tracking-[0.25em] text-muted-foreground">
                    {String(active + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
                </span>
                <button
                    type="button"
                    onClick={next}
                    disabled={active === STEPS.length - 1}
                    className="inline-flex items-center gap-2 border border-brand-purple px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                >
                    Next <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

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

            {/* Montage */}
            <section className="mx-auto max-w-5xl px-4 pt-14 md:px-8">
                <Reveal>
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">See it in motion</span>
                            <h2 className="mt-2 text-2xl font-bold uppercase tracking-tight md:text-3xl">Our Montage</h2>
                        </div>
                    </div>
                    <MontagePlayer />
                </Reveal>
            </section>

            {/* Flagship projects */}
            <Reveal>
                <section className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-20">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">Every year</span>
                    <h2 className="mt-2 text-2xl font-bold uppercase tracking-tight md:text-3xl">Our Annual Projects</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Projects the club returns to year after year. Each one is a chance to build, compete and represent DPS Newtown.
                    </p>
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {FLAGSHIPS.map((f) => (
                            <CardFx key={f.t} className="border border-border bg-card p-6 transition-colors hover:border-brand-purple/60">
                                <div className="flex items-start justify-between gap-4">
                                    <f.icon className="h-7 w-7 text-brand-purple transition-colors group-hover:text-brand-pink" />
                                    {f.stat ? (
                                        <span className="text-3xl font-bold text-brand-pink md:text-4xl">
                                            <Counter value={f.stat} pad={0} />
                                            {f.suffix}
                                        </span>
                                    ) : (
                                        <span className="border border-brand-purple/40 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-brand-purple">Annual</span>
                                    )}
                                </div>
                                <h3 className="mt-5 text-base font-bold uppercase tracking-tight">{f.t}</h3>
                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm">{f.d}</p>
                            </CardFx>
                        ))}
                    </div>
                </section>
            </Reveal>

            {/* Why join */}
            <section className="border-y border-border bg-card/40">
                <Reveal>
                    <div className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-20">
                        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">The case for us</span>
                        <h2 className="mt-2 text-2xl font-bold uppercase tracking-tight md:text-3xl">Why Join?</h2>
                        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {WHY_LEFT.map((w, i) => (
                                <CardFx key={w.t} className="flex gap-5 border border-border bg-background p-6 transition-colors hover:border-brand-purple/60">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-brand-purple/40 text-brand-purple transition-colors group-hover:bg-brand-purple group-hover:text-black">
                                        <w.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-brand-pink">0{i + 1}</span>
                                        <h3 className="mt-1 text-sm font-bold uppercase tracking-wide">{w.t}</h3>
                                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm">{w.d}</p>
                                    </div>
                                </CardFx>
                            ))}
                        </div>
                        {/* Point 5 gets a wide feature card */}
                        <CardFx className="mt-4 flex flex-col gap-5 border border-brand-pink/40 bg-background p-6 transition-colors hover:border-brand-pink md:flex-row md:items-center md:p-8">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-brand-pink/10 text-brand-pink">
                                <WHY_FEATURE.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-brand-pink">05</span>
                                <h3 className="mt-1 text-sm font-bold uppercase tracking-wide">{WHY_FEATURE.t}</h3>
                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm">{WHY_FEATURE.d}</p>
                            </div>
                        </CardFx>
                    </div>
                </Reveal>
            </section>

            {/* Step explorer */}
            <Reveal>
                <section className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-20">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">The path</span>
                    <h2 className="mt-2 text-2xl font-bold uppercase tracking-tight md:text-3xl">How It Works</h2>
                    <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Tap through the five steps to see what each one involves.</p>
                    <div className="mt-8">
                        <StepExplorer />
                    </div>
                </section>
            </Reveal>

            {/* Classes 6–8 */}
            <Reveal>
                <section className="mx-auto max-w-5xl px-4 pb-16 md:px-8 md:pb-20">
                    <div className="relative overflow-hidden border border-brand-purple/40 bg-card p-6 md:p-12">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-purple/20 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand-pink/15 blur-3xl" />
                        <div className="relative grid gap-8 md:grid-cols-12 md:items-center">
                            <div className="md:col-span-7">
                                <span className="inline-block border border-brand-pink/50 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-brand-pink">
                                    Classes 6 – 8
                                </span>
                                <h2 className="mt-4 text-2xl font-bold uppercase leading-tight tracking-tight md:text-3xl">
                                    Start Building<span className="block text-brand-purple">Early</span>
                                </h2>
                                <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                                    Join <span className="text-foreground">Innovation Club Interns</span> and start sending us your projects. Here's how the path into the club works:
                                </p>
                                <ol className="mt-6 space-y-4">
                                    {ADMISSION_PATH.map((a, i) => (
                                        <li key={a.t} className="flex gap-4">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-brand-pink/50 text-[11px] font-bold text-brand-pink">
                                                {i + 1}
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold uppercase tracking-tight">{a.t}</p>
                                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">{a.d}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <div className="md:col-span-5">
                                <a
                                    href={WHATSAPP_INTERNS_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex w-full items-center justify-between gap-4 bg-[#25D366] px-6 py-5 text-black transition-transform hover:-translate-y-1"
                                >
                                    <span className="flex items-center gap-3">
                                        <MessageCircle className="h-6 w-6" />
                                        <span className="text-left">
                                            <span className="block text-[10px] uppercase tracking-[0.2em] opacity-70">WhatsApp group</span>
                                            <span className="block text-sm font-bold uppercase tracking-tight">Join Interns</span>
                                        </span>
                                    </span>
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </a>
                                <p className="mt-3 text-[11px] text-muted-foreground">Share your projects here to get them reviewed.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* CTA */}
            <section className="mx-auto max-w-4xl px-4 pb-20 md:px-8">
                <div className="border border-brand-purple/40 bg-card p-6 text-center md:p-10">
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
