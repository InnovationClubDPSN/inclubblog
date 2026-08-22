import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "@/api/dataClient";

function FooterLink({ to, href, children }) {
    if (to) {
        return (
            <Link to={to} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                {children}
            </Link>
        );
    }
    return (
        <a href={href} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
            {children}
        </a>
    );
}

export default function Footer() {
    const [domains, setDomains] = useState([]);

    useEffect(() => {
        let active = true;
        db.entities.Domain.list("name", 100)
            .then((d) => { if (active) setDomains(d || []); })
            .catch(() => {});
        return () => { active = false; };
    }, []);

    return (
        <footer className="bg-brand-black border-t border-border">
            <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
                <div className="mb-16 overflow-hidden border-b border-border pb-16">
                    <h2 className="font-heading text-[16vw] font-extrabold uppercase leading-none tracking-tighter text-transparent md:text-[10rem]" style={{ WebkitTextStroke: "1px rgba(100,65,255,0.5)" }}>
                        INNOVATION
                    </h2>
                    <h2 className="font-heading text-[16vw] font-extrabold uppercase leading-none tracking-tighter text-transparent md:text-[10rem]" style={{ WebkitTextStroke: "1px rgba(255,0,102,0.5)" }}>
                        CLUB
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="col-span-2 md:col-span-1">
                        <img
                            src="/images/club-logo.png"
                            alt="Innovation Club"
                            className="h-12 w-12 rounded-full"
                        />
                        <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
                            Empowering Innovators of Tomorrow. DPS Newtown's frontier lab at the
                            intersection of academic rigor and technological innovation.
                        </p>
                    </div>

                    <div>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">Directory</span>
                        <ul className="mt-4 space-y-2">
                            <li><FooterLink href="/#feed">Feed</FooterLink></li>
                            <li><FooterLink href="/#archive">Archive</FooterLink></li>
                            <li><FooterLink to="/about">About</FooterLink></li>
                            <li><FooterLink to="/gallery">Gallery</FooterLink></li>
                            <li><FooterLink to="/members">Members</FooterLink></li>
                        </ul>
                    </div>

                    <div>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">Domains</span>
                        <ul className="mt-4 space-y-2">
                            {domains.length === 0 && (
                                <li className="text-[13px] text-muted-foreground/60">// loading...</li>
                            )}
                            {domains.map((d) => (
                                <li key={d.id}>
                                    <FooterLink to={`/domain/${d.slug}`}>{d.name}</FooterLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">More</span>
                        <ul className="mt-4 space-y-2">
                            <li><FooterLink to="/gallery">Gallery</FooterLink></li>
                            <li><FooterLink to="/code-of-conduct">Code of Conduct</FooterLink></li>
                            <li><FooterLink to="/join">Join</FooterLink></li>
                            <li><FooterLink to="/contact">Contact</FooterLink></li>
                            <li><FooterLink href="https://inc-thememain.vercel.app">IC Themes ↗</FooterLink></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-border pt-8 md:flex-row md:items-center">
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="heartbeat h-2 w-2 rounded-full bg-green-500" />
            © {new Date().getFullYear()} Innovation Club · DPS Newtown
          </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            built with <span className="text-brand-pink">systematic</span> brilliance
          </span>
                </div>
            </div>
        </footer>
    );
}