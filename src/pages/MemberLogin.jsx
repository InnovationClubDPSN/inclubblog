import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginMember } from "@/lib/memberSession";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/blog/Navbar";
import CursorReticle from "@/components/blog/CursorReticle";
import Footer from "@/components/blog/Footer";
import PageHeader from "@/components/blog/PageHeader";
import DecorArt from "@/components/blog/DecorArt";
import { ArrowLeft, LogIn } from "lucide-react";

export default function MemberLogin() {
    const [admission, setAdmission] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { toast } = useToast();

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const m = await loginMember(admission, password);
            toast({ title: `Welcome, ${m.name}` });
            navigate("/portal");
        } catch (err) {
            setError(String(err?.message || err));
        } finally {
            setLoading(false);
        }
    };

    const field = "w-full border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand-purple focus:outline-none";

    return (
        <div className="min-h-screen bg-background">
            <CursorReticle />
            <Navbar />
            <PageHeader
                kicker="members — login"
                title="Member Login"
                subtitle="Enter your admission number to access the member portal, edit posts you contribute to, and manage your projects."
            />
            <div className="mx-auto max-w-md px-4 pt-10 md:px-8">
                <DecorArt variant="circuit" className="mx-auto w-40 opacity-70" />
            </div>
            <section className="mx-auto max-w-md px-4 py-12 md:px-8">
                <p className="mb-4 animate-fade-up text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    // leave password blank for new users
                </p>
                <form onSubmit={submit} className="border border-border bg-card p-6">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">admission number</label>
                    <input
                        className={`${field} mt-2`}
                        value={admission}
                        onChange={(e) => setAdmission(e.target.value)}
                        placeholder="e.g. 24A11001"
                    />
                    <label className="mt-4 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        password <span className="text-muted-foreground/60">(leave blank on first login)</span>
                    </label>
                    <input
                        type="password"
                        className={`${field} mt-2`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                    />
                    {error && (
                        <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-brand-pink">// {error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-5 flex w-full items-center justify-center gap-2 bg-brand-purple px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50"
                    >
                        <LogIn className="h-3 w-3" /> {loading ? "Authenticating…" : "Enter Portal"}
                    </button>
                </form>
                <Link to="/" className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-3 w-3" /> back to feed
                </Link>
            </section>
            <Footer />
        </div>
    );
}