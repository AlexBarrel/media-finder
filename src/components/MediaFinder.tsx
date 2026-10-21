import { useState, useEffect } from 'react';
import type { MediaType, Movie, Game } from '../types/media';
import { fetchMovies, fetchMovieDetails, fetchGames, fetchGameDetails } from '../services/api';

export default function MediaFinder() {
  const [activeTab, setActiveTab] = useState<MediaType>('movies');
  const [query, setQuery] = useState('');
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const handleSearch = async () => {
      if (activeTab === 'movies' && !query.trim()) {
        setMovies([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'movies') {
          const result = await fetchMovies(query);
          setMovies(result);
        } else {
          const result = await fetchGames(query);
          setGames(result);
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [activeTab, query]);

  const handleCardClick = async (id: string | number) => {
    setModalLoading(true);
    try {
      if (activeTab === 'movies') {
        const details = await fetchMovieDetails(id as string);
        setSelectedMovie(details);
      } else {
        const details = await fetchGameDetails(id as number);
        setSelectedGame(details);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const hasResults = (activeTab === 'movies' && movies.length > 0) || (activeTab === 'games' && games.length > 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-16">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-violet-600/15 via-rose-500/5 to-transparent pointer-events-none blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Шапка */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-rose-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-violet-500/20">
              M
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider uppercase text-white">
                Media<span className="text-violet-500">Finder</span>
              </h1>
              <p className="text-xs text-neutral-400 font-medium">Discover movies & video games</p>
            </div>
          </div>

          {/* Переключатель вкладок */}
          <div className="relative flex p-1.5 bg-neutral-900/90 backdrop-blur-md rounded-2xl border border-neutral-800 shadow-2xl">
            <button
              onClick={() => { setActiveTab('movies'); setQuery(''); setMovies([]); }}
              className={`relative z-10 px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'movies' ? 'text-white shadow-lg' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              🎬 Movies
              {activeTab === 'movies' && (
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl -z-10" />
              )}
            </button>

            <button
              onClick={() => { setActiveTab('games'); setQuery(''); setGames([]); }}
              className={`relative z-10 px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'games' ? 'text-white shadow-lg' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              🎮 Games
              {activeTab === 'games' && (
                <span className="absolute inset-0 bg-gradient-to-r from-rose-600 to-violet-600 rounded-xl -z-10" />
              )}
            </button>
          </div>
        </header>

        {/* Поиск */}
        <section className="py-8 text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Find your next{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-rose-400 to-amber-300">
              {activeTab === 'movies' ? 'Favorite Movie' : 'Epic Game'}
            </span>
          </h2>

          <div className="relative max-w-lg mx-auto pt-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeTab === 'movies' ? 'Search movies (e.g. Matrix, Avatar)...' : 'Search games (e.g. Cyberpunk, GTA)...'}
              className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl px-5 py-3.5 pl-12 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-all shadow-xl backdrop-blur-xl"
            />
            <span className="absolute left-4 top-1/2 -translate-y-[calc(50%-4px)] text-base text-neutral-500">🔍</span>
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-[calc(50%-4px)] text-xs font-bold text-neutral-500 hover:text-white bg-neutral-800 px-2.5 py-1 rounded-md">
                CLEAR
              </button>
            )}
          </div>
        </section>

        {error && (
          <div className="max-w-xl mx-auto bg-rose-950/40 border border-rose-800/60 text-rose-300 px-5 py-3 rounded-2xl text-xs font-semibold text-center mb-6">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Подзаголовок для игр */}
        {!loading && activeTab === 'games' && !query.trim() && hasResults && (
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 px-1 flex items-center gap-2">
            <span>🔥 Top Rated Games</span>
            <div className="h-px bg-neutral-800 flex-1" />
          </div>
        )}

        {/* Сетка результатов фильмов (с плашкой рейтинга ★ IMDb и года) */}
        {!loading && activeTab === 'movies' && hasResults && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 animate-fade-in">
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => handleCardClick(movie.id)}
                className="group relative bg-neutral-900 rounded-2xl overflow-hidden cursor-pointer border border-neutral-800/80 hover:border-violet-500/60 transition-all duration-300 hover:-translate-y-2 shadow-2xl flex flex-col justify-between"
              >
                <div className="aspect-[2/3] overflow-hidden bg-neutral-950 relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/300x450/1e293b/e2e8f0?text=No+Poster';
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                  {/* Год слева сверху */}
                  <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider text-neutral-300 border border-neutral-800">
                    {movie.year}
                  </div>
                  {/* Рейтинг справа сверху */}
                  <div className="absolute top-3 right-3 bg-neutral-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider text-amber-400 border border-amber-400/20 flex items-center gap-1">
                    ★ {movie.rating || 'N/A'}
                  </div>
                </div>

                <div className="p-3 bg-neutral-900 border-t border-neutral-800/50 flex items-center min-h-[3.25rem]">
                  <h3 className="font-bold text-white text-xs leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
                    {movie.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Сетка результатов игр (полная визуальная идентичность с фильмами) */}
        {!loading && activeTab === 'games' && hasResults && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 animate-fade-in">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => handleCardClick(game.id)}
                className="group relative bg-neutral-900 rounded-2xl overflow-hidden cursor-pointer border border-neutral-800/80 hover:border-rose-500/60 transition-all duration-300 hover:-translate-y-2 shadow-2xl flex flex-col justify-between"
              >
                <div className="aspect-square overflow-hidden bg-neutral-950 relative">
                  <img
                    src={game.poster}
                    alt={game.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/1e293b/e2e8f0?text=No+Image';
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                  {/* Год слева сверху (точно как у фильмов) */}
                  <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider text-neutral-300 border border-neutral-800">
                    {(game as any).year || 'N/A'}
                  </div>
                  {/* Рейтинг справа сверху (точно стиль фильмов, но в розовой гамме игр) */}
                  <div className="absolute top-3 right-3 bg-neutral-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider text-rose-400 border border-rose-500/20 flex items-center gap-1">
                    ★ {game.rating}
                  </div>
                </div>

                <div className="p-3 bg-neutral-900 border-t border-neutral-800/50 flex items-center min-h-[3.25rem]">
                  <h3 className="font-bold text-white text-xs leading-snug line-clamp-2 group-hover:text-rose-400 transition-colors">
                    {game.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {(selectedMovie || selectedGame || modalLoading) && (
        <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <button
              onClick={() => { setSelectedMovie(null); setSelectedGame(null); }}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-neutral-950/80 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-800"
            >
              ✕
            </button>

            {modalLoading ? (
              <div className="p-20 text-center text-xs font-bold uppercase tracking-widest text-neutral-500">Loading details...</div>
            ) : (
              <div className="overflow-y-auto">
                {/* Фильмы */}
                {selectedMovie && (
                  <div>
                    <div className="relative h-64 sm:h-80 overflow-hidden bg-neutral-950">
                      <img src={selectedMovie.poster} alt={selectedMovie.title} className="w-full h-full object-cover opacity-40 blur-sm scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 flex items-end gap-5">
                        <img src={selectedMovie.poster} alt={selectedMovie.title} className="w-28 sm:w-32 aspect-[2/3] object-cover rounded-2xl border-2 border-neutral-800 shadow-2xl shrink-0" />
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2.5 py-1 rounded-lg">
                            ★ IMDb {selectedMovie.rating || 'N/A'}
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight">{selectedMovie.title}</h2>
                          <p className="text-xs text-neutral-400 mt-1">{selectedMovie.year} • {selectedMovie.genre}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      {selectedMovie.director && (
                        <div className="text-xs text-neutral-400"><strong className="text-white">Director:</strong> {selectedMovie.director}</div>
                      )}
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Overview</h4>
                      <p className="text-sm text-neutral-300 leading-relaxed">{selectedMovie.plot || 'No overview available.'}</p>
                    </div>
                  </div>
                )}

                {/* Игры (дизайн полностью синхронизирован с фильмами) */}
                {selectedGame && (
                  <div>
                    <div className="relative h-64 sm:h-80 overflow-hidden bg-neutral-950">
                      <img src={selectedGame.poster} alt={selectedGame.title} className="w-full h-full object-cover opacity-40 blur-sm scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 flex items-end gap-5">
                        <img src={selectedGame.poster} alt={selectedGame.title} className="w-28 sm:w-32 aspect-square object-cover rounded-2xl border-2 border-neutral-800 shadow-2xl shrink-0" />
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                            ★ RAWG {selectedGame.rating} / 5
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight">{selectedGame.title}</h2>
                          <p className="text-xs text-neutral-400 mt-1">
                            Released: {selectedGame.released && selectedGame.released !== 'N/A' 
                              ? selectedGame.released.split('-').reverse().join('.') 
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedGame.genres.map((g, i) => (
                          <span key={i} className="text-xs font-semibold bg-neutral-800 text-neutral-300 px-3 py-1 rounded-xl">{g}</span>
                        ))}
                      </div>
                      {selectedGame.platforms.length > 0 && (
                        <div className="text-xs text-neutral-400"><strong className="text-white">Platforms:</strong> {selectedGame.platforms.join(', ')}</div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Overview</h4>
                        <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">{selectedGame.description || 'No detailed description available.'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}