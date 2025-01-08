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

const Slider = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  overflow: visible;
`;

const SliderContent = styled.div`
  display: grid;

  width: 80%;
  @media (max-width: 1000px) {
    & {
      width: 100%;
    }
  }
`;

export type RowProps = {
  itemCntPerRow: number;
};

const Row = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !["itemCntPerRow"].includes(prop),
})<RowProps>`
  transform-style: preserve-3d;

  grid-column: 1;
  grid-row: 1;
  min-width: 0;

  display: grid;
  grid-template-columns: repeat(
    ${({ itemCntPerRow }) => itemCntPerRow.toString()},
    1fr
  );
  gap: 10px;
  @media (max-width: 600px) {
    & {
      gap: 0;
    }
  }
`;

export type PosterProps = {};

const MovieBox = styled(motion.div)`
  transform-style: preserve-3d;
  position: relative;
  min-width: 0;
  width: 100%;

  transform-origin: center bottom;
  &:first-child {
    transform-origin: left bottom;
  }
  &:last-child {
    transform-origin: right bottom;
  }

  cursor: pointer;
`;

const cssPosterImage = css`
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  height: 100%;
`;

const Poster = styled.div`
  z-index: 100;
  transform: translateZ(5px);
  aspect-ratio: 2 / 3; // Prevent subpixel problem by setting the aspect ratio to the image intrinsic dimension.

  display: flex;
  align-items: center;

  img {
    ${cssPosterImage}
  }
`;

const MovieGeneralInfo = styled(motion.div)`
  z-index: 10;
  transform: translateZ(3px);
  position: absolute;
  bottom: 0;
  width: 100%;

  padding: 10px;
  opacity: 0;
  background-color: #eee;
  color: #111;

  @media (max-width: 500px) {
    & {
      padding: 10px 5px;
    }
  }
`;

const MovieGeneralInfoTitle = styled.h3`
  text-align: center;

  font-size: 14px;
  @media (max-width: 500px) {
    & {
      font-size: 12px;
    }
  }
`;

const ModalContent = styled(motion.div)`
  position: fixed;
  width: min(780px, 40%);
  height: 80vh;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;

  border-radius: 10px;
  background-color: #111;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;

  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const SelectedMoviePoster = styled.div`
  width: 50%;
  aspect-ratio: 2 / 3;
  margin: 10px;
  display: flex;
  justify-content: center;

  img {
    ${cssPosterImage}
    object-fit: contain;
  }
`;

const SelectedMovieTitle = styled.h2`
  font-size: 36px;
  text-align: center;
`;

const rowVariants: Variants = {
  hidden: {
    x: document.documentElement.clientWidth,
  },
  visible: { x: 0, transition: { type: "tween", duration: 1 } },
  exit: {
    x: -document.documentElement.clientWidth,
    transition: { type: "tween", duration: 1 },
  },
};

const PosterVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    z: 10,
    y: -10,
    transition: {
      type: "tween", // whileHover in/out 애니메이션의 transition type은 variants와 prop에 둘 다 적어줘야함.
      delay: 0.5,
      duration: 0.3,
    },
  },
};

const movieInfoVariants: Variants = {
  hover: {
    opacity: 1,
    y: "100%",
    transition: {
      type: "tween",
      delay: 0.5,
      duration: 0.3,
    },
  },
};

function Home() {
  const { data, error, isLoading, isSuccess, isError } = useQuery({
    queryKey: ["getMoviesNowPlaying"],
    queryFn: getMoviesNowPlaying,
  });
  console.log(data);

  const isSmallerEqual600px = useMedia("(max-width: 600px)");

  const itemCntPerRow = isSmallerEqual600px ? 4 : 5;

  const [stateVisibleRowIndex, setStateVisibleRowIndex] = useState<number>(0);
  const [stateIsExiting, setStateIsExiting] = useState<boolean>(false);

  const increaseVisibleRowIndex = useCallback(() => {
    if (!data || stateIsExiting) {
      return;
    }

    const totalCntOfMovies = data.results.length;
    const maxVisibleRowIndex = Math.ceil(totalCntOfMovies / itemCntPerRow) - 1;

    setStateIsExiting(true);
    setStateVisibleRowIndex((currentIndex) =>
      currentIndex >= maxVisibleRowIndex ? 0 : currentIndex + 1,
    );
  }, [data, stateIsExiting, itemCntPerRow]);

  const onExitComplete = useCallback(() => {
    setStateIsExiting(false);
  }, []);

  const navigate = useNavigate();

  const onClickMovieBox = useCallback(
    ({ movieId }: { movieId: string }) => {
      navigate(`movies/${movieId}`);
    },
    [navigate],
  );

  const onClickModalOverlay = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const moviesMatch = useMatch(`${basePath}/movies/:movieId`);
  // console.log(moviesMatch);

  const selectedMovieIndex = useMemo(
    () =>
      moviesMatch && data && moviesMatch.params.movieId
        ? (data.results.findIndex(
            (movie) => movie.id.toString() === moviesMatch.params.movieId,
          ) ?? -1)
        : -1,
    [data, moviesMatch],
  );

  const selectedMovie =
    selectedMovieIndex === -1 || !data
      ? null
      : data.results[selectedMovieIndex];

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
  const [stateSelectedMovieImage, setStateSelectedMovieImage] =
    useState<React.ReactNode>(null);

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
  }, [bannerMovieImageSrc, moviePosterImageSrcArr]);

  useEffect(() => {
    if (selectedMovieIndex !== -1) {
      setStateSelectedMovieImage(statePreloadedImages[selectedMovieIndex]);
    }
  }, [selectedMovieIndex, statePreloadedImages]);

  return (
    <HomeBase>
      {isLoading && <Loader>Loading...</Loader>}
      {isSuccess && data.results.length && (
        <>
          <Banner
            onClick={increaseVisibleRowIndex}
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
          <Slider>
            <SliderContent>
              <AnimatePresence initial={false} onExitComplete={onExitComplete}>
                <Row
                  key={stateVisibleRowIndex}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  itemCntPerRow={itemCntPerRow}
                >
                  {data.results
                    .slice(
                      itemCntPerRow * stateVisibleRowIndex,
                      itemCntPerRow * (stateVisibleRowIndex + 1),
                    )
                    .map((movie, index) => {
                      const movieIndex =
                        itemCntPerRow * stateVisibleRowIndex + index;

                      return (
                        <MovieBox
                          key={movie.id}
                          layoutId={movie.id.toString()}
                          variants={PosterVariants}
                          initial="initial"
                          whileHover="hover"
                          transition={{
                            type: "tween",
                          }}
                          onClick={() =>
                            onClickMovieBox({ movieId: movie.id.toString() })
                          }
                        >
                          <Poster>{statePreloadedImages[movieIndex]}</Poster>
                          <MovieGeneralInfo
                            variants={movieInfoVariants}
                            transition={{
                              type: "tween",
                            }}
                          >
                            <MovieGeneralInfoTitle>
                              {movie.title}
                            </MovieGeneralInfoTitle>
                          </MovieGeneralInfo>
                        </MovieBox>
                      );
                    })}
                </Row>
              </AnimatePresence>
            </SliderContent>
          </Slider>
          <AnimatePresence>
            {!!moviesMatch && (
              <>
                <ModalOverlay
                  onClick={onClickModalOverlay}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                />
                <ModalContent layoutId={moviesMatch.params.movieId}>
                  {selectedMovie && (
                    <>
                      <SelectedMoviePoster>
                        {stateSelectedMovieImage}
                      </SelectedMoviePoster>
                      <SelectedMovieTitle>
                        {selectedMovie.title}
                      </SelectedMovieTitle>
                    </>
                  )}
                </ModalContent>
              </>
            )}
          </AnimatePresence>
        </>
      )}
      {isError && <div>Error</div>}
    </HomeBase>
  );
}

export default Home;
