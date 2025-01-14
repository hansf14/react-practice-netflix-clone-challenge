import { useCallback, useMemo } from "react";
import { styled } from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useMedia } from "react-use";
import { Carousel, OnOpenItem } from "@/components/Carousel";
import { ItemMovie, usePreprocessData } from "@/hooks/usePreprocessData";
import {
  getMoviesNowPlaying,
  getMoviesPopular,
  getMoviesTopRated,
  getMoviesUpcoming,
} from "@/api";
import { basePath } from "@/router";
import {
  Banner,
  BannerContent,
  BannerContentMobile,
  BannerOverview,
  BannerTitle,
} from "@/components/Banner";
import { Loader } from "@/components/Loader";
import {
  CarouselContainer,
  CarouselDescription,
  Carousels,
  CarouselTitle,
} from "@/components/Carousels";
import { Error } from "@/components/Error";
import { ModalDetailView, OnCloseItem } from "@/components/ModalDetailView";

const HomeBase = styled.div``;

export function Home() {
  const {
    data: dataNowPlaying,
    isLoading: isLoadingNowPlaying,
    isSuccess: isSuccessNowPlaying,
    isError: isErrorNowPlaying,
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

  const pathMatchPattern = `${basePath}/movies/:movieId`;
  const pathMatchParam = "movieId";
  const searchParam = "list";

  const onOpenMoviesItem = useCallback<OnOpenItem>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ carouselId, itemId, title, image }) => {
      console.log(image);

      navigate(`movies/${itemId}?${searchParam}=${carouselId}`, {
        state: {
          image,
        },
      });
    },
    [navigate],
  );

  const onClickModalOverlay = useCallback<OnCloseItem>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ itemId, title }) => {
      navigate(-1);
    },
    [navigate],
  );

  const {
    bannerMovieImageSrc,
    images: imagesNowPlaying,
    items: itemsNowPlaying,
  } = usePreprocessData<ItemMovie>({ data: dataNowPlaying });

  const { images: imagesPopular, items: itemsPopular } =
    usePreprocessData<ItemMovie>({
      data: dataPopular,
    });

  const { images: imagesTopRated, items: itemsTopRated } =
    usePreprocessData<ItemMovie>({
      data: dataTopRated,
    });

  const { images: imagesUpcoming, items: itemsUpcoming } =
    usePreprocessData<ItemMovie>({
      data: dataUpcoming,
    });

  const banner = useMemo(() => {
    return !!dataNowPlaying?.results.length ? (
      <>
        <Banner backgroundImageSrc={bannerMovieImageSrc}>
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
    ) : (
      <Banner />
    );
  }, [bannerMovieImageSrc, dataNowPlaying?.results, isSmallerEqual600px]);

  return (
    <HomeBase>
      {isErrorNowPlaying && <Error />}
      {isLoadingNowPlaying ? <Loader>{banner}</Loader> : banner}
      <Carousels>
        {isSuccessNowPlaying && dataNowPlaying.results.length && (
          <CarouselContainer>
            <CarouselTitle>Now Playing</CarouselTitle>
            <CarouselDescription>
              A list of movies that are currently in theatres.
            </CarouselDescription>
            <Carousel
              id="now-playing"
              items={itemsNowPlaying}
              images={imagesNowPlaying}
              onOpenItem={onOpenMoviesItem}
            />
          </CarouselContainer>
        )}
        {isSuccessPopular && dataPopular.results.length && (
          <CarouselContainer>
            <CarouselTitle>Popular</CarouselTitle>
            <CarouselDescription>
              A list of movies ordered by popularity.
            </CarouselDescription>
            <Carousel
              id="popular"
              items={itemsPopular}
              images={imagesPopular}
              onOpenItem={onOpenMoviesItem}
            />
          </CarouselContainer>
        )}
        {isSuccessTopRated && dataTopRated.results.length && (
          <CarouselContainer>
            <CarouselTitle>Top Rated</CarouselTitle>
            <CarouselDescription>
              A list of movies ordered by rating.
            </CarouselDescription>
            <Carousel
              id="top-rated"
              items={itemsTopRated}
              images={imagesTopRated}
              onOpenItem={onOpenMoviesItem}
            />
          </CarouselContainer>
        )}
        {isSuccessUpcoming && dataUpcoming.results.length && (
          <CarouselContainer>
            <CarouselTitle>Upcoming</CarouselTitle>
            <CarouselDescription>
              A list of movies that are being released soon.
            </CarouselDescription>
            <Carousel
              id="upcoming"
              items={itemsUpcoming}
              images={imagesUpcoming}
              onOpenItem={onOpenMoviesItem}
            />
          </CarouselContainer>
        )}
      </Carousels>
      <ModalDetailView
        pathMatchPattern={pathMatchPattern}
        pathMatchParam={pathMatchParam}
        searchParam={searchParam}
        onClickModalOverlay={onClickModalOverlay}
      />
    </HomeBase>
  );
}
