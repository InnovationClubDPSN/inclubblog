import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import DecorArt from "@/components/blog/DecorArt";
import { Mail, MapPin, Github, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CHANNELS = [
    { icon: Mail, label: "Email", value: "innovationclubdpsnewtown@gmail.com", href: "mailto:innovation@dpsnewtown.edu" },
    { icon: MapPin, label: "Location", value: "DPS Newtown, Kolkata", href: null },
    { icon: Github, label: "GitHub", value: "/InnovationClubDPSN", href: "https://github.com" }];


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
                <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
                    {CHANNELS.map((c) => {
                        const Icon = c.icon;
                        const inner =
                            <div className="bg-card p-6 transition-colors hover:bg-secondary">
                                <Icon className="h-6 w-6 text-brand-purple" />
                                <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{c.label}</p>
                                <p className="mt-1 text-sm font-semibold">{c.value}</p>
                            </div>;

                        return c.href ?
                            <a key={c.label} href={c.href} target="_blank" rel="noreferrer">{inner}</a> :

                            <div key={c.label}>{inner}</div>;

                    })}
                </div>

                <div className="mt-12 border border-border bg-card p-6 md:p-10">
                    <h3 className="text-lg font-bold uppercase tracking-tight">Want to build with us?</h3>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                        The fastest path in is through our open sessions. See the joining process and what we expect from members.
                    </p>
                    <Link to="/join" className="mt-6 inline-flex items-center gap-2 border border-brand-purple px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black">
                        Join the Club <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </section>
            <Footer />
        </div>);

}