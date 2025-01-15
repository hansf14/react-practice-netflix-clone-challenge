export const BASE_PATH = "/react-practice-netflix-clone-challenge";

export const API_BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// https://developer.themoviedb.org/reference/configuration-details
// https://www.themoviedb.org/talk/53c11d4ec3a3684cf4006400
// {
//   "change_keys": [
//     "adult",
//     "air_date",
//     "also_known_as",
//     "alternative_titles",
//     "biography",
//     "birthday",
//     "budget",
//     "cast",
//     "certifications",
//     "character_names",
//     "created_by",
//     "crew",
//     "deathday",
//     "episode",
//     "episode_number",
//     "episode_run_time",
//     "freebase_id",
//     "freebase_mid",
//     "general",
//     "genres",
//     "guest_stars",
//     "homepage",
//     "images",
//     "imdb_id",
//     "languages",
//     "name",
//     "network",
//     "origin_country",
//     "original_name",
//     "original_title",
//     "overview",
//     "parts",
//     "place_of_birth",
//     "plot_keywords",
//     "production_code",
//     "production_companies",
//     "production_countries",
//     "releases",
//     "revenue",
//     "runtime",
//     "season",
//     "season_number",
//     "season_regular",
//     "spoken_languages",
//     "status",
//     "tagline",
//     "title",
//     "translations",
//     "tvdb_id",
//     "tvrage_id",
//     "type",
//     "video",
//     "videos"
//   ],
//   "images": {
//     "base_url": "http://image.tmdb.org/t/p/",
//     "secure_base_url": "https://image.tmdb.org/t/p/",
//     "backdrop_sizes": [
//       "w300",
//       "w780",
//       "w1280",
//       "original"
//     ],
//     "logo_sizes": [
//       "w45",
//       "w92",
//       "w154",
//       "w185",
//       "w300",
//       "w500",
//       "original"
//     ],
//     "poster_sizes": [
//       "w92",
//       "w154",
//       "w185",
//       "w342",
//       "w500",
//       "w780",
//       "original"
//     ],
//     "profile_sizes": [
//       "w45",
//       "w185",
//       "h632",
//       "original"
//     ],
//     "still_sizes": [
//       "w92",
//       "w185",
//       "w300",
//       "original"
//     ]
//   }
// }

export function getImageUrl({
  pathSegment,
  format = "w500", // "original",
}: {
  pathSegment: string;
  format?: string;
}) {
  return `${IMAGE_BASE_URL}/${format}${pathSegment}`;
}

const fetchOptions = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNzk3NjkzZjIzNDEwN2U5ZGUzZWMyMmQ2NzkxMDQ4YSIsIm5iZiI6MTczNTk5MzYwMi4yMDgsInN1YiI6IjY3NzkyOTAyMWEyZGY1OWFkMzc0Y2I5NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Hmt-Ouwf9mPM3namZuylRL6eJLgBZGYIno5XBrRZPLo",
  },
};

export interface Movie {
  adult: boolean;
  backdrop_path: string | null;
  poster_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

// {
//   id: 558449;
//   backdrop_path: "/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg";
//   poster_path: "/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg";
//   genre_ids: [28, 12, 18];
//   original_language: "en";
//   original_title: "Gladiator II";
//   overview: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius is forced to enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist. With rage in his heart and the future of the Empire at stake, Lucius must look to his past to find strength and honor to return the glory of Rome to its people.";
//   release_date: "2024-11-05";
//   title: "Gladiator II";
//   vote_average: 6.763;
//   vote_count: 1928;
//   popularity: 4873.155;
//   adult: false;
//   video: false;
// };

export interface GetMoviesNowPlayingResult {
  dates: {
    maximum: string;
    minimum: string;
  };
  page: number;
  total_pages: number;
  results: Movie[];
  total_results: number;
}

// https://developer.themoviedb.org/reference/movie-now-playing-list
export async function getMoviesNowPlaying() {
  const response = await fetch(
    `${API_BASE_URL}/movie/now_playing?language=en-US&page=1`,
    fetchOptions,
  );
  return response.json() as unknown as GetMoviesNowPlayingResult;
}

export interface GetMoviesPopularResult {
  page: number;
  total_pages: number;
  results: Movie[];
  total_results: number;
}

// https://developer.themoviedb.org/reference/movie-popular-list
export async function getMoviesPopular() {
  const response = await fetch(
    `${API_BASE_URL}/movie/popular?language=en-US&page=1`,
    fetchOptions,
  );
  return response.json() as unknown as GetMoviesPopularResult;
}

export interface GetMoviesTopRatedResult {
  page: number;
  total_pages: number;
  results: Movie[];
  total_results: number;
}

// https://developer.themoviedb.org/reference/movie-top-rated-list
export async function getMoviesTopRated() {
  const response = await fetch(
    `${API_BASE_URL}/movie/top_rated?language=en-US&page=1`,
    fetchOptions,
  );
  return response.json() as unknown as GetMoviesTopRatedResult;
}

export interface GetMoviesUpcomingResult {
  dates: {
    maximum: string;
    minimum: string;
  };
  page: number;
  total_pages: number;
  results: Movie[];
  total_results: number;
}

// https://developer.themoviedb.org/reference/movie-upcoming-list
export async function getMoviesUpcoming() {
  const response = await fetch(
    `${API_BASE_URL}/movie/upcoming?language=en-US&page=1`,
    fetchOptions,
  );
  return response.json() as unknown as GetMoviesUpcomingResult;
}

export interface MovieDetails {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: Collection | null;
  budget: number;
  genres: Genre[];
  homepage: string | null;
  id: number;
  imdb_id: string;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: Language[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface Collection {
  backdrop_path: string | null;
  id: string;
  name: string;
  poster_path: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string | null;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface Language {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export type GetMovieDetailsParams = { movieId: string };

// https://developer.themoviedb.org/reference/movie-details
export async function getMovieDetails({ movieId }: GetMovieDetailsParams) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/movie/${movieId}?language=en-US`,
      fetchOptions,
    );
    if (!response.ok) {
      throw new Error(
        `Error: ${response.status} ${response.statusText} (movieId: ${movieId})`,
      );
    }
    return response.json() as unknown as MovieDetails;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export interface GetMoviesSimilarResult {
  page: number;
  total_pages: number;
  results: Movie[];
  total_results: number;
}

export interface GetMoviesSimilarParams extends GetMovieDetailsParams {}

// https://developer.themoviedb.org/reference/movie-similar
export async function getMoviesSimilar({ movieId }: GetMoviesSimilarParams) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/movie/${movieId}/similar?language=en-US&page=1`,
      fetchOptions,
    );
    if (!response.ok) {
      throw new Error(
        `Error: ${response.status} ${response.statusText} (movieId: ${movieId})`,
      );
    }
    return response.json() as unknown as GetMoviesSimilarResult;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export interface GetMoviesRecommendedResult {
  page: number;
  total_pages: number;
  results: Movie[];
  total_results: number;
}

export interface GetMoviesRecommendedParams extends GetMovieDetailsParams {}

// https://developer.themoviedb.org/reference/movie-recommendations
export async function getMoviesRecommended({
  movieId,
}: GetMoviesRecommendedParams) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/movie/${movieId}/recommendations?language=en-US&page=1`,
      fetchOptions,
    );
    if (!response.ok) {
      throw new Error(
        `Error: ${response.status} ${response.statusText} (movieId: ${movieId})`,
      );
    }
    return response.json() as unknown as GetMoviesRecommendedResult;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

//////////////////////////////////////////

export interface TvShow {
  adult: boolean;
  backdrop_path?: string;
  poster_path?: string;
  genre_ids: number[];
  id: number;
  name: string;
  original_language: string;
  original_name: string;
  origin_country: string[];
  overview: string;
  popularity: number;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
}

// {
//   "adult": false,
//   "backdrop_path": "/hmNgVtGWKYWQg6C6dAdRaASgt1M.jpg",
//   "genre_ids": [
//     10765,
//     18
//   ],
//   "id": 243512,
//   "origin_country": [
//     "CN"
//   ],
//   "original_language": "zh",
//   "original_name": "千朵桃花一世开",
//   "overview": "In ancient times, the Human Emperor, Zhao Ming, petitioned on behalf of the people and sacrificed himself to resist the divine realm. After Zhao Ming's fall, his beloved, Hun Dunzhu, risked her life to save a wisp of his soul, setting up the cycle of reincarnation for eternity. In the distant future, Zhao Ming reincarnated as Xie Xuechen, the leader of the Immortal Alliance, while Hun Dunzhu became the Holy Maiden Mu Xuanling in the Dark Domain. The two finally reunited in the mortal realm but had forgotten their past, becoming adversaries in a \"righteous versus evil\" struggle. Mu Xuanling saved the heavily injured Xie Xuechen in the Dark Domain and coerced him to travel together in gratitude for saving his life.",
//   "popularity": 1753.564,
//   "poster_path": "/lAFxsacfM8r4XMh6ZeP48l1gCRS.jpg",
//   "first_air_date": "2025-01-02",
//   "name": "The Blossoming Love",
//   "vote_average": 8.3,
//   "vote_count": 3
// },

export interface GetTvShowsAiringTodayResult {
  page: number;
  total_pages: number;
  results: TvShow[];
  total_results: number;
}

// https://developer.themoviedb.org/reference/tv-series-airing-today-list
export async function getTvShowsAiringToday() {
  const response = await fetch(
    `${API_BASE_URL}/tv/airing_today?language=en-US&page=1`,
    fetchOptions,
  );
  return response.json() as unknown as GetTvShowsAiringTodayResult;
}

export interface GetTvShowsOnTheAirResult {
  page: number;
  total_pages: number;
  results: TvShow[];
  total_results: number;
}

// https://developer.themoviedb.org/reference/tv-series-on-the-air-list
export async function getTvShowsOnTheAir() {
  const response = await fetch(
    `${API_BASE_URL}/tv/on_the_air?language=en-US&page=1`,
    fetchOptions,
  );
  return response.json() as unknown as GetTvShowsOnTheAirResult;
}

export interface GetTvShowsPopularResult {
  page: number;
  total_pages: number;
  results: TvShow[];
  total_results: number;
}

// https://developer.themoviedb.org/reference/tv-series-popular-list
export async function getTvShowsPopular() {
  const response = await fetch(
    `${API_BASE_URL}/tv/popular?language=en-US&page=1`,
    fetchOptions,
  );
  return response.json() as unknown as GetTvShowsPopularResult;
}

export interface GetTvShowsTopRatedResult {
  page: number;
  total_pages: number;
  results: TvShow[];
  total_results: number;
}

// https://developer.themoviedb.org/reference/tv-series-top-rated-list
export async function getTvShowsTopRated() {
  const response = await fetch(
    `${API_BASE_URL}/tv/top_rated?language=en-US&page=1`,
    fetchOptions,
  );
  return response.json() as unknown as GetTvShowsTopRatedResult;
}

export interface TvShowDetails {
  adult: boolean;
  backdrop_path: string | null;
  created_by: CreatedBy[];
  episode_run_time: number[];
  first_air_date: string;
  genres: Genre[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: Language[];
  last_air_date: string;
  last_episode_to_air: EpisodeToAir | null;
  name: string;
  next_episode_to_air: EpisodeToAir | null;
  networks: Network[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: Season[];
  spoken_languages: Language[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
}

export interface CreatedBy {
  id: number;
  credit_id: string;
  name: string;
  original_name: string;
  gender: number;
  profile_path: string | null;
}

export interface EpisodeToAir {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  episode_type: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string | null;
}

export interface Network {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
}

export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export type GetTvShowDetailsParams = { tvShowId: string };

// https://developer.themoviedb.org/reference/tv-series-details
export async function getTvShowDetails({ tvShowId }: GetTvShowDetailsParams) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tv/${tvShowId}?language=en-US`,
      fetchOptions,
    );
    if (!response.ok) {
      throw new Error(
        `Error: ${response.status} ${response.statusText} (tvShowId: ${tvShowId})`,
      );
    }
    return response.json() as unknown as TvShowDetails;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export interface GetTvShowsSimilarResult {
  page: number;
  total_pages: number;
  results: Movie[];
  total_results: number;
}

export interface GetTvShowsSimilarParams extends GetTvShowDetailsParams {}

// https://developer.themoviedb.org/reference/tv-series-similar
export async function getTvShowsSimilar({ tvShowId }: GetTvShowsSimilarParams) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tv/${tvShowId}/similar?language=en-US&page=1`,
      fetchOptions,
    );
    if (!response.ok) {
      throw new Error(
        `Error: ${response.status} ${response.statusText} (tvShowId: ${tvShowId})`,
      );
    }
    return response.json() as unknown as GetTvShowsSimilarResult;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export interface GetTvShowsRecommendedResult {
  page: number;
  total_pages: number;
  results: Movie[];
  total_results: number;
}

export interface GetTvShowsRecommendedParams extends GetTvShowDetailsParams {}

// https://developer.themoviedb.org/reference/tv-series-recommendations
export async function getTvShowsRecommended({
  tvShowId,
}: GetTvShowsRecommendedParams) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tv/${tvShowId}/recommendations?language=en-US&page=1`,
      fetchOptions,
    );
    if (!response.ok) {
      throw new Error(
        `Error: ${response.status} ${response.statusText} (tvShowId: ${tvShowId})`,
      );
    }
    return response.json() as unknown as GetTvShowsRecommendedResult;
  } catch (error) {
    console.warn(error);
    return null;
  }
}
