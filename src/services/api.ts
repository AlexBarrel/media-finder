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
      rating: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : 'N/A',
      plot: data.Plot,
      director: data.Director
    };
  } catch {
    return null;
  }
}

// 2. Поиск фильмов с параллельным подтягиванием рейтинга IMDb
export async function fetchMovies(query: string, customApiKey?: string): Promise<Movie[]> {
  const apiKey = customApiKey || OMDB_API_KEY;
  if (!apiKey) throw new Error('OMDb API Key is missing');
  if (!query.trim()) return [];

  const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${apiKey}`);
  const data = await res.json();

  if (data.Response === 'False') {
    throw new Error(data.Error || 'Movies not found');
  }

  // Берём первенцев поиска (до 10 элементов) и запрашиваем детали для рейтинга
  const items = data.Search.slice(0, 10);
  const detailedMovies = await Promise.all(
    items.map(async (item: any) => {
      try {
        const detailRes = await fetch(`https://www.omdbapi.com/?i=${item.imdbID}&apikey=${apiKey}`);
        const detailData = await detailRes.json();
        return {
          id: item.imdbID,
          title: item.Title,
          year: item.Year,
          poster: item.Poster && item.Poster !== 'N/A' 
            ? item.Poster 
            : 'https://placehold.co/300x450/1e293b/e2e8f0?text=No+Poster',
          type: item.Type,
          rating: detailData.imdbRating && detailData.imdbRating !== 'N/A' ? detailData.imdbRating : 'N/A'
        };
      } catch {
        return {
          id: item.imdbID,
          title: item.Title,
          year: item.Year,
          poster: item.Poster && item.Poster !== 'N/A' 
            ? item.Poster 
            : 'https://placehold.co/300x450/1e293b/e2e8f0?text=No+Poster',
          type: item.Type,
          rating: 'N/A'
        };
      }
    })
  );

  return detailedMovies;
}

// 3. Поиск игр + ТОП игр при пустой строке
export async function fetchGames(query: string, customApiKey?: string): Promise<Game[]> {
  const apiKey = customApiKey || RAWG_API_KEY;
  if (!apiKey) throw new Error('RAWG API Key is missing');

  const url = query.trim()
    ? `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${apiKey}`
    : `https://api.rawg.io/api/games?ordering=-rating&page_size=12&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results) throw new Error('Games not found');

  return data.results.map((item: any) => {
    // Извлекаем год из даты релиза YYYY-MM-DD
    const releaseYear = item.released ? item.released.split('-')[0] : 'N/A';

    return {
      id: item.id,
      title: item.name,
      released: item.released || 'N/A',
      year: releaseYear,
      poster: item.background_image || 'https://placehold.co/300x300/1e293b/e2e8f0?text=No+Image',
      rating: item.rating ? Math.round(item.rating * 10) / 10 : 'N/A',
      genres: item.genres?.map((g: any) => g.name) || [],
      platforms: item.platforms?.map((p: any) => p.platform.name) || []
    };
  });
}

// 4. Детали игры по ID
export async function fetchGameDetails(id: number, customApiKey?: string): Promise<Game> {
  const apiKey = customApiKey || RAWG_API_KEY;
  if (!apiKey) throw new Error('RAWG API Key is missing');

  const res = await fetch(`https://api.rawg.io/api/games/${id}?key=${apiKey}`);
  const data = await res.json();
  const releaseYear = data.released ? data.released.split('-')[0] : 'N/A';

  return {
    id: data.id,
    title: data.name,
    released: data.released || 'N/A',
    year: releaseYear,
    poster: data.background_image || 'https://placehold.co/300x300/1e293b/e2e8f0?text=No+Image',
    rating: data.rating ? Math.round(data.rating * 10) / 10 : 'N/A',
    genres: data.genres?.map((g: any) => g.name) || [],
    platforms: data.platforms?.map((p: any) => p.platform.name) || [],
    description: data.description_raw || data.description || ''
  };
}