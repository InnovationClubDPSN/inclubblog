import { useEffect, useState } from "react";
import { db } from "@/api/dataClient";
import { getAnonId } from "@/lib/anonId";
import { useToast } from "@/components/ui/use-toast";
import { Heart, MessageCircle, Send, Loader2 } from "lucide-react";

export default function CommentsSection({ postId }) {
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [body, setBody] = useState("");
    const [posting, setPosting] = useState(false);
    const [toggling, setToggling] = useState(false);
    const { toast } = useToast();
    const anonId = getAnonId();

    const reload = () => {
        setLoading(true);
        Promise.all([
            db.entities.Comment.filter({ post_id: postId }, "-created_date", 200),
            db.entities.Like.filter({ post_id: postId }, "-created_date", 500),
        ])
            .then(([c, l]) => {
                setComments(c || []);
                setLikes(l || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => { reload();   }, [postId]);

    const liked = likes.some((l) => l.anon_id === anonId);
    const likeCount = likes.length;

    const toggleLike = async () => {
        setToggling(true);
        try {
            if (liked) {
                const mine = likes.find((l) => l.anon_id === anonId);
                if (mine) await db.entities.Like.delete(mine.id);
            } else {
                await db.entities.Like.create({ post_id: postId, anon_id: anonId });
            }
            reload();
        } catch (err) {
            toast({ title: "Failed", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setToggling(false);
        }
    };

    const submitComment = async (e) => {
        e.preventDefault();
        if (!body.trim()) return;
        setPosting(true);
        try {
            await db.entities.Comment.create({
                post_id: postId,
                author_name: name.trim() || "Anonymous",
                body: body.trim(),
            });
            setBody("");
            reload();
        } catch (err) {
            toast({ title: "Failed to post comment", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setPosting(false);
        }
    };

    const field = "w-full border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand-purple focus:outline-none";

    return (
        <section className="mt-12 border-t border-border pt-8">
            <div className="flex flex-wrap items-center gap-4">
                <button
                    onClick={toggleLike}
                    disabled={toggling}
                    className={`flex items-center gap-2 border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors disabled:opacity-50 ${liked ? "border-brand-pink bg-brand-pink/10 text-brand-pink" : "border-border text-muted-foreground hover:border-brand-pink hover:text-brand-pink"}`}
                >
                    {toggling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Heart className={`h-3.5 w-3.5 ${liked ? "fill-brand-pink" : ""}`} />}
                    {likeCount} {likeCount === 1 ? "like" : "likes"}
                </button>
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <MessageCircle className="h-3 w-3" /> {comments.length} comments
        </span>
            </div>

            <form onSubmit={submitComment} className="mt-6 border border-border bg-card p-5">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">name (optional — or stay anonymous)</label>
                <input className={`${field} mt-2`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Anonymous" />
                <label className="mt-4 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">comment</label>
                <textarea className={`${field} mt-2 min-h-[90px]`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add a comment..." />
                <button type="submit" disabled={posting} className="mt-3 flex items-center gap-2 bg-brand-purple px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50">
                    {posting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} post comment
                </button>
            </form>

            <div className="mt-6 space-y-3">
                {loading ? (
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-blink">// loading comments...</p>
                ) : comments.length === 0 ? (
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">// no comments yet — be the first.</p>
                ) : (
                    comments.map((c) => (
                        <div key={c.id} className="border border-border bg-card p-4">
                            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                                <span className="font-semibold text-brand-purple">{c.author_name || "Anonymous"}</span>
                                <span>{new Date(c.created_date).toLocaleDateString()}</span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-foreground/90">{c.body}</p>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}