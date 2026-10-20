export interface TMDBItem {
  id: number;
  title: string;
  originalTitle: string;
  mediaType: 'movie' | 'tv';
  posterUrl: string;
  backdropUrl: string;
  overview: string;
  releaseYear: string;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  primaryGenre: string;
  accentColor: string;
  glowColor: string;
  popularity: number;
  tagline?: string;
  runtime?: number;
  cast?: Array<{ id: number; name: string; character: string; profileUrl: string | null }>;
  trailerYoutubeKey?: string | null;
}

export const GENRE_MAP: Record<number, string> = {
  28: 'Ação',
  12: 'Aventura',
  16: 'Animação',
  35: 'Comédia',
  80: 'Crime',
  99: 'Documentário',
  18: 'Drama',
  10751: 'Família',
  14: 'Fantasia',
  36: 'História',
  27: 'Terror',
  10402: 'Música',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção Científica',
  10770: 'Cinema TV',
  53: 'Suspense',
  10752: 'Guerra',
  37: 'Faroeste',
  10759: 'Ação & Aventura',
  10765: 'Sci-Fi & Fantasia',
};

const GENRE_COLOR_MAP: Record<number, { accent: string; glow: string }> = {
  28: { accent: '#f43f5e', glow: 'rgba(244, 63, 94, 0.8)' }, // Red
  878: { accent: '#06b6d4', glow: 'rgba(6, 182, 212, 0.8)' }, // Cyan
  16: { accent: '#f59e0b', glow: 'rgba(245, 158, 11, 0.8)' }, // Amber
  35: { accent: '#10b981', glow: 'rgba(16, 185, 129, 0.8)' }, // Emerald
  27: { accent: '#ef4444', glow: 'rgba(239, 68, 68, 0.85)' }, // Crimson
  14: { accent: '#a855f7', glow: 'rgba(168, 85, 247, 0.8)' }, // Violet
  18: { accent: '#38bdf8', glow: 'rgba(56, 189, 248, 0.8)' }, // Blue
  10749: { accent: '#fb7185', glow: 'rgba(251, 113, 133, 0.8)' }, // Rose
  53: { accent: '#fb923c', glow: 'rgba(251, 146, 60, 0.8)' }, // Orange
  80: { accent: '#e2e8f0', glow: 'rgba(226, 232, 240, 0.7)' },
};

const DEFAULT_THEME = { accent: '#38bdf8', glow: 'rgba(56, 189, 248, 0.75)' };

const TMDB_API_KEY = 'ddb1bdf6aa91bdf335797853884b0c1d';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function getPosterUrl(path: string | null, size: 'w500' | 'w780' | 'original' = 'w780'): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1200&q=80';
  }
  return `${TMDB_IMAGE_BASE}/w1280${path}`;
}

function normalizeTMDBItem(raw: any, explicitType?: 'movie' | 'tv'): TMDBItem {
  const mediaType: 'movie' | 'tv' = explicitType || raw.media_type || (raw.first_air_date ? 'tv' : 'movie');
  const title = raw.title || raw.name || raw.original_title || raw.original_name || 'Sem Título';
  const originalTitle = raw.original_title || raw.original_name || title;
  const releaseDate = raw.release_date || raw.first_air_date || '';
  const releaseYear = releaseDate ? releaseDate.split('-')[0] : '2024';
  const genreIds: number[] = raw.genre_ids || [];
  const primaryGenreId = genreIds[0] || 0;
  const primaryGenre = GENRE_MAP[primaryGenreId] || (mediaType === 'tv' ? 'Série' : 'Filme');

  const colorTheme = GENRE_COLOR_MAP[primaryGenreId] || DEFAULT_THEME;

  return {
    id: raw.id,
    title,
    originalTitle,
    mediaType,
    posterUrl: getPosterUrl(raw.poster_path),
    backdropUrl: getBackdropUrl(raw.backdrop_path),
    overview: raw.overview || 'Sinopse não disponível em português para este título.',
    releaseYear,
    releaseDate,
    voteAverage: typeof raw.vote_average === 'number' ? Math.round(raw.vote_average * 10) / 10 : 7.5,
    voteCount: raw.vote_count || 0,
    genreIds,
    primaryGenre,
    accentColor: colorTheme.accent,
    glowColor: colorTheme.glow,
    popularity: raw.popularity || 0,
  };
}

/**
 * Fetch from proxy or fallback to direct TMDB endpoint
 */
async function fetchEndpoint(apiRoute: string, directUrl: string): Promise<any> {
  try {
    const res = await fetch(apiRoute);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend route unreachable, use direct TMDB URL
  }

  const directRes = await fetch(directUrl);
  if (!directRes.ok) {
    throw new Error(`Direct TMDB fetch failed: ${directRes.status}`);
  }
  return await directRes.json();
}

export async function fetchTrending(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBItem[]> {
  const apiRoute = `/api/tmdb/trending?timeWindow=${timeWindow}`;
  const directUrl = `https://api.themoviedb.org/3/trending/all/${timeWindow}?api_key=${TMDB_API_KEY}&language=pt-BR`;
  const data = await fetchEndpoint(apiRoute, directUrl);
  return (data.results || [])
    .filter((item: any) => item.poster_path)
    .slice(0, 10)
    .map((item: any) => normalizeTMDBItem(item));
}

export async function fetchPopularMovies(page: number = 1): Promise<TMDBItem[]> {
  const apiRoute = `/api/tmdb/popular?page=${page}`;
  const directUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`;
  const data = await fetchEndpoint(apiRoute, directUrl);
  return (data.results || [])
    .filter((item: any) => item.poster_path)
    .slice(0, 10)
    .map((item: any) => normalizeTMDBItem(item, 'movie'));
}

export async function fetchTopRatedMovies(page: number = 1): Promise<TMDBItem[]> {
  const apiRoute = `/api/tmdb/top_rated?page=${page}`;
  const directUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`;
  const data = await fetchEndpoint(apiRoute, directUrl);
  return (data.results || [])
    .filter((item: any) => item.poster_path)
    .slice(0, 10)
    .map((item: any) => normalizeTMDBItem(item, 'movie'));
}

export async function fetchUpcomingMovies(page: number = 1): Promise<TMDBItem[]> {
  const apiRoute = `/api/tmdb/upcoming?page=${page}`;
  const directUrl = `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`;
  const data = await fetchEndpoint(apiRoute, directUrl);
  return (data.results || [])
    .filter((item: any) => item.poster_path)
    .slice(0, 10)
    .map((item: any) => normalizeTMDBItem(item, 'movie'));
}

export async function fetchPopularTVShows(page: number = 1): Promise<TMDBItem[]> {
  const apiRoute = `/api/tmdb/tv?page=${page}`;
  const directUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`;
  const data = await fetchEndpoint(apiRoute, directUrl);
  return (data.results || [])
    .filter((item: any) => item.poster_path)
    .slice(0, 10)
    .map((item: any) => normalizeTMDBItem(item, 'tv'));
}

export async function fetchByGenre(genreId: number): Promise<TMDBItem[]> {
  const apiRoute = `/api/tmdb/discover?with_genres=${genreId}`;
  const directUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&with_genres=${genreId}&sort_by=popularity.desc`;
  const data = await fetchEndpoint(apiRoute, directUrl);
  return (data.results || [])
    .filter((item: any) => item.poster_path)
    .slice(0, 10)
    .map((item: any) => normalizeTMDBItem(item, 'movie'));
}

export async function searchTMDB(query: string): Promise<TMDBItem[]> {
  if (!query.trim()) return [];
  const apiRoute = `/api/tmdb/search?query=${encodeURIComponent(query)}`;
  const directUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`;
  const data = await fetchEndpoint(apiRoute, directUrl);
  return (data.results || [])
    .filter((item: any) => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv' || !item.media_type))
    .slice(0, 10)
    .map((item: any) => normalizeTMDBItem(item));
}

export async function fetchItemDetails(id: number, mediaType: 'movie' | 'tv'): Promise<TMDBItem> {
  const apiRoute = `/api/tmdb/details/${mediaType}/${id}`;
  const directDetailsUrl = `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${TMDB_API_KEY}&language=pt-BR`;
  const directCreditsUrl = `https://api.themoviedb.org/3/${mediaType}/${id}/credits?api_key=${TMDB_API_KEY}&language=pt-BR`;
  const directVideosUrl = `https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`;

  try {
    const res = await fetch(apiRoute);
    if (res.ok) {
      const data = await res.json();
      const item = normalizeTMDBItem(data, mediaType);
      item.tagline = data.tagline;
      item.runtime = data.runtime || (data.episode_run_time ? data.episode_run_time[0] : undefined);
      item.cast = (data.cast || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profileUrl: c.profile_path ? `${TMDB_IMAGE_BASE}/w185${c.profile_path}` : null,
      }));
      const trailer = (data.videos || []).find(
        (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
      );
      item.trailerYoutubeKey = trailer ? trailer.key : null;
      return item;
    }
  } catch {
    // fallback to direct
  }

  const [details, credits, videos] = await Promise.all([
    fetch(directDetailsUrl).then((r) => r.json()),
    fetch(directCreditsUrl).then((r) => r.json()).catch(() => ({ cast: [] })),
    fetch(directVideosUrl).then((r) => r.json()).catch(() => ({ results: [] })),
  ]);

  const item = normalizeTMDBItem(details, mediaType);
  item.tagline = details.tagline;
  item.runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : undefined);
  item.cast = (credits.cast || []).slice(0, 10).map((c: any) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profileUrl: c.profile_path ? `${TMDB_IMAGE_BASE}/w185${c.profile_path}` : null,
  }));
  const trailer = (videos.results || []).find(
    (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  item.trailerYoutubeKey = trailer ? trailer.key : null;

  return item;
}
