import { useEffect, useRef, useState } from "react";
import { LogIn, LogOut, User as UserIcon, Github } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
    getCurrentOAuthUser,
    onOAuthStateChange,
    signInWithGithub,
    signInWithGoogle,
    signOutOAuthUser,
    touchOAuthLogin,
} from "@/lib/oauthSession";

// Top-corner "Sign in" widget for non-member visitors, offering Google or
// GitHub. This is completely independent of the member portal (/portal,
// /member-login) and the admin PIN login -- it never reads or writes
// public.profiles, only public.users. It exists so people who are NOT club
// members can still sign in to do things like answer the Question of the Day.
export default function UserAuthWidget({ variant = "desktop" }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const { toast } = useToast();

    useEffect(() => {
        let active = true;
        getCurrentOAuthUser()
            .then((u) => { if (active) setUser(u); })
            .finally(() => { if (active) setLoading(false); });

        touchOAuthLogin();

        const unsubscribe = onOAuthStateChange(() => {
            getCurrentOAuthUser().then((u) => { if (active) setUser(u); });
        });
        return () => { active = false; unsubscribe(); };
    }, []);

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [open]);

    async function handleSignIn(provider) {
        setOpen(false);
        try {
            if (provider === "github") await signInWithGithub();
            else await signInWithGoogle();
        } catch (err) {
            toast({ title: "Sign-in failed", description: String(err?.message || err), variant: "destructive" });
        }
    }

    async function handleSignOut() {
        setOpen(false);
        await signOutOAuthUser();
        setUser(null);
        toast({ title: "Signed out" });
    }

    if (loading) return <div className="h-8 w-8" />;

    const mobileBtnClass =
        "mt-4 flex w-full items-center justify-between border border-brand-purple/40 px-6 py-4 text-left text-xl font-bold uppercase tracking-tight text-brand-purple transition-colors hover:bg-brand-purple hover:text-black md:text-2xl";
    const menuItemClass =
        "flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:bg-background hover:text-brand-pink";

    if (!user) {
        if (variant === "mobile") {
            return (
                <div className="mt-2">
                    <button onClick={() => handleSignIn("google")} className={mobileBtnClass}>
                        Sign in with Google <LogIn className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleSignIn("github")} className={mobileBtnClass}>
                        Sign in with GitHub <Github className="h-5 w-5" />
                    </button>
                </div>
            );
        }
        return (
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="flex items-center gap-1.5 border border-brand-purple/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black"
                    aria-label="Sign in"
                >
                    <LogIn className="h-3.5 w-3.5" /> sign in
                </button>
                {open && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-48 border border-border bg-card py-1 shadow-lg">
                        <button onClick={() => handleSignIn("google")} className={menuItemClass}>
                            <LogIn className="h-3.5 w-3.5" /> Continue with Google
                        </button>
                        <button onClick={() => handleSignIn("github")} className={menuItemClass}>
                            <Github className="h-3.5 w-3.5" /> Continue with GitHub
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (variant === "mobile") {
        return (
            <button onClick={handleSignOut} className={mobileBtnClass}>
                {user.name || user.email} — Sign out
            </button>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 border border-border px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-foreground transition-colors hover:border-brand-purple/60"
            >
                {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                    <UserIcon className="h-4 w-4" />
                )}
                <span className="max-w-[110px] truncate">{user.name || user.email}</span>
            </button>
            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-44 border border-border bg-card py-1 shadow-lg">
                    <button onClick={handleSignOut} className={menuItemClass}>
                        <LogOut className="h-3.5 w-3.5" /> Sign out
                    </button>
                </div>
            )}
        </div>
    );
}
