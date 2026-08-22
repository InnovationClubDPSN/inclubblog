import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Share2, Instagram, Code2, Link as LinkIcon, Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import InstagramStoryCard from "@/components/blog/InstagramStoryCard";

// Lets readers repost a blog post elsewhere:
//   - "Download Story Image" renders InstagramStoryCard to a 1080x1920 PNG
//     (via html2canvas) they can upload as an Instagram Story by hand --
//     Instagram doesn't offer a public API to post to a personal Story
//     directly from a website, so a ready-to-upload image is the practical
//     equivalent.
//   - "Copy Embed Code" gives an <iframe> snippet pointing at /embed/post/:slug,
//     a clean single-post card meant for embedding on another site.
//   - "Copy Link" / native share sheet for quick reposting anywhere else.
export default function RepostMenu({ post }) {
    const [open, setOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const menuRef = useRef(null);
    const storyRef = useRef(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [open]);

    const postUrl = `${window.location.origin}/article/${post.slug}`;
    const embedUrl = `${window.location.origin}/embed/post/${post.slug}`;
    const embedCode = `<iframe src="${embedUrl}" width="400" height="520" style="border:none;max-width:100%;" loading="lazy" title="${(post.title || "").replace(/"/g, "&quot;")}"></iframe>`;

    async function downloadStoryImage() {
        setGenerating(true);
        try {
            const { default: html2canvas } = await import("html2canvas");
            const canvas = await html2canvas(storyRef.current, {
                width: 1080,
                height: 1920,
                scale: 1,
                useCORS: true,
                backgroundColor: null,
            });
            const dataUrl = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `${post.slug || "post"}-story.png`;
            a.click();
            toast({ title: "Story image downloaded", description: "Upload it to your Instagram Story like any other photo." });
        } catch (err) {
            toast({ title: "Couldn't generate image", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setGenerating(false);
            setOpen(false);
        }
    }

    async function copyEmbed() {
        await navigator.clipboard.writeText(embedCode);
        toast({ title: "Embed code copied" });
        setOpen(false);
    }

    async function copyLink() {
        await navigator.clipboard.writeText(postUrl);
        toast({ title: "Link copied" });
        setOpen(false);
    }

    async function nativeShare() {
        if (navigator.share) {
            try {
                await navigator.share({ title: post.title, text: post.subtitle, url: postUrl });
            } catch {
                /* user cancelled -- ignore */
            }
        } else {
            await copyLink();
        }
        setOpen(false);
    }

    return (
        <div className="relative inline-block" ref={menuRef}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 border border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-brand-pink hover:text-brand-pink"
            >
                <Share2 className="h-3.5 w-3.5" /> Repost
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 border border-border bg-card py-1 shadow-xl">
                    <button
                        onClick={downloadStoryImage}
                        disabled={generating}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:bg-background hover:text-brand-pink disabled:opacity-50"
                    >
                        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Instagram className="h-4 w-4" />}
                        Download Story Image
                    </button>
                    <button
                        onClick={copyEmbed}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:bg-background hover:text-brand-pink"
                    >
                        <Code2 className="h-4 w-4" /> Copy Embed Code
                    </button>
                    <button
                        onClick={copyLink}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:bg-background hover:text-brand-pink"
                    >
                        <LinkIcon className="h-4 w-4" /> Copy Link
                    </button>
                    {typeof navigator !== "undefined" && navigator.share && (
                        <button
                            onClick={nativeShare}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:bg-background hover:text-brand-pink"
                        >
                            <Download className="h-4 w-4" /> Share…
                        </button>
                    )}
                </div>
            )}

            {/* Offscreen render target for html2canvas -- never visible. */}
            {createPortal(
                <div style={{ position: "fixed", top: 0, left: -99999, zIndex: -1 }}>
                    <InstagramStoryCard ref={storyRef} post={post} />
                </div>,
                document.body
            )}
        </div>
    );
}
