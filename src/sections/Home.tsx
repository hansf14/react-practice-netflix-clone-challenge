import { useCallback, useEffect, useMemo, useState } from "react";
import parse from "html-react-parser";
import {
  getImageUrl,
  getMoviesNowPlaying,
  GetMoviesNowPlayingResult,
  getMoviesPopular,
  GetMoviesPopularResult,
  getMoviesTopRated,
  getMoviesUpcoming,
  IMAGE_FALLBACK_URL,
} from "@/api";
import { basePath } from "@/router";
import { preloadAllImages } from "@/utils";
import { useQuery } from "react-query";
import { css, styled } from "styled-components";
import { useMedia } from "react-use";
import { Carousel, OnCloseItem, OnOpenItem } from "@/components/Carousel";
import { useNavigate } from "react-router-dom";
import netflixInitialLogo from "@/assets/netflix-initial-logo.png";

const HomeBase = styled.div``;

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

export type BannerTitleProps = {
  textLength: number;
};

const BannerTitle = styled.h2.withConfig({
  shouldForwardProp: (prop) => !["textLength"].includes(prop),
})<BannerTitleProps>`
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

const BannerOverview = styled.div`
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

const Sliders = styled.div`
  display: flex;
  flex-direction: column;
`;

const Slider = styled.div``;

const SliderTitle = styled.h1`
  margin: 15px 0 15px 10%;
  font-size: 26px;
  font-weight: bold;

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

const usePreprocessData = ({
  data,
}: {
  data: GetMoviesNowPlayingResult | GetMoviesPopularResult | undefined;
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

      const preloadedImageComponents = preloadedImageElements.map((element) =>
        element?.outerHTML ? (
          parse(element?.outerHTML)
        ) : (
          <img src={netflixInitialLogo} /> // Fallback
        ),
      );
      setStatePreloadedImages(preloadedImageComponents);
    })();
  }, [moviePosterImageSrcArr]);

  const items = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.results.map((movie) => ({
      ...movie,
      id: movie.id.toString(),
    }));
  }, [data]);

  return {
    bannerMovieImageSrc,
    images: statePreloadedImages,
    items,
  };
};

function Home() {
  const {
    data: dataNowPlaying,
    isLoading: isLoadingNowPlaying,
    isSuccess: isSuccessNowPlaying,
    // isError: isErrorNowPlaying,
  } = useQuery({
    queryKey: ["getMoviesNowPlaying"],
    queryFn: getMoviesNowPlaying,
  });

  const {
    data: dataPopular,
    // isLoading: isLoadingPopular,
    isSuccess: isSuccessPopular,
    // isError: isErrorPopular,
  } = useQuery({
    queryKey: ["getMoviesPopular"],
    queryFn: getMoviesPopular,
  });

  const {
    data: dataTopRated,
    // isLoading: isLoadingTopRated,
    isSuccess: isSuccessTopRated,
    // isError: isErrorTopRated,
  } = useQuery({
    queryKey: ["getMoviesTopRated"],
    queryFn: getMoviesTopRated,
  });

  const {
    data: dataUpcoming,
    // isLoading: isLoadingUpcoming,
    isSuccess: isSuccessUpcoming,
    // isError: isErrorUpcoming,
  } = useQuery({
    queryKey: ["getMoviesUpcoming"],
    queryFn: getMoviesUpcoming,
  });

  // console.log(dataNowPlaying);
  // console.log(dataPopular);

  const isSmallerEqual600px = useMedia("(max-width: 600px)");

  const navigate = useNavigate();

  const onOpenMoviesItem = useCallback<OnOpenItem>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ id, movieId, title }) => {
      navigate(`movies/${movieId}?list=${id}`);
    },
    [navigate],
  );

  const onCloseMoviesItem = useCallback<OnCloseItem>(() => {
    navigate(-1);
  }, [navigate]);

  const {
    bannerMovieImageSrc,
    images: imagesNowPlaying,
    items: itemsNowPlaying,
  } = usePreprocessData({ data: dataNowPlaying });

  const { images: imagesPopular, items: itemsPopular } = usePreprocessData({
    data: dataPopular,
  });

  const { images: imagesTopRated, items: itemsTopRated } = usePreprocessData({
    data: dataTopRated,
  });

  const { images: imagesUpcoming, items: itemsUpcoming } = usePreprocessData({
    data: dataUpcoming,
  });

  return (
    <HomeBase>
      {isLoadingNowPlaying && <Loader>Loading...</Loader>}
      {isSuccessNowPlaying && dataNowPlaying.results.length && (
        <>
          <Banner
            // onClick={increaseVisibleRowIndex}
            backgroundImageSrc={bannerMovieImageSrc}
          >
            <BannerContent>
              <BannerTitle textLength={dataNowPlaying.results[0].title.length}>
                {dataNowPlaying.results[0].title}
              </BannerTitle>
              {!isSmallerEqual600px && (
                <BannerOverview>
                  {dataNowPlaying.results[0].overview}
                </BannerOverview>
              )}
            </BannerContent>
          </Banner>
          {isSmallerEqual600px && (
            <BannerContentMobile>
              <BannerOverview>
                {dataNowPlaying.results[0].overview}
              </BannerOverview>
            </BannerContentMobile>
          )}
        </>
      )}
      <Sliders>
        {isSuccessNowPlaying && dataNowPlaying.results.length && (
          <Slider>
            <SliderTitle>Now Playing</SliderTitle>
            <Carousel
              id="now-playing"
              items={itemsNowPlaying}
              images={imagesNowPlaying}
              pathMatchPattern={`${basePath}/movies/:movieId`}
              pathMatchParam="movieId"
              onOpenItem={onOpenMoviesItem}
              onCloseItem={onCloseMoviesItem}
            />
          </Slider>
        )}
        {isSuccessPopular && dataPopular.results.length && (
          <Slider>
            <SliderTitle>Popular</SliderTitle>
            <Carousel
              id="popular"
              items={itemsPopular}
              images={imagesPopular}
              pathMatchPattern={`${basePath}/movies/:movieId`}
              pathMatchParam="movieId"
              onOpenItem={onOpenMoviesItem}
              onCloseItem={onCloseMoviesItem}
            />
          </Slider>
        )}
        {isSuccessTopRated && dataTopRated.results.length && (
          <Slider>
            <SliderTitle>Top Rated</SliderTitle>
            <Carousel
              id="top-rated"
              items={itemsTopRated}
              images={imagesTopRated}
              pathMatchPattern={`${basePath}/movies/:movieId`}
              pathMatchParam="movieId"
              onOpenItem={onOpenMoviesItem}
              onCloseItem={onCloseMoviesItem}
            />
          </Slider>
        )}
        {isSuccessUpcoming && dataUpcoming.results.length && (
          <Slider>
            <SliderTitle>Upcoming</SliderTitle>
            <Carousel
              id="upcoming"
              items={itemsUpcoming}
              images={imagesUpcoming}
              pathMatchPattern={`${basePath}/movies/:movieId`}
              pathMatchParam="movieId"
              onOpenItem={onOpenMoviesItem}
              onCloseItem={onCloseMoviesItem}
            />
          </Slider>
        )}
      </Sliders>
    </HomeBase>
  );
}

export default Home;
