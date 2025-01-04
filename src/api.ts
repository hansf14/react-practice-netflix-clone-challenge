export const API_BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// NEXFLIX_LOGO_URL
export const IMAGE_FALLBACK_URL =
  "https://assets.brand.microsites.netflix.io/assets/2800a67c-4252-11ec-a9ce-066b49664af6_cm_800w.jpg?v=4";

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

export interface GetMoviesNowPlayingResultMovie {
  adult: boolean;
  backdrop_path: string | undefined;
  poster_path: string | undefined;
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
  results: GetMoviesNowPlayingResultMovie[];
  total_results: number;
}

export async function getMoviesNowPlaying() {
  const response = await fetch(
    `${API_BASE_URL}/movie/now_playing?language=en-US&page=1`,
    fetchOptions,
  );
  return response.json() as unknown as GetMoviesNowPlayingResult;
}
