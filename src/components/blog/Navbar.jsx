import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import UserAuthWidget from "@/components/blog/UserAuthWidget";

// "About" intentionally removed from the top bar (it's still reachable from
// the footer and the About section on the homepage).
const NAV_LINKS = [
    { label: "Feed", href: "/#feed" },
    { label: "Archive", href: "/#archive" },
    { label: "Members", to: "/members" },
    { label: "Gallery", to: "/gallery" },
    { label: "Projects", to: "/projects" },
    { label: "Contact", to: "/contact" },
];

const linkBase =
    "relative px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors";

function DesktopLink({ link, active }) {
    const cls = `${linkBase} ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`;
    const indicator = (
        <span
            className={`absolute inset-x-3 -bottom-px h-px origin-left bg-gradient-to-r from-brand-purple to-brand-pink transition-transform duration-300 ${
                active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
        />
    );
    return link.to ? (
        <Link to={link.to} className={`group ${cls}`}>
            {link.label}
            {indicator}
        </Link>
    ) : (
        <a href={link.href} className={`group ${cls}`}>
            {link.label}
            {indicator}
        </a>
    );
}

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Lock page scroll while the full-screen menu is open; close it on route change.
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);
    useEffect(() => { setOpen(false); }, [pathname]);

    return (
        <>
            <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6">
                <div
                    className={`pointer-events-auto relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 border px-3 transition-all duration-300 md:px-5 ${
                        scrolled
                            ? "border-border bg-background/85 shadow-[0_10px_40px_-12px_rgba(100,65,255,0.35)] backdrop-blur-xl"
                            : "border-border/60 bg-background/40 backdrop-blur-md"
                    }`}
                >
                    {/* accent hairline along the top edge */}
                    <span className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-purple to-transparent opacity-70" />

                    <Link to="/" className="group flex shrink-0 items-center gap-3" aria-label="Innovation Club home">
                        <img
                            src="/images/club-logo.png"
                            alt=""
                            className="mark-pulse h-10 w-10 rounded-full transition-transform duration-300 group-hover:rotate-12"
                        />
                        <span className="leading-none">
                            <span className="block text-[13px] font-bold uppercase tracking-[0.2em]">
                                Innovation<span className="text-brand-purple"> Club</span>
                            </span>
                            <span className="mt-1 block text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                                DPS Newtown
                            </span>
                        </span>
                    </Link>

                    <nav className="hidden items-center md:flex" aria-label="Primary">
                        {NAV_LINKS.map((l) => (
                            <DesktopLink
                                key={l.to || l.href}
                                link={l}
                                active={!!l.to && (pathname === l.to || pathname.startsWith(l.to + "/"))}
                            />
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 md:flex">
                        <Link
                            to="/portal"
                            className="group flex items-center gap-1.5 border border-brand-pink/50 bg-brand-pink/10 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-pink transition-all hover:bg-brand-pink hover:text-black hover:shadow-[0_0_24px_-4px_rgba(255,0,102,0.7)]"
                        >
                            ./ portal
                            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                        <UserAuthWidget variant="desktop" />
                        <span className="h-6 w-px bg-border" />
                        <a
                            href="https://dpsnewtownkolkata.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="DPS Newtown"
                            className="transition-opacity hover:opacity-80"
                        >
                            <img
                                src="/images/school-logo-nav.png"
                                alt="DPS Newtown"
                                className="h-10 w-10 rounded-full object-contain"
                            />
                        </a>
                    </div>

                    <button
                        onClick={() => setOpen(true)}
                        className="flex h-10 w-10 items-center justify-center border border-border text-foreground transition-colors hover:border-brand-purple md:hidden"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* Full-screen mobile menu */}
            {open && (
                <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-background blueprint-grid">
                    <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-brand-purple/20 blur-[110px]" />
                    <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-brand-pink/15 blur-[110px]" />

                    <div className="relative flex items-center justify-between border-b border-border px-4 py-4">
                        <span className="text-[11px] uppercase tracking-[0.25em] text-brand-pink">
                            // navigate<span className="ml-1 animate-blink">▋</span>
                        </span>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Close menu"
                            className="flex h-10 w-10 items-center justify-center border border-border hover:border-brand-pink"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="relative flex flex-1 flex-col justify-center px-4 py-6">
                        {NAV_LINKS.map((l, i) => {
                            const cls =
                                "group flex items-baseline gap-4 border-b border-border py-4 text-3xl font-bold uppercase tracking-tight transition-colors hover:text-brand-purple";
                            const inner = (
                                <>
                                    <span className="text-[11px] font-medium text-brand-purple">0{i + 1}</span>
                                    {l.label}
                                    <ArrowUpRight className="ml-auto h-5 w-5 self-center text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-pink" />
                                </>
                            );
                            return l.to ? (
                                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={cls}>{inner}</Link>
                            ) : (
                                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className={cls}>{inner}</a>
                            );
                        })}
                        <Link
                            to="/portal"
                            onClick={() => setOpen(false)}
                            className="mt-6 flex items-center justify-between border border-brand-pink/50 bg-brand-pink/10 px-5 py-4 text-xl font-bold uppercase tracking-tight text-brand-pink transition-colors hover:bg-brand-pink hover:text-black"
                        >
                            ./ portal
                            <ArrowUpRight className="h-5 w-5" />
                        </Link>
                        <UserAuthWidget variant="mobile" />
                    </div>
                </div>
            )}
        </>
    );
}
