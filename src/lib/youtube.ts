export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([^&\n?#]{11})/);
  return match?.[1] ?? null;
}

export function youtubeThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}
