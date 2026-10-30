import { useState } from "react";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import DecorArt from "@/components/blog/DecorArt";
import Reveal from "@/components/blog/Reveal";
import CardFx from "@/components/blog/CardFx";
import { Mail, MapPin, Github, ArrowRight, Copy, Check, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

const CHANNELS = [
    { icon: Mail, label: "Email", value: "innovationclubdpsnewtown@gmail.com", href: "mailto:innovationclubdpsnewtown@gmail.com" },
    { icon: MapPin, label: "Location", value: "DPS Newtown, Kolkata", href: null },
    { icon: Github, label: "GitHub", value: "/InnovationClubDPSN", href: "https://github.com" },
];

const TEAM = [
    { name: "Deepti", role: "Teacher in Charge", email: "p.deepti@dpsn.org.in" },
    { name: "Madhurima Acharya", role: "Teacher in Charge", email: "madhurima.acharya@dpsn.org.in" },
    { name: "Satyaki Bandopadhyay", role: "Acting President", email: "satyaki_bandopadhyay@dpsn.org.in" },
    { name: "Ujan Datta", role: "Acting President", email: "ujan_datta@dpsn.org.in" },
];

function CopyEmail({ email }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(email);
        } catch {
            const ta = document.createElement("textarea");
            ta.value = email;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    return (
        <button
            type="button"
            onClick={copy}
            aria-label={`Copy ${email}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-brand-purple hover:text-brand-purple"
        >
            {copied ? <Check className="h-4 w-4 text-brand-pink" /> : <Copy className="h-4 w-4" />}
        </button>
    );
}

export default function Contact() {
    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />
            <PageHeader
                kicker="protocol — contact"
                title="Contact"
                subtitle="Questions, collaborations, and press. We read everything — give us a cycle or two to respond." />
            <div className="mx-auto max-w-md px-4 pt-10 md:px-8">
                <DecorArt variant="orbit" className="mx-auto w-40 opacity-70" />
            </div>

            <section className="mx-auto max-w-4xl px-4 py-16 md:px-8">
                <Reveal>
                    <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                        {CHANNELS.map((c) => {
                            const Icon = c.icon;
                            const inner = (
                                <div className="group h-full bg-card p-6 transition-colors hover:bg-secondary">
                                    <Icon className="h-6 w-6 text-brand-purple transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-brand-pink" />
                                    <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{c.label}</p>
                                    <p className="mt-1 break-all text-sm font-semibold">{c.value}</p>
                                </div>
                            );
                            return c.href ? (
                                <a key={c.label} href={c.href} target="_blank" rel="noreferrer">{inner}</a>
                            ) : (
                                <div key={c.label}>{inner}</div>
                            );
                        })}
                    </div>
                </Reveal>

                {/* Team contacts */}
                <Reveal>
                    <div className="mt-16">
                        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">Reach a person</span>
                        <h2 className="mt-2 text-2xl font-bold uppercase tracking-tight md:text-3xl">Team Contacts</h2>
                        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                            Write to the team directly. Tap an address to email, or copy it with one click.
                        </p>

                        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {TEAM.map((m) => (
                                <CardFx key={m.email} className="flex items-center gap-4 border border-border bg-card p-5 transition-colors hover:border-brand-purple/60">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-brand-purple/40 bg-brand-purple/10 text-brand-purple">
                                        <UserRound className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-bold uppercase tracking-tight">{m.name}</p>
                                            <span className={`border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em] ${m.role === "Teacher in Charge" ? "border-brand-pink/50 text-brand-pink" : "border-brand-purple/50 text-brand-purple"}`}>
                                                {m.role}
                                            </span>
                                        </div>
                                        <a href={`mailto:${m.email}`} className="mt-1 block truncate text-xs text-muted-foreground transition-colors hover:text-brand-purple">
                                            {m.email}
                                        </a>
                                    </div>
                                    <CopyEmail email={m.email} />
                                </CardFx>
                            ))}
                        </div>
                    </div>
                </Reveal>

                <Reveal>
                    <div className="mt-12 border border-border bg-card p-6 md:p-10">
                        <h3 className="text-lg font-bold uppercase tracking-tight">Want to build with us?</h3>
                        <p className="mt-2 max-w-md text-sm text-muted-foreground">
                            The fastest path in is through our open sessions. See the joining process and what we expect from members.
                        </p>
                        <Link to="/join" className="mt-6 inline-flex items-center gap-2 border border-brand-purple px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black">
                            Join the Club <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </Reveal>
            </section>
            <Footer />
        </div>
    );
}
