export type MediaType = 'movies' | 'games';

export interface Movie {
  id: string;
  title: string;
  year: string;
  poster: string;
  type: string;
  genre?: string;
  rating?: string;
  plot?: string;
  director?: string;
}

export interface Game {
  id: number;
  title: string;
  released: string;
  poster: string;
  rating: number;
  genres: string[];
  platforms: string[];
  description?: string;
}

export interface SearchState {
  type: MediaType;
  query: string;
}