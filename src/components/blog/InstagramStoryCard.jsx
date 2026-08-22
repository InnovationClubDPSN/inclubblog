import { forwardRef } from "react";

// Offscreen 1080x1920 (9:16) template rendered to a PNG via html2canvas for
// the "download as Instagram Story" repost option. Kept in a plain inline-
// styled div (not Tailwind) so html2canvas -- which snapshots computed
// styles, not the Tailwind build -- renders it identically every time.
const InstagramStoryCard = forwardRef(function InstagramStoryCard({ post, siteLabel = "Innovation Club · DPS Newtown" }, ref) {
    if (!post) return null;

    return (
        <div
            ref={ref}
            style={{
                width: 1080,
                height: 1920,
                position: "relative",
                background: "linear-gradient(160deg, #0b0b12 0%, #16101f 55%, #1c0f18 100%)",
                color: "#ffffff",
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 80,
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >
            {/* faint grid backdrop */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20 }}>
                <div
                    style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: "#ff3d81",
                    }}
                />
                <span style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", opacity: 0.85 }}>
                    {siteLabel}
                </span>
            </div>

            <div style={{ position: "relative" }}>
                <span
                    style={{
                        fontSize: 26,
                        letterSpacing: 4,
                        textTransform: "uppercase",
                        color: "#ff3d81",
                        fontWeight: 700,
                    }}
                >
                    {post.category || "Dispatch"}
                </span>
                <h1
                    style={{
                        marginTop: 24,
                        fontSize: 76,
                        lineHeight: 1.05,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: -1,
                    }}
                >
                    {post.title}
                </h1>
                {post.subtitle && (
                    <p style={{ marginTop: 32, fontSize: 34, lineHeight: 1.4, opacity: 0.8, maxHeight: 260, overflow: "hidden" }}>
                        {post.subtitle}
                    </p>
                )}
            </div>

            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ height: 2, width: "100%", background: "rgba(255,255,255,0.15)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 26, opacity: 0.75 }}>{post.author || "Innovation Club"}</span>
                    <span
                        style={{
                            fontSize: 24,
                            letterSpacing: 3,
                            textTransform: "uppercase",
                            border: "2px solid #a06bff",
                            color: "#a06bff",
                            padding: "12px 20px",
                        }}
                    >
                        Read full story →
                    </span>
                </div>
            </div>
        </div>
    );
});

export default InstagramStoryCard;
