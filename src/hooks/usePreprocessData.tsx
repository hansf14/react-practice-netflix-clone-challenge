import { useMemo } from "react";
import {
  getImageUrl,
  GetMoviesNowPlayingResult,
  GetMoviesPopularResult,
  GetMoviesRecommendedResult,
  GetMoviesSimilarResult,
  GetMoviesTopRatedResult,
  GetMoviesUpcomingResult,
  GetTvShowsOnTheAirResult,
  Movie,
  TvShow,
} from "@/api";
import { createKeyValueMapping, SmartMerge, SmartOmit } from "@/utils";
import netflixInitialLogo from "@/assets/netflix-initial-logo.png";

export type ItemMovie = SmartMerge<SmartOmit<Movie, "id"> & { id: string }>;

export type ItemTvShow = SmartMerge<
  SmartOmit<TvShow, "id"> & { id: string; title: string }
>;

export const DataTypes = ["movie", "tv-show"] as const;
export type DataType = (typeof DataTypes)[number];
export const DataTypeKvMappingObj = createKeyValueMapping({ arr: DataTypes });
export type DataTypeKvMapping = typeof DataTypeKvMappingObj;

export const usePreprocessData = <
  T extends DataType,
  Item = T extends DataTypeKvMapping["movie"]
    ? ItemMovie
    : T extends DataTypeKvMapping["tv-show"]
      ? ItemTvShow
      : never,
>({
  data,
  dataType,
}: {
  data:
    | GetMoviesNowPlayingResult
    | GetMoviesPopularResult
    | GetMoviesTopRatedResult
    | GetMoviesUpcomingResult
    | GetMoviesSimilarResult
    | GetMoviesRecommendedResult
    | GetTvShowsOnTheAirResult
    | null
    | undefined;
  dataType: T;
}) => {
  const bannerMovieImageSrcPathSegment =
    data && data.results.length
      ? (data.results[0].backdrop_path ?? data.results[0].poster_path ?? null)
      : null;

  const bannerMovieImageSrc = !!bannerMovieImageSrcPathSegment
    ? getImageUrl({
        pathSegment: bannerMovieImageSrcPathSegment,
        format: "w1280",
      })
    : netflixInitialLogo;

  const images = useMemo(() => {
    return (
      data?.results.map((movie) => {
        return !!movie.poster_path
          ? getImageUrl({
              pathSegment: movie.poster_path,
              format: "w500",
            })
          : netflixInitialLogo;
      }) ?? []
    );
  }, [data?.results]);

  const items = useMemo(() => {
    if (!data) {
      return [];
    }

    if (dataType === "movie") {
      return (data.results as Movie[]).map((movieOrTvShow) => {
        return {
          ...movieOrTvShow,
          id: movieOrTvShow.id.toString(),
        } satisfies ItemMovie;
      });
    } else if (dataType === "tv-show") {
      return (data.results as TvShow[]).map((movieOrTvShow) => {
        return {
          ...movieOrTvShow,
          id: movieOrTvShow.id.toString(),
          title: movieOrTvShow.name,
        } satisfies ItemTvShow;
      });
    } else {
      return [];
    }
  }, [data, dataType]);

  return {
    bannerMovieImageSrc,
    images,
    items: items as Item[],
  };
};
