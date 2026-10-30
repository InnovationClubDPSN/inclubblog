import { Code2, Cpu, Palette, Lightbulb } from "lucide-react";

const PILLARS = [
    {
        icon: Code2,
        title: "Digital Creation",
        desc: "Programming, app development, and software engineering that transform ideas into impactful digital experiences."
    },
    {
        icon: Cpu,
        title: "Engineering & Robotics",
        desc: "From embedded systems and automation to intelligent robotics—building the technology that powers innovation."
    },
    {
        icon: Palette,
        title: "Design & Visual Media",
        desc: "3D design, photography, videography, and digital storytelling where creativity meets technology."
    },
    {
        icon: Lightbulb,
        title: "Innovation & Research",
        desc: "Ideation, emerging technologies, and interdisciplinary exploration that shape the solutions of tomorrow."
    }];


export default function About() {
    return (
        <section id="about" className="border-b border-border py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
                    <div className="md:col-span-5">
            <span className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-brand-pink">
              <span className="border border-brand-pink/40 px-1.5 py-0.5">03</span> About the club
            </span>
                        <h2 className="mt-3 text-3xl font-extrabold uppercase leading-tight tracking-tight md:text-5xl">
                            Systematic
                            <span className="block text-brand-purple">Brilliance</span>
                        </h2>
                        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                            We are the Innovation Club of DPS Newtown — a collective of thinkers,
                            builders, and researchers treating every idea as a structure to be
                            engineered. Our design language celebrates the intersection of academic
                            rigor and the technological frontier.
                        </p>
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Empowering Innovators of Tomorrow — a platform for research, innovation, and technological excellence.</p>
                    </div>

                    <div className="md:col-span-7">
                        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
                            {PILLARS.map((p) =>
                                <div
                                    key={p.title}
                                    className="group relative overflow-hidden bg-card p-6 transition-colors hover:bg-secondary">
                                    <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-brand-purple to-brand-pink transition-transform duration-500 group-hover:scale-x-100" />
                                    <span className="flex h-12 w-12 items-center justify-center border border-brand-purple/30 bg-brand-purple/10 transition-colors group-hover:border-brand-pink/50 group-hover:bg-brand-pink/10"><p.icon className="h-6 w-6 text-brand-purple transition-colors group-hover:text-brand-pink" /></span>
                                    <h3 className="mt-4 text-sm font-bold uppercase tracking-wide">
                                        {p.title}
                                    </h3>
                                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                        {p.desc}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>);

}