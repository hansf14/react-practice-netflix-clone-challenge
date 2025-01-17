import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import qs from "qs";
import validator from "validator";
import { useQuery } from "@tanstack/react-query";
import { BASE_PATH, searchMovie, searchTvShow } from "@/api";
import { styled } from "styled-components";
import { Result } from "antd";
import {
  CarouselContainer,
  CarouselDescription,
  Carousels,
  CarouselTitle,
} from "@/components/Carousels";
import { usePreprocessData } from "@/hooks/usePreprocessData";
import { Carousel, OnOpenItem } from "@/components/Carousel";
import { ModalDetailView, OnCloseItem } from "@/components/ModalDetailView";
import { Error400 } from "@/components/Error400";
import { useDomainBoundNavigateBack } from "@/hooks/useDomainBoundNavigateBack";

const SearchBase = styled.div`
  container-name: search-base;
  container-type: inline-size;

  width: 100%;
`;

const ContainerSingle = styled.div`
  width: 80cqw;
  margin: 0 10cqw;
  @container (max-width: 1000px) {
    & {
      width: 100cqw;
      margin: 0;
    }
  }
`;

const ResultNotFound = styled(Result)`
  &&& .ant-result-title {
    color: #fff;
    font-weight: bold;
  }
`;

export function Search() {
  const location = useLocation();
  // const query = new URLSearchParams(location.search).get("query");
  const queryString = location.search.substring(1);
  // console.log(queryString);
  const { query } = qs.parse(queryString);
  // console.log(query);

  const navigate = useNavigate();

  // Redirect if `query` is missing
  useEffect(() => {
    if (!query) {
      navigate(BASE_PATH, { replace: true });
    }
  }, [query, navigate]);

  const rawQuery = validator.unescape((query as string) ?? "");
  // console.log(rawQuery);

  const { data: movieSearchData, status: movieSearchStatus } = useQuery({
    queryKey: [rawQuery, "search", "movie"],
    queryFn: async () => {
      return await searchMovie({ query: rawQuery });
    },
    refetchOnWindowFocus: false,
    retry: false,
  });
  const { data: tvShowSearchData, status: tvShowSearchStatus } = useQuery({
    queryKey: [rawQuery, "search", "tv-show"],
    queryFn: async () => {
      return await searchTvShow({ query: rawQuery });
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  // console.log(movieSearchData);
  // console.log(tvShowSearchData);

  const { images: imagesMovie, items: itemsMovie } = usePreprocessData({
    data: movieSearchData,
    dataType: "movie",
  });

  const { images: imagesTvShow, items: itemsTvShow } = usePreprocessData({
    data: tvShowSearchData,
    dataType: "tv-show",
  });

  const searchMoviePathMatchParam = "movieId";
  const searchMoviePathMatchPattern = `${BASE_PATH}/search/movies/:${searchMoviePathMatchParam}`;

  const searchTvShowPathMatchParam = "tvShowId";
  const searchTvShowPathMatchPattern = `${BASE_PATH}/search/tv-shows/:${searchTvShowPathMatchParam}`;

  const searchParam = "list";

  const onOpenMovie = useCallback<OnOpenItem>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ carouselId, itemId, title, image }) => {
      // console.log(image);

      navigate(
        `${BASE_PATH}/search/movies/${itemId}?query=${query}&${searchParam}=${carouselId}`,
        {
          state: {
            image,
          },
        },
      );
    },
    [query, navigate],
  );

  const onOpenTvShow = useCallback<OnOpenItem>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ carouselId, itemId, title, image }) => {
      // console.log(image);

      navigate(
        `${BASE_PATH}/search/tv-shows/${itemId}?query=${query}&${searchParam}=${carouselId}`,
        {
          state: {
            image,
          },
        },
      );
    },
    [query, navigate],
  );

  const { domainBoundNavigateBack } = useDomainBoundNavigateBack();

  const onClickModalOverlay = useCallback<OnCloseItem>(() => {
    domainBoundNavigateBack({
      fallbackPath: `${BASE_PATH}/search?query=${query}`,
    });
  }, [query, domainBoundNavigateBack]);

  // console.log(movieSearchData);
  // console.log(tvShowSearchData);

  return (
    <SearchBase>
      <Carousels>
        <CarouselContainer>
          <CarouselTitle>Movies</CarouselTitle>
          <CarouselDescription>
            A list of movies that are searched by the query.
          </CarouselDescription>

          {movieSearchStatus === "error" && (
            <ContainerSingle>
              <Error400 />
            </ContainerSingle>
          )}
          {movieSearchStatus === "success" &&
          movieSearchData &&
          movieSearchData.results.length === 0 ? (
            <ContainerSingle>
              <ResultNotFound title="Result Not Found" />
            </ContainerSingle>
          ) : (
            <Carousel
              id="search-movies"
              items={itemsMovie}
              images={imagesMovie}
              onOpenItem={onOpenMovie}
            />
          )}
        </CarouselContainer>

        <CarouselContainer>
          <CarouselTitle>TV Shows</CarouselTitle>
          <CarouselDescription>
            A list of TV shows that are searched by the query.
          </CarouselDescription>

          {tvShowSearchStatus === "error" && (
            <ContainerSingle>
              <Error400 />
            </ContainerSingle>
          )}
          {tvShowSearchStatus === "success" &&
          tvShowSearchData &&
          tvShowSearchData.results.length === 0 ? (
            <ContainerSingle>
              <ResultNotFound title="Result Not Found" />
            </ContainerSingle>
          ) : (
            <Carousel
              id="search-tv-shows"
              items={itemsTvShow}
              images={imagesTvShow}
              onOpenItem={onOpenTvShow}
            />
          )}
        </CarouselContainer>
      </Carousels>
      <ModalDetailView
        type="movie"
        pathMatchPattern={searchMoviePathMatchPattern}
        pathMatchParam={searchMoviePathMatchParam}
        searchParam={searchParam}
        onOpenItem={onOpenMovie}
        onClickModalOverlay={onClickModalOverlay}
      />
      <ModalDetailView
        type="tv-show"
        pathMatchPattern={searchTvShowPathMatchPattern}
        pathMatchParam={searchTvShowPathMatchParam}
        searchParam={searchParam}
        onOpenItem={onOpenTvShow}
        onClickModalOverlay={onClickModalOverlay}
      />
    </SearchBase>
  );
}
