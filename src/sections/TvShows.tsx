import { useCallback, useMemo } from "react";
import { styled } from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useMedia } from "react-use";
import { Carousel, OnOpenItem } from "@/components/Carousel";
import { usePreprocessData } from "@/hooks/usePreprocessData";
import {
  BASE_PATH,
  getTvShowsAiringToday,
  getTvShowsOnTheAir,
  getTvShowsPopular,
  getTvShowsTopRated,
} from "@/api";
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
import { ModalDetailView, OnCloseItem } from "@/components/ModalDetailView";
import { Error as ErrorComponent } from "@/components/Error";
import { useDomainBoundNavigateBack } from "@/hooks/useDomainBoundNavigateBack";

const TvShowsBase = styled.div``;

export function TvShows() {
  const {
    data: dataAiringToday,
    isLoading: isLoadingAiringToday,
    isSuccess: isSuccessAiringToday,
    isError: isErrorAiringToday,
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
  const { domainBoundNavigateBack } = useDomainBoundNavigateBack();

  const pathMatchParam = "tvShowId";
  const pathMatchPattern = `${BASE_PATH}/tv-shows/:${pathMatchParam}`;
  const searchParam = "list";

  const onOpenItem = useCallback<OnOpenItem>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ carouselId, itemId, title, image }) => {
      navigate(`${BASE_PATH}/tv-shows/${itemId}?${searchParam}=${carouselId}`, {
        state: {
          image,
        },
      });
    },
    [navigate],
  );

  const onClickModalOverlay = useCallback<OnCloseItem>(() => {
    domainBoundNavigateBack({ fallbackPath: BASE_PATH });
  }, [domainBoundNavigateBack]);

  const {
    bannerMovieImageSrc,
    images: imagesAiringToday,
    items: itemsAiringToday,
  } = usePreprocessData({
    data: dataAiringToday,
    dataType: "tv-show",
  });

  const { images: imagesOnTheAir, items: itemsOnTheAir } = usePreprocessData({
    data: dataOnTheAir,
    dataType: "tv-show",
  });

  const { images: imagesPopular, items: itemsPopular } = usePreprocessData({
    data: dataPopular,
    dataType: "tv-show",
  });

  const { images: imagesTopRated, items: itemsTopRated } = usePreprocessData({
    data: dataTopRated,
    dataType: "tv-show",
  });

  const banner = useMemo(() => {
    return !!dataAiringToday?.results.length ? (
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
    ) : (
      <Banner />
    );
  }, [bannerMovieImageSrc, dataAiringToday?.results, isSmallerEqual600px]);

  return (
    <TvShowsBase>
      {isErrorAiringToday && <ErrorComponent />}
      {isLoadingAiringToday ? <Loader>{banner}</Loader> : banner}
      <Carousels>
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
              onOpenItem={onOpenItem}
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
              onOpenItem={onOpenItem}
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
              onOpenItem={onOpenItem}
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
              onOpenItem={onOpenItem}
            />
          </CarouselContainer>
        )}
      </Carousels>
      <ModalDetailView
        type="tv-show"
        pathMatchPattern={pathMatchPattern}
        pathMatchParam={pathMatchParam}
        searchParam={searchParam}
        onOpenItem={onOpenItem}
        onClickModalOverlay={onClickModalOverlay}
      />
    </TvShowsBase>
  );
}
