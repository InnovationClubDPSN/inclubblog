// Shared image-or-video renderer. Uploads may be JPEG/PNG/etc. (images) or MP4
// (video); anything whose URL ends in .mp4 renders as a <video>, everything
// else as an <img>.
//
// preview: silent looping autoplay thumbnail (for grids and tiles).
// default: a video with native controls (for lightboxes and detail views).

export const MEDIA_ACCEPT = "image/*,video/mp4,.mp4";

const VIDEO_RE = /\.mp4(\?|#|$)/i;

export function isVideoUrl(src) {
    return VIDEO_RE.test(String(src || ""));
}

export default function Media({ src, alt = "", className = "", preview = false, loading = "lazy", onError }) {
    if (isVideoUrl(src)) {
        return preview ? (
            <video
                src={src}
                className={className}
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                aria-label={alt}
                onError={onError}
            />
        ) : (
            <video
                src={src}
                className={className}
                controls
                playsInline
                preload="metadata"
                aria-label={alt}
                onError={onError}
            />
        );
    }
    return <img src={src} alt={alt} className={className} loading={loading} onError={onError} />;
}
