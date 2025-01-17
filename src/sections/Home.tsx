import { useCallback, useMemo } from "react";
import { styled } from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useMedia } from "react-use";
import { Carousel, OnOpenItem } from "@/components/Carousel";
import { usePreprocessData } from "@/hooks/usePreprocessData";
import {
  BASE_PATH,
  getMoviesNowPlaying,
  getMoviesPopular,
  getMoviesTopRated,
  getMoviesUpcoming,
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
import { Error as ErrorComponent } from "@/components/Error";
import { ModalDetailView, OnCloseItem } from "@/components/ModalDetailView";
import { useDomainBoundNavigateBack } from "@/hooks/useDomainBoundNavigateBack";

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
  const { domainBoundNavigateBack } = useDomainBoundNavigateBack();

  const pathMatchParam = "movieId";
  const pathMatchPattern = `${BASE_PATH}/movies/:${pathMatchParam}`;
  const searchParam = "list";

  const onOpenItem = useCallback<OnOpenItem>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ carouselId, itemId, title, image }) => {
      // console.log(image);

      navigate(`${BASE_PATH}/movies/${itemId}?${searchParam}=${carouselId}`, {
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
    images: imagesNowPlaying,
    items: itemsNowPlaying,
  } = usePreprocessData({ data: dataNowPlaying, dataType: "movie" });

  const { images: imagesPopular, items: itemsPopular } = usePreprocessData({
    data: dataPopular,
    dataType: "movie",
  });

  const { images: imagesTopRated, items: itemsTopRated } = usePreprocessData({
    data: dataTopRated,
    dataType: "movie",
  });

  const { images: imagesUpcoming, items: itemsUpcoming } = usePreprocessData({
    data: dataUpcoming,
    dataType: "movie",
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
      {isErrorNowPlaying && <ErrorComponent />}
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
              onOpenItem={onOpenItem}
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
              onOpenItem={onOpenItem}
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
              onOpenItem={onOpenItem}
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
              onOpenItem={onOpenItem}
            />
          </CarouselContainer>
        )}
      </Carousels>
      <ModalDetailView
        type="movie"
        pathMatchPattern={pathMatchPattern}
        pathMatchParam={pathMatchParam}
        searchParam={searchParam}
        onOpenItem={onOpenItem}
        onClickModalOverlay={onClickModalOverlay}
      />
    </HomeBase>
  );
}
