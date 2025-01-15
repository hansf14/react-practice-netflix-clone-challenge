import { useCallback } from "react";
import { styled } from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useMedia } from "react-use";
import { Carousel, OnOpenItem } from "@/components/Carousel";
import { ItemMovie, usePreprocessData } from "@/hooks/usePreprocessData";
import {
  getTvShowsAiringToday,
  getTvShowsOnTheAir,
  getTvShowsPopular,
  getTvShowsTopRated,
} from "@/api";
import { BASE_PATH } from "@/api";
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

export function TvShows() {
  const {
    data: dataAiringToday,
    isLoading: isLoadingAiringToday,
    isSuccess: isSuccessAiringToday,
  } = useQuery({
    queryKey: ["getTvShowsAiringToday"],
    queryFn: getTvShowsAiringToday,
  });

  const { data: dataOnTheAir, isSuccess: isSuccessOnTheAir } = useQuery({
    queryKey: ["getTvShowsOnTheAir"],
    queryFn: getTvShowsOnTheAir,
  });

  const { data: dataPopular, isSuccess: isSuccessPopular } = useQuery({
    queryKey: ["getTvShowsPopular"],
    queryFn: getTvShowsPopular,
  });

  const { data: dataTopRated, isSuccess: isSuccessTopRated } = useQuery({
    queryKey: ["getTvShowsTopRated"],
    queryFn: getTvShowsTopRated,
  });

  const isSmallerEqual600px = useMedia("(max-width: 600px)");

  const navigate = useNavigate();
  const searchParam = "list";

  const onOpenMoviesItem = useCallback<OnOpenItem>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ carouselId, itemId, title }) => {
      navigate(`${itemId}?${searchParam}=${carouselId}`);
    },
    [navigate],
  );

  // const onCloseMoviesItem = useCallback<OnCloseItem>(() => {
  //   navigate(-1);
  // }, [navigate]);

  const {
    bannerMovieImageSrc,
    images: imagesAiringToday,
    items: itemsAiringToday,
  } = usePreprocessData<ItemMovie>({
    data: dataAiringToday,
    dataType: "tv-show",
  });

  const { images: imagesOnTheAir, items: itemsOnTheAir } =
    usePreprocessData<ItemMovie>({
      data: dataOnTheAir,
      dataType: "tv-show",
    });

  const { images: imagesPopular, items: itemsPopular } =
    usePreprocessData<ItemMovie>({
      data: dataPopular,
      dataType: "tv-show",
    });

  const { images: imagesTopRated, items: itemsTopRated } =
    usePreprocessData<ItemMovie>({
      data: dataTopRated,
      dataType: "tv-show",
    });

  return (
    <HomeBase>
      {isLoadingAiringToday && <Loader />}
      {isSuccessAiringToday && dataAiringToday.results.length && (
        <>
          <Banner backgroundImageSrc={bannerMovieImageSrc}>
            <BannerContent>
              <BannerTitle textLength={dataAiringToday.results[0].name.length}>
                {dataAiringToday.results[0].name}
              </BannerTitle>
              {!isSmallerEqual600px && (
                <BannerOverview>
                  {dataAiringToday.results[0].overview}
                </BannerOverview>
              )}
            </BannerContent>
          </Banner>
          {isSmallerEqual600px && (
            <BannerContentMobile>
              <BannerOverview>
                {dataAiringToday.results[0].overview}
              </BannerOverview>
            </BannerContentMobile>
          )}
        </>
      )}
      {/* <Carousels>
        {isSuccessAiringToday && dataAiringToday.results.length && (
          <CarouselContainer>
            <CarouselTitle>Airing Today</CarouselTitle>
            <CarouselDescription>
              A list of TV shows airing today.
            </CarouselDescription>
            <Carousel
              id="airing-today"
              items={itemsAiringToday}
              images={imagesAiringToday}
              pathMatchPattern={`${BASE_PATH}/tv-shows/:tvShowId`}
              pathMatchParam="tvShowId"
              searchParam={searchParam}
              onOpenItem={onOpenMoviesItem}
              onCloseItem={onCloseMoviesItem}
            />
          </CarouselContainer>
        )}
        {isSuccessOnTheAir && dataOnTheAir.results.length && (
          <CarouselContainer>
            <CarouselTitle>On The Air</CarouselTitle>
            <CarouselDescription>
              A list of TV shows that air in the next 7 days.
            </CarouselDescription>
            <Carousel
              id="on-the-air"
              items={itemsOnTheAir}
              images={imagesOnTheAir}
              pathMatchPattern={`${BASE_PATH}/tv-shows/:tvShowId`}
              pathMatchParam="tvShowId"
              searchParam={searchParam}
              onOpenItem={onOpenMoviesItem}
              onCloseItem={onCloseMoviesItem}
            />
          </CarouselContainer>
        )}
        {isSuccessPopular && dataPopular.results.length && (
          <CarouselContainer>
            <CarouselTitle>Popular</CarouselTitle>
            <CarouselDescription>
              A list of TV shows ordered by popularity.
            </CarouselDescription>
            <Carousel
              id="popular"
              items={itemsPopular}
              images={imagesPopular}
              pathMatchPattern={`${BASE_PATH}/tv-shows/:tvShowId`}
              pathMatchParam="tvShowId"
              searchParam={searchParam}
              onOpenItem={onOpenMoviesItem}
              onCloseItem={onCloseMoviesItem}
            />
          </CarouselContainer>
        )}
        {isSuccessTopRated && dataTopRated.results.length && (
          <CarouselContainer>
            <CarouselTitle>Top Rated</CarouselTitle>
            <CarouselDescription>
              A list of TV shows ordered by rating.
            </CarouselDescription>
            <Carousel
              id="top-rated"
              items={itemsTopRated}
              images={imagesTopRated}
              pathMatchPattern={`${BASE_PATH}/tv-shows/:tvShowId`}
              pathMatchParam="tvShowId"
              searchParam={searchParam}
              onOpenItem={onOpenMoviesItem}
              onCloseItem={onCloseMoviesItem}
            />
          </CarouselContainer>
        )}
      </Carousels> */}
    </HomeBase>
  );
}
