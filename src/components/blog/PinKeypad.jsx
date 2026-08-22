import { useState } from "react";
import { Lock, Delete, X, Loader2 } from "lucide-react";
import { loginAdmin } from "@/lib/adminSession";

// Real admin auth. Entering 6 digits calls admin_login(pin) (see
// supabase/schema.sql), which checks the PIN against a bcrypt
// hash server-side and returns a session token -- nothing about the PIN or
// what counts as "correct" lives in this component.
export default function PinKeypad({ onUnlock, onClose }) {
    const [entry, setEntry] = useState("");
    const [error, setError] = useState(false);
    const [checking, setChecking] = useState(false);

    const attempt = async (pin) => {
        setChecking(true);
        try {
            await loginAdmin(pin);
            onUnlock();
        } catch {
            setError(true);
            setEntry("");
            setTimeout(() => setError(false), 650);
        } finally {
            setChecking(false);
        }
    };

    const press = (d) => {
        if (checking || entry.length >= 6 || error) return;
        const next = entry + d;
        setEntry(next);
        if (next.length === 6) {
            setTimeout(() => attempt(next), 120);
        }
    };
    const del = () => { if (!checking) setEntry((e) => e.slice(0, -1)); };

    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background/95 px-4 backdrop-blur-sm">
            <div className={`relative w-full max-w-xs border border-border bg-card p-8 ${error ? "animate-blink" : ""}`}>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                <div className="flex flex-col items-center text-center">
                    <div className="flex h-10 w-10 items-center justify-center border border-brand-purple/40 bg-brand-purple/10">
                        <Lock className="h-4 w-4 text-brand-purple" />
                    </div>
                    <span className="mt-4 text-[10px] uppercase tracking-[0.25em] text-brand-pink">// admin_access</span>
                    <h2 className="mt-1 text-lg font-bold uppercase tracking-tight">Enter Passcode</h2>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">6-digit clearance code</p>
                </div>

                <div className="mt-6 flex justify-center gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <span
                            key={i}
                            className={`h-2.5 w-2.5 rounded-full border ${
                                i < entry.length
                                    ? error
                                        ? "border-brand-pink bg-brand-pink"
                                        : "border-brand-purple bg-brand-purple"
                                    : "border-border"
                            }`}
                        />
                    ))}
                </div>

                {checking && (
                    <p className="mt-3 flex items-center justify-center gap-2 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> verifying...
                    </p>
                )}
                {error && (
                    <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-brand-pink">
                        // invalid_passcode
                    </p>
                )}

                <div className="mt-6 grid grid-cols-3 gap-px border border-border bg-border">
                    {keys.map((k) => (
                        <button
                            key={k}
                            disabled={checking}
                            onClick={() => press(k)}
                            className="bg-card py-4 text-lg font-bold text-foreground transition-colors hover:bg-secondary hover:text-brand-purple disabled:opacity-50"
                        >
                            {k}
                        </button>
                    ))}
                    <button
                        onClick={del}
                        disabled={checking}
                        className="flex items-center justify-center bg-card py-4 text-muted-foreground transition-colors hover:bg-secondary hover:text-brand-pink disabled:opacity-50"
                        aria-label="Delete"
                    >
                        <Delete className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => press("0")}
                        disabled={checking}
                        className="bg-card py-4 text-lg font-bold text-foreground transition-colors hover:bg-secondary hover:text-brand-purple disabled:opacity-50"
                    >
                        0
                    </button>
                    <span className="bg-card" />
                </div>
            </div>
        </div>
    );
}
