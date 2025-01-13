import { useCallback } from "react";
import {
  getMoviesNowPlaying,
  getMoviesPopular,
  getMoviesTopRated,
  getMoviesUpcoming,
} from "@/api";
import { basePath } from "@/router";
import { useQuery } from "react-query";
import { styled } from "styled-components";
import { useMedia } from "react-use";
import { Carousel, OnCloseItem, OnOpenItem } from "@/components/Carousel";
import { useNavigate } from "react-router-dom";
import { ItemMovie, usePreprocessData } from "@/hooks/usePreprocessData";
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

const HomeBase = styled.div``;

export function Home() {
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
    ({ carouselId, itemId, title }) => {
      navigate(`movies/${itemId}?list=${carouselId}`);
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

  return (
    <HomeBase>
      {isLoadingNowPlaying && <Loader />}
      {isSuccessNowPlaying && dataNowPlaying.results.length && (
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
      )}
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
              pathMatchPattern={`${basePath}/movies/:movieId`}
              pathMatchParam="movieId"
              onOpenItem={onOpenMoviesItem}
              onCloseItem={onCloseMoviesItem}
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
              pathMatchPattern={`${basePath}/movies/:movieId`}
              pathMatchParam="movieId"
              onOpenItem={onOpenMoviesItem}
              onCloseItem={onCloseMoviesItem}
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
              pathMatchPattern={`${basePath}/movies/:movieId`}
              pathMatchParam="movieId"
              onOpenItem={onOpenMoviesItem}
              onCloseItem={onCloseMoviesItem}
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
              pathMatchPattern={`${basePath}/movies/:movieId`}
              pathMatchParam="movieId"
              onOpenItem={onOpenMoviesItem}
              onCloseItem={onCloseMoviesItem}
            />
          </CarouselContainer>
        )}
      </Carousels>
    </HomeBase>
  );
}
