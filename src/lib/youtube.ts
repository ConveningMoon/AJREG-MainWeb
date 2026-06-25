export function extractYouTubeId(url: string): string | null {
  // Handles: youtu.be/{id}, ?v={id}, /embed/{id}, /shorts/{id}
  const match = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([^&\n?#]{11})/);
  return match?.[1] ?? null;
}

export function youtubeThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

/** Full modal embed — autoplay with sound. */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}

/** Inline card embed — autoplay, muted, looped, no controls. */
export function youtubeInlineEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&modestbranding=1&playsinline=1`;
}
