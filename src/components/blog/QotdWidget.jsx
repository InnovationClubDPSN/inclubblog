import { useEffect, useState } from "react";
import { HelpCircle, Sparkles, LogIn, Github } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentOAuthUser, signInWithGithub, signInWithGoogle } from "@/lib/oauthSession";
import { getCurrentMember } from "@/lib/memberSession";
import { useToast } from "@/components/ui/use-toast";

// Today's date as seen in IST (UTC+5:30, no DST) -- matches the date the
// generate-qotd Edge Function stamps each question with.
function todayIST() {
    const now = new Date();
    const ist = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);
    return ist.toISOString().slice(0, 10);
}

export default function QotdWidget() {
    const [qotd, setQotd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [oauthUser, setOauthUser] = useState(null);
    const [member, setMember] = useState(null);
    const [myResponse, setMyResponse] = useState(null);
    const [draft, setDraft] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [responseCount, setResponseCount] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        let active = true;
        const m = getCurrentMember();
        if (active) setMember(m);

        getCurrentOAuthUser().then((u) => { if (active) setOauthUser(u); });

        supabase
            .from("qotd")
            .select("*")
            .eq("qdate", todayIST())
            .maybeSingle()
            .then(async ({ data }) => {
                if (!active) return;
                setQotd(data || null);
                setLoading(false);

                if (data) {
                    const { count } = await supabase
                        .from("qotd_responses")
                        .select("id", { count: "exact", head: true })
                        .eq("qotd_id", data.id);
                    if (active) setResponseCount(count || 0);

                    if (m?.id) {
                        const { data: mine } = await supabase
                            .from("qotd_responses")
                            .select("*")
                            .eq("qotd_id", data.id)
                            .eq("profile_id", m.id)
                            .maybeSingle();
                        if (active && mine) setMyResponse(mine);
                    }
                }
            });
        return () => { active = false; };
    }, []);

    // Fill in an already-submitted OAuth response once we know both the
    // question and the signed-in visitor.
    useEffect(() => {
        if (!qotd || !oauthUser) return;
        let active = true;
        supabase
            .from("qotd_responses")
            .select("*")
            .eq("qotd_id", qotd.id)
            .eq("user_id", oauthUser.id)
            .maybeSingle()
            .then(({ data }) => { if (active && data) setMyResponse(data); });
        return () => { active = false; };
    }, [qotd, oauthUser]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!draft.trim() || !qotd) return;
        setSubmitting(true);
        try {
            if (member?.token) {
                const { data, error } = await supabase.rpc("member_submit_qotd_response", {
                    p_token: member.token,
                    p_qotd_id: qotd.id,
                    p_response: draft.trim(),
                });
                if (error) throw error;
                setMyResponse(Array.isArray(data) ? data[0] : data);
            } else if (oauthUser) {
                const { data, error } = await supabase
                    .from("qotd_responses")
                    .insert({
                        qotd_id: qotd.id,
                        user_id: oauthUser.id,
                        display_name: oauthUser.name || oauthUser.email,
                        response: draft.trim(),
                    })
                    .select()
                    .single();
                if (error) throw error;
                setMyResponse(data);
            } else {
                return;
            }
            setResponseCount((c) => c + 1);
            toast({ title: "Response recorded" });
        } catch (err) {
            toast({ title: "Couldn't submit", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    }

    if (loading || !qotd) return null;

    const signedIn = !!member || !!oauthUser;

    return (
        <section className="border-b border-border bg-card/40">
            <div className="mx-auto max-w-4xl px-4 py-14 md:px-8">
                <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-brand-pink">
                    <Sparkles className="h-3.5 w-3.5" /> question_of_the_day
                </span>
                <div className="mt-5 flex items-start gap-4 border border-border bg-background p-6 md:p-8">
                    <HelpCircle className="mt-1 h-6 w-6 shrink-0 text-brand-purple" />
                    <div className="w-full">
                        <p className="text-lg font-bold leading-snug tracking-tight md:text-xl">{qotd.question}</p>
                        {qotd.category && (
                            <span className="mt-2 inline-block text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                                {qotd.category}
                            </span>
                        )}

                        {myResponse ? (
                            <div className="mt-6 border-t border-border pt-5">
                                <p className="text-xs uppercase tracking-[0.2em] text-brand-purple">// your answer</p>
                                <p className="mt-2 text-sm text-foreground/90">{myResponse.response}</p>
                                {qotd.fun_fact && (
                                    <p className="mt-4 text-xs italic leading-relaxed text-muted-foreground">
                                        💡 {qotd.fun_fact}
                                    </p>
                                )}
                            </div>
                        ) : signedIn ? (
                            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row">
                                <input
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    placeholder="Your answer…"
                                    className="w-full border border-border bg-card px-3 py-2 text-sm focus:border-brand-purple focus:outline-none"
                                    maxLength={500}
                                />
                                <button
                                    type="submit"
                                    disabled={submitting || !draft.trim()}
                                    className="shrink-0 border border-brand-pink/40 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-pink transition-colors hover:bg-brand-pink hover:text-black disabled:opacity-50"
                                >
                                    {submitting ? "Sending…" : "Submit"}
                                </button>
                            </form>
                        ) : (
                            <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
                                <button
                                    onClick={() => signInWithGoogle()}
                                    className="flex items-center gap-2 border border-brand-purple/40 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black"
                                >
                                    <LogIn className="h-3.5 w-3.5" /> Sign in with Google
                                </button>
                                <button
                                    onClick={() => signInWithGithub()}
                                    className="flex items-center gap-2 border border-brand-pink/40 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-pink transition-colors hover:bg-brand-pink hover:text-black"
                                >
                                    <Github className="h-3.5 w-3.5" /> Sign in with GitHub
                                </button>
                            </div>
                        )}

                        <p className="mt-4 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                            {responseCount} response{responseCount === 1 ? "" : "s"} so far
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
