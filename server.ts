import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'ddb1bdf6aa91bdf335797853884b0c1d';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.use(express.json());

// Helper function to fetch from TMDB
async function fetchTMDB(endpoint: string, queryParams: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', queryParams.language || 'pt-BR');

  for (const [key, value] of Object.entries(queryParams)) {
    if (key !== 'language' && value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB responded with status ${response.status}`);
  }
  return response.json();
}

// TMDB Proxy Routes
app.get('/api/tmdb/trending', async (req, res) => {
  try {
    const timeWindow = (req.query.timeWindow as string) || 'week';
    const data = await fetchTMDB(`/trending/all/${timeWindow}`);
    res.json(data);
  } catch (error) {
    console.error('Error fetching trending:', error);
    res.status(500).json({ error: 'Failed to fetch trending media' });
  }
});

app.get('/api/tmdb/popular', async (req, res) => {
  try {
    const page = (req.query.page as string) || '1';
    const data = await fetchTMDB('/movie/popular', { page });
    res.json(data);
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

app.get('/api/tmdb/top_rated', async (req, res) => {
  try {
    const page = (req.query.page as string) || '1';
    const data = await fetchTMDB('/movie/top_rated', { page });
    res.json(data);
  } catch (error) {
    console.error('Error fetching top rated:', error);
    res.status(500).json({ error: 'Failed to fetch top rated movies' });
  }
});

app.get('/api/tmdb/upcoming', async (req, res) => {
  try {
    const page = (req.query.page as string) || '1';
    const data = await fetchTMDB('/movie/upcoming', { page });
    res.json(data);
  } catch (error) {
    console.error('Error fetching upcoming:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming movies' });
  }
});

app.get('/api/tmdb/tv', async (req, res) => {
  try {
    const page = (req.query.page as string) || '1';
    const data = await fetchTMDB('/tv/popular', { page });
    res.json(data);
  } catch (error) {
    console.error('Error fetching tv:', error);
    res.status(500).json({ error: 'Failed to fetch tv shows' });
  }
});

app.get('/api/tmdb/genres', async (_req, res) => {
  try {
    const data = await fetchTMDB('/genre/movie/list');
    res.json(data);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

app.get('/api/tmdb/discover', async (req, res) => {
  try {
    const with_genres = req.query.with_genres as string;
    const page = (req.query.page as string) || '1';
    const data = await fetchTMDB('/discover/movie', {
      with_genres,
      sort_by: 'popularity.desc',
      page,
    });
    res.json(data);
  } catch (error) {
    console.error('Error discovering movies:', error);
    res.status(500).json({ error: 'Failed to discover movies' });
  }
});

app.get('/api/tmdb/search', async (req, res) => {
  try {
    const query = req.query.query as string;
    if (!query) {
      return res.json({ results: [] });
    }
    const data = await fetchTMDB('/search/multi', { query });
    res.json(data);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to search media' });
  }
});

app.get('/api/tmdb/details/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const [details, credits, videos] = await Promise.all([
      fetchTMDB(`/${type}/${id}`),
      fetchTMDB(`/${type}/${id}/credits`).catch(() => ({ cast: [] })),
      fetchTMDB(`/${type}/${id}/videos`).catch(() => ({ results: [] })),
    ]);

    res.json({
      ...details,
      cast: credits.cast ? credits.cast.slice(0, 10) : [],
      videos: videos.results || [],
    });
  } catch (error) {
    console.error('Error fetching details:', error);
    res.status(500).json({ error: 'Failed to fetch media details' });
  }
});

// Setup Vite middleware in dev or static server in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
