import type { Movie, Game } from '../types/media';

const OMDB_API_KEY = '230bfa58';
const RAWG_API_KEY = '2c756916134f454fb013349de533417a';

// 1. Детали фильма по ID
export async function fetchMovieDetails(id: string, customApiKey?: string): Promise<Movie | null> {
  const apiKey = customApiKey || OMDB_API_KEY;
  if (!apiKey) throw new Error('OMDb API Key is missing');

  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${id}&plot=full&apikey=${apiKey}`);
    const data = await res.json();

    if (data.Response === 'False') return null;

    return {
      id: data.imdbID,
      title: data.Title,
      year: data.Year,
      poster: data.Poster && data.Poster !== 'N/A' 
        ? data.Poster 
        : 'https://placehold.co/300x450/1e293b/e2e8f0?text=No+Poster',
      type: data.Type,
      genre: data.Genre,
      rating: data.imdbRating,
      plot: data.Plot,
      director: data.Director
    };
  } catch {
    return null;
  }
}

// 2. Поиск фильмов (при пустой строке возвращает пустой массив)
export async function fetchMovies(query: string, customApiKey?: string): Promise<Movie[]> {
  const apiKey = customApiKey || OMDB_API_KEY;
  if (!apiKey) throw new Error('OMDb API Key is missing');
  if (!query.trim()) return [];

  const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${apiKey}`);
  const data = await res.json();

  if (data.Response === 'False') {
    throw new Error(data.Error || 'Movies not found');
  }

  return data.Search.map((item: any) => ({
    id: item.imdbID,
    title: item.Title,
    year: item.Year,
    poster: item.Poster && item.Poster !== 'N/A' 
      ? item.Poster 
      : 'https://placehold.co/300x450/1e293b/e2e8f0?text=No+Poster',
    type: item.Type
  }));
}

// 3. Поиск игр + ТОП игр при пустой строке
export async function fetchGames(query: string, customApiKey?: string): Promise<Game[]> {
  const apiKey = customApiKey || RAWG_API_KEY;
  if (!apiKey) throw new Error('RAWG API Key is missing');

  // Если поисковая строка пустая — запрашиваем ТОП самых популярных/высокооцениваемых игр
  const url = query.trim()
    ? `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${apiKey}`
    : `https://api.rawg.io/api/games?ordering=-rating&page_size=12&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results) throw new Error('Games not found');

  return data.results.map((item: any) => ({
    id: item.id,
    title: item.name,
    released: item.released || 'N/A',
    poster: item.background_image || 'https://placehold.co/300x450/1e293b/e2e8f0?text=No+Image',
    rating: Math.round(item.rating * 10) / 10,
    genres: item.genres?.map((g: any) => g.name) || [],
    platforms: item.platforms?.map((p: any) => p.platform.name) || []
  }));
}

// 4. Детали игры по ID
export async function fetchGameDetails(id: number, customApiKey?: string): Promise<Game> {
  const apiKey = customApiKey || RAWG_API_KEY;
  if (!apiKey) throw new Error('RAWG API Key is missing');

  const res = await fetch(`https://api.rawg.io/api/games/${id}?key=${apiKey}`);
  const data = await res.json();

  return {
    id: data.id,
    title: data.name,
    released: data.released || 'N/A',
    poster: data.background_image || 'https://placehold.co/300x450/1e293b/e2e8f0?text=No+Image',
    rating: Math.round(data.rating * 10) / 10,
    genres: data.genres?.map((g: any) => g.name) || [],
    platforms: data.platforms?.map((p: any) => p.platform.name) || [],
    description: data.description_raw || data.description || ''
  };
}