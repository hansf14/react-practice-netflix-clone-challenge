import { useEffect, useMemo, useState } from "react";
import parse from "html-react-parser";
import {
  getImageUrl,
  GetMoviesNowPlayingResult,
  GetMoviesPopularResult,
  GetMoviesTopRatedResult,
  GetMoviesUpcomingResult,
  GetTvShowsOnTheAirResult,
  Movie,
  TvShow,
} from "@/api";
import { preloadAllImages, SmartMerge, SmartOmit } from "@/utils";
import netflixInitialLogo from "@/assets/netflix-initial-logo.png";

export type ItemMovie = SmartMerge<SmartOmit<Movie, "id"> & { id: string }>;

export type ItemTvShow = SmartMerge<SmartOmit<TvShow, "id"> & { id: string }>;

export const usePreprocessData = <Item extends ItemMovie | ItemTvShow>({
  data,
  dataType = "movie",
}: {
  data:
    | GetMoviesNowPlayingResult
    | GetMoviesPopularResult
    | GetMoviesTopRatedResult
    | GetMoviesUpcomingResult
    | GetTvShowsOnTheAirResult
    | undefined;
  dataType?: "movie" | "tv-show";
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

  const posterImageSrcArr = useMemo(() => {
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

  const [statePreloadedImages, setStatePreloadedImages] = useState<
    React.ReactNode[]
  >([]);

  useEffect(() => {
    (async () => {
      const imageSrcArrForPreload = posterImageSrcArr;
      const preloadedImageElements = await preloadAllImages({
        srcArr: imageSrcArrForPreload,
      });
      console.log(preloadedImageElements);

      const preloadedImageComponents = preloadedImageElements.map((element) =>
        element?.outerHTML ? (
          parse(element?.outerHTML)
        ) : (
          <img src={netflixInitialLogo} /> // Fallback
        ),
      );
      setStatePreloadedImages(preloadedImageComponents);
    })();
  }, [posterImageSrcArr]);

  const items = useMemo(() => {
    if (!data) {
      return [];
    }

    if (dataType === "movie") {
      return data.results.map((movieOrTvShow) => {
        return {
          ...movieOrTvShow,
          id: movieOrTvShow.id.toString(),
        };
      });
    } else if (dataType === "tv-show") {
      return data.results.map((movieOrTvShow) => {
        return {
          ...movieOrTvShow,
          id: movieOrTvShow.id.toString(),
          title: (movieOrTvShow as TvShow).name,
        };
      });
    } else {
      return [];
    }
  }, [data, dataType]);

  return {
    bannerMovieImageSrc,
    images: statePreloadedImages,
    items: items as unknown as Item[],
  };
};
