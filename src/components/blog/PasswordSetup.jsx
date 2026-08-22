import { useState } from "react";
import { setMemberPassword } from "@/lib/memberSession";
import { useToast } from "@/components/ui/use-toast";
import { Lock, Loader2 } from "lucide-react";

export default function PasswordSetup({ onSet }) {
    const [p1, setP1] = useState("");
    const [p2, setP2] = useState("");
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const submit = async (e) => {
        e.preventDefault();
        if (p1.length < 4) {
            toast({ title: "Password must be at least 4 characters", variant: "destructive" });
            return;
        }
        if (p1 !== p2) {
            toast({ title: "Passwords do not match", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const updated = await setMemberPassword(p1);
            toast({ title: "Password set — welcome to the portal" });
            onSet(updated);
        } catch (err) {
            toast({ title: "Failed to set password", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const field = "w-full border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand-purple focus:outline-none";

    return (
        <div className="border border-brand-pink/40 bg-card p-6 md:p-8">
            <div className="flex items-center gap-2 text-brand-pink">
                <Lock className="h-4 w-4" />
                <span className="text-[10px] uppercase tracking-[0.25em]">// set your password</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                First login detected. Set a password to secure your member account — you'll need it on every future login.
            </p>
            <form onSubmit={submit} className="mt-5 space-y-3">
                <input type="password" className={field} value={p1} onChange={(e) => setP1(e.target.value)} placeholder="new password" />
                <input type="password" className={field} value={p2} onChange={(e) => setP2(e.target.value)} placeholder="confirm password" />
                <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 bg-brand-purple px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50">
                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />} set password
                </button>
            </form>
        </div>
    );
}