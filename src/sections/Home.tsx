import parse from "html-react-parser";
import { getImageUrl, getMoviesNowPlaying, IMAGE_FALLBACK_URL } from "@/api";
import { basePath } from "@/router";
import { preloadAllImages } from "@/utils";
import {
  AnimatePresence,
  motion,
  useIsomorphicLayoutEffect,
  Variants,
} from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useMatch, useNavigate } from "react-router-dom";
import { css, styled } from "styled-components";
import { useMedia } from "react-use";
import { Carousel } from "@/components/Carousel";

const HomeBase = styled.div`
  height: 200vh;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export type BannerProps = {
  backgroundImageSrc?: string;
};

const Banner = styled.div.withConfig({
  shouldForwardProp: (prop) => !["backgroundImageSrc"].includes(prop),
})<BannerProps>`
  position: relative;
  width: 100%;
  aspect-ratio: 1280 / 720;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  @media (max-width: 1200px) {
    & {
      padding: 40px;
    }
  }
  @media (max-width: 800px) {
    & {
      padding: 30px;
    }
  }

  ${({ backgroundImageSrc }) => {
    return !!backgroundImageSrc
      ? css`
          background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
            url(${backgroundImageSrc});
          background-size: contain;
          background-repeat: no-repeat;
        `
      : "";
  }}
`;

const BannerContent = styled.div`
  @media (max-width: 800px) {
    & {
      position: absolute;
      left: 30px;
      right: 30px;
      bottom: 15px;
    }
  }

  @media (max-width: 340px) {
    & {
      left: 20px;
      right: 20px;
    }
  }
`;

const BannerContentMobile = styled.div`
  background-color: #000;

  padding: 0 30px 30px;
  @media (max-width: 340px) {
    & {
      padding: 0 20px 20px;
    }
  }
`;

export type TitleProps = {
  textLength: number;
};

const Title = styled.h2.withConfig({
  shouldForwardProp: (prop) => !["textLength"].includes(prop),
})<TitleProps>`
  margin-bottom: 15px;
  @media (max-width: 600px) {
    & {
      margin-bottom: 0;
    }
  }

  --font-size-scale-factor: 1;
  @media (min-width: 1901px) {
    & {
      --font-size-scale-factor: 3;
    }
  }
  @media (max-width: 1900px) {
    & {
      --font-size-scale-factor: 2.5;
    }
  }
  @media (max-width: 1200px) {
    & {
      --font-size-scale-factor: 2;
    }
  }
  @media (max-width: 1000px) {
    & {
      --font-size-scale-factor: 1.8;
    }
  }
  @media (max-width: 800px) {
    & {
      --font-size-scale-factor: 1.6;
    }
  }
  @media (max-width: 600px) {
    & {
      --font-size-scale-factor: 1.4;
    }
  }
  @media (max-width: 400px) {
    & {
      --font-size-scale-factor: 1;
    }
  }
  ${({ textLength }) => {
    let baseFontSize = 28;
    if (textLength > 30) {
      baseFontSize = 24;
    }
    return css`
      --font-size: calc(${baseFontSize}px * var(--font-size-scale-factor, 1));
      --round-interval: 1px;
      font-size: clamp(
        24px,
        round(var(--font-size), var(--round-interval)),
        68px
      );
    `;
  }}
`;

const Overview = styled.div`
  width: 50%;
  @media (min-width: 1901px) {
    & {
      width: 30%;
    }
  }
  @media (max-width: 1900px) {
    & {
      width: 30%;
    }
  }
  @media (max-width: 1500px) {
    & {
      width: 40%;
    }
  }
  @media (max-width: 800px) {
    & {
      width: 100%;
    }
  }

  font-size: 18px;
  @media (max-width: 1000px) {
    & {
      font-size: 16px;
    }
  }
`;

const SliderTitle = styled.h1`
  margin: 15px 0 15px 10%;
  font-size: 26px;

  @media (max-width: 1000px) {
    & {
      margin: 15px 0 15px 15px;
    }
  }
  @media (max-width: 400px) {
    & {
      font-size: 20px;
    }
  }
`;

function Home() {
  const { data, error, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["getMoviesNowPlaying"],
    queryFn: getMoviesNowPlaying,
  });
  console.log(data);

  const bannerMovieImageSrcPathSegment =
    data && data.results.length
      ? (data.results[0].backdrop_path ?? data.results[0].poster_path ?? null)
      : null;
  const bannerMovieImageSrc = !!bannerMovieImageSrcPathSegment
    ? getImageUrl({
        pathSegment: bannerMovieImageSrcPathSegment,
        format: "w1280",
      })
    : IMAGE_FALLBACK_URL;

  const moviePosterImageSrcArr = useMemo(() => {
    return (
      data?.results.map((movie) => {
        return !!movie.poster_path
          ? getImageUrl({
              pathSegment: movie.poster_path,
              format: "w500",
            })
          : IMAGE_FALLBACK_URL;
      }) ?? []
    );
  }, [data?.results]);

  const [statePreloadedImages, setStatePreloadedImages] = useState<
    React.ReactNode[]
  >([]);

  useEffect(() => {
    (async () => {
      const movieImageSrcArrForPreload = moviePosterImageSrcArr;
      const preloadedImageElements = await preloadAllImages({
        srcArr: movieImageSrcArrForPreload,
      });
      console.log(preloadedImageElements);

      const preloadedImageComponents = preloadedImageElements.map(
        (element) => (element?.outerHTML ? parse(element?.outerHTML) : null), // TODO: error image
      );
      setStatePreloadedImages(preloadedImageComponents);
    })();
  }, [moviePosterImageSrcArr]);

  const isSmallerEqual600px = useMedia("(max-width: 600px)");

  const nowPlayingMovies = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.results.map((movie) => ({
      ...movie,
      id: movie.id.toString(),
    }));
  }, [data]);

  return (
    <HomeBase>
      {isLoading && <Loader>Loading...</Loader>}
      {isSuccess && data.results.length && (
        <>
          <Banner
            // onClick={increaseVisibleRowIndex}
            backgroundImageSrc={bannerMovieImageSrc}
          >
            <BannerContent>
              <Title textLength={data.results[0].title.length}>
                {data.results[0].title}
              </Title>
              {!isSmallerEqual600px && (
                <Overview>{data.results[0].overview}</Overview>
              )}
            </BannerContent>
          </Banner>
          {isSmallerEqual600px && (
            <BannerContentMobile>
              <Overview>{data.results[0].overview}</Overview>
            </BannerContentMobile>
          )}

          <SliderTitle>Now Playing</SliderTitle>
          <Carousel
            items={nowPlayingMovies}
            images={statePreloadedImages}
            pathMatchPattern={`${basePath}/movies/:movieId`}
            pathMatchParam="movieId"
          />
        </>
      )}
      {isError && <div>Error</div>}
    </HomeBase>
  );
}

export default Home;
