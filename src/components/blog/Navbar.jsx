import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import UserAuthWidget from "@/components/blog/UserAuthWidget";

const NAV_LINKS = [
    { label: "Feed", href: "/#feed" },
    { label: "Archive", href: "/#archive" },
    { label: "About", to: "/about" },
    { label: "Members", to: "/members" },
    { label: "Gallery", to: "/gallery" },
    { label: "Projects", to: "/projects" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            <header
                className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
                    scrolled
                        ? "border-border/80 bg-background/80 backdrop-blur-xl"
                        : "border-transparent bg-transparent"
                }`}
            >
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
                    <Link to="/" className="flex items-center gap-3">
                        <img
                            src="/images/club-logo.png"
                            alt="Innovation Club"
                            className="mark-pulse h-11 w-11 rounded-full"
                        />
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] leading-tight">
              Innovation Club
              <span className="block text-muted-foreground text-[10px] tracking-[0.25em]">
                DPS Newtown
              </span>
            </span>
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex">
                        {NAV_LINKS.map((l) =>
                            l.to ? (
                                <Link
                                    key={l.to}
                                    to={l.to}
                                    className="group relative text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {l.label}
                                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand-pink transition-all duration-300 group-hover:w-full" />
                                </Link>
                            ) : (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    className="group relative text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {l.label}
                                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand-pink transition-all duration-300 group-hover:w-full" />
                                </a>
                            )
                        )}
                        <Link
                            to="/portal"
                            className="border border-brand-pink/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-pink transition-colors hover:bg-brand-pink hover:text-black"
                        >
                            ./ portal
                        </Link>
                    </nav>

                    <div className="hidden items-center gap-4 md:flex">
                        <UserAuthWidget variant="desktop" />
                        <a
                            href="https://dpsnewtownkolkata.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="DPS Newtown"
                        >
                            <img
                                src="/images/school-logo-nav.png"
                                alt="DPS Newtown"
                                className="h-12 w-12 rounded-full object-contain"
                            />
                        </a>
                    </div>

                    <button
                        onClick={() => setOpen(true)}
                        className="text-foreground md:hidden"
                        aria-label="Open menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </header>

            {/* Full-screen diagnostic overlay */}
            {open && (
                <div className="fixed inset-0 z-[100] bg-background blueprint-grid flex flex-col">
                    <div className="flex items-center justify-between border-b border-border px-4 py-4 md:px-8">
            <span className="text-[11px] uppercase tracking-[0.25em] text-brand-pink">
              // system_diagnostic
            </span>
                        <button onClick={() => setOpen(false)} aria-label="Close menu">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="flex flex-1 flex-col justify-center gap-2 px-4 md:px-8">
                        {NAV_LINKS.map((l, i) =>
                            l.to ? (
                                <Link
                                    key={l.to}
                                    to={l.to}
                                    onClick={() => setOpen(false)}
                                    className="group border-b border-border py-6 text-4xl font-bold uppercase tracking-tight md:text-6xl"
                                >
                                    <span className="mr-4 text-[11px] text-brand-purple">0{i + 1}</span>
                                    {l.label}
                                </Link>
                            ) : (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setOpen(false)}
                                    className="group border-b border-border py-6 text-4xl font-bold uppercase tracking-tight md:text-6xl"
                                >
                                    <span className="mr-4 text-[11px] text-brand-purple">0{i + 1}</span>
                                    {l.label}
                                </a>
                            )
                        )}
                        <Link
                            to="/portal"
                            onClick={() => setOpen(false)}
                            className="mt-6 border border-brand-pink/40 px-6 py-4 text-left text-2xl font-bold uppercase tracking-tight text-brand-pink transition-colors hover:bg-brand-pink hover:text-black md:text-4xl"
                        >
                            ./ portal
                        </Link>
                        <UserAuthWidget variant="mobile" />
                    </div>
                </div>
            )}

        </>
    );
}