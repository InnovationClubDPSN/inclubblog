import { useState } from "react";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import AdminPosts from "@/components/blog/AdminPosts";
import AdminDomains from "@/components/blog/AdminDomains";
import AdminMembers from "@/components/blog/AdminMembers";
import AdminGallery from "@/components/blog/AdminGallery";
import AdminAnnouncements from "@/components/blog/AdminAnnouncements";
import PinKeypad from "@/components/blog/PinKeypad";
import { LogOut } from "lucide-react";
import { isAdminLoggedIn, logoutAdmin } from "@/lib/adminSession";

const TABS = [
    { id: "posts", label: "Posts" },
    { id: "domains", label: "Domains" },
    { id: "gallery", label: "Gallery" },
    { id: "members", label: "Members" },
    { id: "announcements", label: "Announcements" },
];

export default function Admin() {
    // Real protection lives in Postgres, in the admin_write()/admin_delete_row()
    // SECURITY DEFINER functions (see supabase/schema.sql) --
    // this screen just keeps the console UI hidden and holds the PIN prompt.
    // Set the initial PIN yourself once via the Supabase SQL editor (see the
    // note at the bottom of supabase/schema.sql).
    const [unlocked, setUnlocked] = useState(() => isAdminLoggedIn());
    const [tab, setTab] = useState("posts");

    if (!unlocked) {
        return (
            <div className="min-h-screen bg-background">
                <CursorReticle />
                <Navbar />
                <PinKeypad onUnlock={() => setUnlocked(true)} />
            </div>
        );
    }

    const handleLogout = async () => {
        await logoutAdmin();
        setUnlocked(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />
            <main className="mx-auto max-w-5xl px-4 pb-24 pt-32 md:px-8">
                <div className="mb-8 flex items-center justify-between border-b border-border pb-6">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-pink">// admin_console</span>
                        <h1 className="mt-2 text-3xl font-bold uppercase tracking-tight md:text-5xl">Control Panel</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 border border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-brand-pink hover:text-brand-pink"
                    >
                        <LogOut className="h-3 w-3" /> Lock
                    </button>
                </div>

                <div className="mb-10 flex gap-px border border-border bg-border">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                                tab === t.id ? "bg-brand-purple text-black" : "bg-card text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === "posts" && <AdminPosts />}
                {tab === "domains" && <AdminDomains />}
                {tab === "gallery" && <AdminGallery />}
                {tab === "members" && <AdminMembers />}
                {tab === "announcements" && <AdminAnnouncements />}
            </main>
            <Footer />
        </div>
    );
}
