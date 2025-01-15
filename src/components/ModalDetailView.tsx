import React, { useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { css, styled } from "styled-components";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import {
  Carousel,
  cssItemPosterImage,
  OnOpenItem,
} from "@/components/Carousel";
import { StyledComponentProps } from "@/utils";
import {
  BASE_PATH,
  getImageUrl,
  getMovieDetails,
  getMoviesRecommended,
  GetMoviesRecommendedResult,
  getMoviesSimilar,
  GetMoviesSimilarResult,
  getTvShowDetails,
  getTvShowsRecommended,
  GetTvShowsRecommendedResult,
  getTvShowsSimilar,
  GetTvShowsSimilarResult,
  MovieDetails,
  TvShowDetails,
} from "@/api";
import netflixInitialLogo from "@/assets/netflix-initial-logo.png";
import { loadImage } from "@/hooks/useLoadImage";
import {
  ItemMovie,
  ItemTvShow,
  usePreprocessData,
} from "@/hooks/usePreprocessData";
import { Error as ErrorComponent } from "@/components/Error";
import { Loader } from "@/components/Loader";
import { Error404 } from "@/components/Error404";

const ModalOverlay = styled(motion.div)`
  z-index: 900;
  position: fixed;
  top: 0;
  width: 100%;
  height: 200dvh;

  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const ModalContainer = styled(motion.div)`
  z-index: 1000;
  position: fixed;

  width: 900px;
  height: 80vh;

  // top: 0;
  top: ${({ theme }) => `calc(10px + ${theme.headerNavBarHeight}px)`};
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0 auto;

  border-radius: 10px;
  background-color: #010101;
  border: 1px solid #fff;
  box-shadow: 0 8px 32px 0 rgba(255, 255, 255, 0.37);
  padding: 10px;

  @media (max-width: 1000px) {
    width: calc(100% - 20px);
  }

  @media (max-height: 800px) {
    width: 100%;
    top: ${({ theme }) => `${theme.headerNavBarHeight}px`};
    height: calc(100lvh - ${({ theme }) => `${theme.headerNavBarHeight}px`});
    border-radius: unset;
    border: none;
    box-shadow: unset;
  }
`;

const Modal = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  overscroll-behavior: none;

  display: flex;
  flex-direction: column;
`;

const ModalContent = styled.div`
  container-name: modal-content;
  container-type: size;

  flex-grow: 1;
  display: grid;
  place-items: center;
  // display: flex;
  // flex-direction: column;
  // align-items: center;
  // justify-content: center;
`;

const ModalContentLoadIndicatorPlaceholder = styled.div`
  width: 100cqw;
  height: 100cqh;
`;

const ItemPoster = styled.div`
  container-name: item-poster;
  container-type: size;

  aspect-ratio: 2 / 3;
  max-width: 40cqw;
  width: 100%;

  display: flex;
  justify-content: center;

  // border: 1px solid #fff;
  // border-radius: 10px;

  img {
    ${cssItemPosterImage}
    object-fit: contain;
  }
`;

const ItemPosterLoadIndicatorPlaceholder = styled.div`
  width: 100cqw;
  height: 100cqh;
`;

const ItemTitle = styled.h2`
  font-size: 28px;
  font-weight: bold;
  text-align: center;

  padding: 20px 15px 25px 25px;
`;

const ItemDivider = styled.hr`
  width: 100%;
  margin-bottom: 20px;
`;

const ItemContent = styled.div``;

const cssItemField = css`
  position: relative;
  padding: 0 15px 0 30px;
  font-size: 16px;
  line-height: 1.2;

  &:not(:last-child) {
    margin-bottom: 2px;
  }

  &::before {
    content: "·";
    font-weight: bold;
    display: block;
    position: absolute;
    left: 15px;
  }
`;

const ItemField = styled.div`
  ${cssItemField}
`;

const ItemFieldFlex = styled.div`
  ${cssItemField}

  display: flex;
  flex-direction: column;
`;

const ItemLabel = styled.span`
  font-weight: bold;
  float: left;
  white-space: nowrap;
`;

const ItemLabelContent = styled.p`
  display: inline;
  white-space: pre-wrap;

  a {
    color: #1677ff;
    font-weight: bold;
  }
`;

const ItemLabelContentFlex = styled.div`
  margin: 6px 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
  white-space: pre-wrap;
`;

const ItemLabelContentGrid = styled.div`
  margin: 6px 0;

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  grid-auto-rows: minmax(150px, auto);
  white-space: pre-wrap;
  gap: 1px;
  background-color: #010101; // #fff;
  border: 1px solid #010101; // #fff;

  > * {
    background-color: #fff; // #010101;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    color: #010101;
    text-align: center;
  }

  span {
    padding: 0 8px;
    line-height: 1.2;

    &:first-of-type {
      margin-top: 10px;
    }
  }
`;

const ItemContentImage = styled.img`
  background-color: #fff;
  ${cssItemPosterImage}
  object-fit: contain;
  width: 100px;
  height: unset;
`;

const Padding = styled.div`
  height: 30px;
`;

export type OnCloseItemParams = {
  itemId: string;
  title: string;
};

export type OnCloseItem = ({ itemId, title }: OnCloseItemParams) => void;

export type ModalDetailViewProps = {
  type: "movie" | "tv-show";
  pathMatchPattern: string;
  pathMatchParam: string;
  searchParam: string;
  onClickModalOverlay?: OnCloseItem;
} & StyledComponentProps<"div">;

export const ModalDetailView = withMemoAndRef<
  "div",
  HTMLDivElement,
  ModalDetailViewProps
>({
  displayName: "ModalDetailView",
  Component: (
    {
      type,
      pathMatchPattern,
      pathMatchParam,
      searchParam: _searchParam,
      onClickModalOverlay: _onClickModalOverlay,
    },
    ref,
  ) => {
    const pathMatch = useMatch(pathMatchPattern);
    const location = useLocation();
    // console.log(location);

    const searchParam = new URLSearchParams(location.search).get(_searchParam);

    const { data: itemDetailData, status: itemDetailStatus } = useQuery({
      queryKey: [location.pathname, "detail"],
      queryFn: async () => {
        if (!pathMatch) {
          return null;
        }
        const itemId = pathMatch.params[pathMatchParam];
        if (!itemId) {
          return null;
        }

        let result: MovieDetails | TvShowDetails | null = null;
        if (type === "movie") {
          result = await getMovieDetails({ movieId: itemId });
        } else if (type === "tv-show") {
          result = await getTvShowDetails({ tvShowId: itemId });
        }

        if (!result) {
          throw new Error("Error while fetching the detail info.");
        }
        return result;
      },
      refetchOnWindowFocus: false,
      enabled: !!pathMatch,
      retry: false,
    });
    // console.log(movieDetailData);

    const imageMainPosterSrc = useMemo<string | undefined>(() => {
      if (location.state) {
        return location.state.image;
      }

      return !!itemDetailData?.poster_path
        ? getImageUrl({
            pathSegment: itemDetailData.poster_path,
            format: "w500",
          })
        : netflixInitialLogo;
    }, [location.state, itemDetailData?.poster_path]);

    const { data: imageMainPoster, status: imageMainPosterStatus } = useQuery({
      queryKey: ["preloadImage", imageMainPosterSrc],
      queryFn: async () => {
        if (!imageMainPosterSrc) {
          return null;
        }
        // return loadImage({
        //   src: imageMainPosterSrc,
        //   fallbackImage: netflixInitialLogo,
        // });

        // * React Query 버그인지는 모르겠는데
        // `queryFn`에서 `return imageComponent`는 가능하지만
        // `return {
        //   imageComponent
        // }`는 가끔씩 에러가 발생한다. (스크롤 빠르게 내릴 때)
        // Uncaught Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

        const { imageComponent } = await loadImage({
          src: imageMainPosterSrc,
          fallbackImage: netflixInitialLogo,
        });
        return imageComponent;
      },
      refetchOnWindowFocus: false,
      enabled: !!pathMatch,
    });

    const { data: itemsSimilarData } = useQuery({
      queryKey: [location.pathname, "similar"],
      queryFn: async () => {
        if (!pathMatch) {
          return null;
        }
        const itemId = pathMatch.params[pathMatchParam];
        if (!itemId) {
          return null;
        }

        let result: GetMoviesSimilarResult | GetTvShowsSimilarResult | null =
          null;
        if (type === "movie") {
          result = await getMoviesSimilar({ movieId: itemId });
        } else if (type === "tv-show") {
          result = await getTvShowsSimilar({ tvShowId: itemId });
        }

        if (!result) {
          throw new Error("Error while fetching the similar.");
        }
        return result;
      },
      refetchOnWindowFocus: false,
      enabled: !!pathMatch,
      retry: false,
    });

    const { data: itemsRecommendedData } = useQuery({
      queryKey: [location.pathname, "recommended"],
      queryFn: async () => {
        if (!pathMatch) {
          return null;
        }
        const itemId = pathMatch.params[pathMatchParam];
        if (!itemId) {
          return null;
        }

        let result:
          | GetMoviesRecommendedResult
          | GetTvShowsRecommendedResult
          | null = null;
        if (type === "movie") {
          result = await getMoviesRecommended({ movieId: itemId });
        } else if (type === "tv-show") {
          result = await getTvShowsRecommended({ tvShowId: itemId });
        }

        if (!result) {
          throw new Error("Error while fetching the similar.");
        }
        return result;
      },
      refetchOnWindowFocus: false,
      enabled: !!pathMatch,
      retry: false,
    });

    const moviesSimilarData =
      type === "movie" ? (itemsSimilarData as GetMoviesSimilarResult) : null;

    const moviesRecommendedData =
      type === "movie"
        ? (itemsRecommendedData as GetMoviesRecommendedResult)
        : null;

    const tvShowsSimilarData =
      type === "tv-show" ? (itemsSimilarData as GetTvShowsSimilarResult) : null;

    const tvShowsRecommendedData =
      type === "tv-show"
        ? (itemsRecommendedData as GetTvShowsRecommendedResult)
        : null;

    const { images: imagesMoviesSimilar, items: itemsMoviesSimilar } =
      usePreprocessData<ItemMovie>({ data: moviesSimilarData });

    const { images: imagesMoviesRecommended, items: itemsMoviesRecommended } =
      usePreprocessData<ItemMovie>({ data: moviesRecommendedData });

    const { images: imagesTvShowsSimilar, items: itemsTvShowsSimilar } =
      usePreprocessData<ItemTvShow>({
        data: tvShowsSimilarData,
        dataType: "tv-show",
      });

    const { images: imagesTvShowsRecommended, items: itemsTvShowsRecommended } =
      usePreprocessData<ItemTvShow>({
        data: tvShowsRecommendedData,
        dataType: "tv-show",
      });

    const navigate = useNavigate();

    const onOpenMovie = useCallback<OnOpenItem>(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ carouselId, itemId, title, image }) => {
        // console.log(image);

        navigate(`${BASE_PATH}/movies/${itemId}?${searchParam}=${carouselId}`, {
          state: {
            image,
          },
        });
      },
      [navigate, searchParam],
    );

    const onClickModalOverlay = useCallback(
      ({ itemId, title }: OnCloseItemParams) =>
        () => {
          _onClickModalOverlay?.({ itemId, title });
        },
      [_onClickModalOverlay],
    );

    const movieDetailData =
      type === "movie" ? (itemDetailData as MovieDetails) : null;
    const movieDetailStatus = type === "movie" ? itemDetailStatus : null;

    const tvShowDetailData =
      type === "tv-show" ? (itemDetailData as TvShowDetails) : null;
    const tvShowDetailStatus = type === "tv-show" ? itemDetailStatus : null;

    const collectionImageSrc = !!movieDetailData?.belongs_to_collection
      ?.poster_path
      ? getImageUrl({
          pathSegment: movieDetailData.belongs_to_collection.poster_path,
          format: "w500",
        })
      : !!movieDetailData?.belongs_to_collection?.backdrop_path
        ? getImageUrl({
            pathSegment: movieDetailData.belongs_to_collection.backdrop_path,
            format: "w500",
          })
        : netflixInitialLogo;

    return (
      <AnimatePresence>
        {pathMatch && (
          <>
            <ModalOverlay
              onClick={onClickModalOverlay({
                itemId: "123",
                title: "123",
                // carouselId: id,
                // itemId: selectedItem.id.toString(),
                // title: selectedItem.title,
              })}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            />
            <ModalContainer
              ref={ref}
              layoutId={
                !!searchParam
                  ? searchParam + (pathMatch.params[pathMatchParam] ?? "")
                  : (pathMatch.params[pathMatchParam] ?? "")
              }
            >
              <Modal>
                <ModalContent>
                  {(movieDetailStatus === "error" ||
                    tvShowDetailStatus === "error") && <Error404 />}
                  {(movieDetailStatus === "pending" ||
                    tvShowDetailStatus === "pending") && (
                    <Loader>
                      <ModalContentLoadIndicatorPlaceholder />
                    </Loader>
                  )}
                  {movieDetailStatus === "success" && (
                    <>
                      <ItemPoster>
                        {imageMainPosterStatus === "error" && (
                          <ErrorComponent />
                        )}
                        {imageMainPosterStatus === "pending" && (
                          <Loader>
                            <ItemPosterLoadIndicatorPlaceholder />
                          </Loader>
                        )}
                        {imageMainPosterStatus === "success" && imageMainPoster}
                      </ItemPoster>
                      {movieDetailData && (
                        <>
                          <ItemTitle>{movieDetailData.title}</ItemTitle>

                          <ItemDivider />

                          <ItemContent>
                            <ItemField>
                              <ItemLabel>Original Title</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {movieDetailData.original_title}
                              </ItemLabelContent>
                            </ItemField>

                            <ItemField>
                              <ItemLabel>Status</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {movieDetailData.status}
                              </ItemLabelContent>
                            </ItemField>

                            <ItemField>
                              <ItemLabel>Release Date</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {movieDetailData.release_date}
                              </ItemLabelContent>
                            </ItemField>

                            <ItemField>
                              <ItemLabel>Genres</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {movieDetailData.genres.map(
                                  (genre, index, genres) => {
                                    return (
                                      <span key={index}>
                                        {genre.name}
                                        {index !== genres.length - 1 && ", "}
                                      </span>
                                    );
                                  },
                                )}
                              </ItemLabelContent>
                            </ItemField>

                            <ItemField>
                              <ItemLabel>Runtime</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {movieDetailData.runtime}
                              </ItemLabelContent>
                            </ItemField>

                            <ItemField>
                              <ItemLabel>Popularity</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {movieDetailData.popularity}
                              </ItemLabelContent>
                            </ItemField>
                            <ItemField>
                              <ItemLabel>Vote Average</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {movieDetailData.vote_average}
                              </ItemLabelContent>
                            </ItemField>
                            <ItemField>
                              <ItemLabel>Vote Count</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {movieDetailData.vote_count}
                              </ItemLabelContent>
                            </ItemField>

                            <ItemField>
                              <ItemLabel>Budget</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {movieDetailData.budget === 0
                                  ? "Unknown"
                                  : movieDetailData.budget.toLocaleString(
                                      "en-US",
                                    )}{" "}
                                USD
                              </ItemLabelContent>
                            </ItemField>
                            <ItemField>
                              <ItemLabel>Revenue</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {movieDetailData.revenue === 0
                                  ? "Unknown"
                                  : movieDetailData.revenue.toLocaleString(
                                      "en-US",
                                    )}
                              </ItemLabelContent>
                              USD
                            </ItemField>

                            <ItemField>
                              <ItemLabel>Spoken Languages</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {movieDetailData.spoken_languages.length === 0
                                  ? "Unknown"
                                  : movieDetailData.spoken_languages.map(
                                      (language, index, languages) => {
                                        return (
                                          <React.Fragment key={index}>
                                            <span>{language.english_name}</span>{" "}
                                            {language.name &&
                                              language.name !== "English" && (
                                                <span>
                                                  &lt;{language.name}
                                                  &gt;
                                                </span>
                                              )}
                                            {index !== languages.length - 1 &&
                                              ", "}
                                          </React.Fragment>
                                        );
                                      },
                                    )}
                              </ItemLabelContent>
                            </ItemField>

                            {!!movieDetailData.tagline && (
                              <ItemField>
                                <ItemLabel>Tagline</ItemLabel>
                                {": "}
                                <ItemLabelContent>
                                  {movieDetailData.tagline}
                                </ItemLabelContent>
                              </ItemField>
                            )}

                            {!!movieDetailData.overview && (
                              <ItemField>
                                <ItemLabel>Overview</ItemLabel>
                                {": "}
                                <ItemLabelContent>
                                  {movieDetailData.overview}
                                </ItemLabelContent>
                              </ItemField>
                            )}

                            {!!movieDetailData.homepage && (
                              <ItemField>
                                <ItemLabel>Homepage</ItemLabel>
                                {": "}
                                <ItemLabelContent>
                                  <a
                                    href={movieDetailData.homepage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {movieDetailData.homepage.replace(
                                      /^https?:\/\//,
                                      "",
                                    )}
                                  </a>
                                </ItemLabelContent>
                              </ItemField>
                            )}

                            <ItemField>
                              <ItemLabel>Production Countries</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {movieDetailData.production_countries.length ===
                                0
                                  ? "Unknown"
                                  : movieDetailData.production_countries.map(
                                      (country, index, countries) => {
                                        return (
                                          <React.Fragment key={index}>
                                            <span>{country.name}</span>
                                            {index !== countries.length - 1 &&
                                              ", "}
                                          </React.Fragment>
                                        );
                                      },
                                    )}
                              </ItemLabelContent>
                            </ItemField>

                            {movieDetailData.production_companies.length ===
                            0 ? (
                              <ItemField>
                                <ItemLabel>Production Companies</ItemLabel>
                                {": "}
                                <ItemLabelContent>Unknown</ItemLabelContent>
                              </ItemField>
                            ) : (
                              <ItemFieldFlex>
                                <ItemLabel>Production Companies</ItemLabel>
                                <ItemLabelContentGrid>
                                  {movieDetailData.production_companies.map(
                                    (company, index) => {
                                      return (
                                        <div key={index}>
                                          {company.logo_path && (
                                            <ItemContentImage
                                              src={getImageUrl({
                                                pathSegment: company.logo_path,
                                                format: "w500",
                                              })}
                                            />
                                          )}
                                          <span>{company.name}</span>{" "}
                                          {!!company.origin_country && (
                                            <span>
                                              &lt;{company.origin_country}
                                              &gt;
                                            </span>
                                          )}
                                        </div>
                                      );
                                    },
                                  )}
                                </ItemLabelContentGrid>
                              </ItemFieldFlex>
                            )}

                            {movieDetailData.belongs_to_collection && (
                              <ItemFieldFlex>
                                <ItemLabel>Collection</ItemLabel>
                                <ItemLabelContentFlex>
                                  <ItemContentImage src={collectionImageSrc} />
                                  <span style={{ marginTop: 10 }}>
                                    {movieDetailData.belongs_to_collection.name}
                                  </span>
                                </ItemLabelContentFlex>
                              </ItemFieldFlex>
                            )}

                            <ItemFieldFlex>
                              <ItemLabel>Similar</ItemLabel>
                              <ItemLabelContentFlex>
                                <Carousel
                                  id="similar"
                                  items={itemsMoviesSimilar}
                                  images={imagesMoviesSimilar}
                                  onOpenItem={onOpenMovie}
                                />
                              </ItemLabelContentFlex>
                            </ItemFieldFlex>

                            <ItemFieldFlex>
                              <ItemLabel>Recommended</ItemLabel>
                              <ItemLabelContentFlex>
                                <Carousel
                                  id="recommended"
                                  items={itemsMoviesRecommended}
                                  images={imagesMoviesRecommended}
                                  onOpenItem={onOpenMovie}
                                />
                              </ItemLabelContentFlex>
                            </ItemFieldFlex>

                            <Padding />
                          </ItemContent>
                        </>
                      )}
                    </>
                  )}
                  {tvShowDetailStatus === "success" && (
                    <>
                      <ItemPoster>
                        {imageMainPosterStatus === "error" && (
                          <ErrorComponent />
                        )}
                        {imageMainPosterStatus === "pending" && (
                          <Loader>
                            <ItemPosterLoadIndicatorPlaceholder />
                          </Loader>
                        )}
                        {imageMainPosterStatus === "success" && imageMainPoster}
                      </ItemPoster>
                      {tvShowDetailData && (
                        <>
                          <ItemTitle>{tvShowDetailData.name}</ItemTitle>

                          <ItemDivider />

                          <ItemContent>
                            <ItemField>
                              <ItemLabel>Original Title</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {tvShowDetailData.original_name}
                              </ItemLabelContent>
                            </ItemField>

                            <ItemField>
                              <ItemLabel>Status</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {tvShowDetailData.status}
                              </ItemLabelContent>
                            </ItemField>

                            <ItemField>
                              <ItemLabel>In Production</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {tvShowDetailData.in_production ? "Yes" : "No"}
                              </ItemLabelContent>
                            </ItemField>

                            {!!tvShowDetailData.type && (
                              <ItemField>
                                <ItemLabel>Type</ItemLabel>
                                {": "}
                                <ItemLabelContent>
                                  {tvShowDetailData.type}
                                </ItemLabelContent>
                              </ItemField>
                            )}

                            <ItemField>
                              <ItemLabel>Created By</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {tvShowDetailData.created_by.map(
                                  (creator, index, genres) => {
                                    return (
                                      <span key={index}>
                                        {creator.name}
                                        {index !== genres.length - 1 && ", "}
                                      </span>
                                    );
                                  },
                                )}
                              </ItemLabelContent>
                            </ItemField>

                            {!!tvShowDetailData.first_air_date && (
                              <ItemField>
                                <ItemLabel>First Air Date</ItemLabel>
                                {": "}
                                <ItemLabelContent>
                                  {tvShowDetailData.first_air_date}
                                </ItemLabelContent>
                              </ItemField>
                            )}

                            {!!tvShowDetailData.last_air_date && (
                              <ItemField>
                                <ItemLabel>Last Air Date</ItemLabel>
                                {": "}
                                <ItemLabelContent>
                                  {tvShowDetailData.last_air_date}
                                </ItemLabelContent>
                              </ItemField>
                            )}

                            <ItemField>
                              <ItemLabel>Genres</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {tvShowDetailData.genres.map(
                                  (genre, index, genres) => {
                                    return (
                                      <span key={index}>
                                        {genre.name}
                                        {index !== genres.length - 1 && ", "}
                                      </span>
                                    );
                                  },
                                )}
                              </ItemLabelContent>
                            </ItemField>

                            <ItemField>
                              <ItemLabel>Number of Seasons</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {tvShowDetailData.number_of_seasons}
                              </ItemLabelContent>
                            </ItemField>

                            <ItemField>
                              <ItemLabel>Number of Episodes</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {tvShowDetailData.number_of_episodes}
                              </ItemLabelContent>
                            </ItemField>

                            <ItemField>
                              <ItemLabel>Popularity</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {tvShowDetailData.popularity}
                              </ItemLabelContent>
                            </ItemField>
                            <ItemField>
                              <ItemLabel>Vote Average</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {tvShowDetailData.vote_average}
                              </ItemLabelContent>
                            </ItemField>
                            <ItemField>
                              <ItemLabel>Vote Count</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {tvShowDetailData.vote_count}
                              </ItemLabelContent>
                            </ItemField>

                            <ItemField>
                              <ItemLabel>Spoken Languages</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {tvShowDetailData.spoken_languages.length === 0
                                  ? "Unknown"
                                  : tvShowDetailData.spoken_languages.map(
                                      (language, index, languages) => {
                                        return (
                                          <React.Fragment key={index}>
                                            <span>{language.english_name}</span>{" "}
                                            {language.name &&
                                              language.name !== "English" && (
                                                <span>
                                                  &lt;{language.name}
                                                  &gt;
                                                </span>
                                              )}
                                            {index !== languages.length - 1 &&
                                              ", "}
                                          </React.Fragment>
                                        );
                                      },
                                    )}
                              </ItemLabelContent>
                            </ItemField>

                            {!!tvShowDetailData.tagline && (
                              <ItemField>
                                <ItemLabel>Tagline</ItemLabel>
                                {": "}
                                <ItemLabelContent>
                                  {tvShowDetailData.tagline}
                                </ItemLabelContent>
                              </ItemField>
                            )}

                            {!!tvShowDetailData.overview && (
                              <ItemField>
                                <ItemLabel>Overview</ItemLabel>
                                {": "}
                                <ItemLabelContent>
                                  {tvShowDetailData.overview}
                                </ItemLabelContent>
                              </ItemField>
                            )}

                            {!!tvShowDetailData.homepage && (
                              <ItemField>
                                <ItemLabel>Homepage</ItemLabel>
                                {": "}
                                <ItemLabelContent>
                                  <a
                                    href={tvShowDetailData.homepage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {tvShowDetailData.homepage.replace(
                                      /^https?:\/\//,
                                      "",
                                    )}
                                  </a>
                                </ItemLabelContent>
                              </ItemField>
                            )}

                            {tvShowDetailData.networks.length === 0 ? (
                              <ItemField>
                                <ItemLabel>Networks</ItemLabel>
                                {": "}
                                <ItemLabelContent>Unknown</ItemLabelContent>
                              </ItemField>
                            ) : (
                              <ItemFieldFlex>
                                <ItemLabel>Networks</ItemLabel>
                                <ItemLabelContentGrid>
                                  {tvShowDetailData.networks.map(
                                    (network, index) => {
                                      return (
                                        <div key={index}>
                                          {network.logo_path && (
                                            <ItemContentImage
                                              src={getImageUrl({
                                                pathSegment: network.logo_path,
                                                format: "w500",
                                              })}
                                            />
                                          )}
                                          <span>{network.name}</span>{" "}
                                          {!!network.origin_country && (
                                            <span>
                                              &lt;{network.origin_country}
                                              &gt;
                                            </span>
                                          )}
                                        </div>
                                      );
                                    },
                                  )}
                                </ItemLabelContentGrid>
                              </ItemFieldFlex>
                            )}

                            <ItemField>
                              <ItemLabel>Production Countries</ItemLabel>
                              {": "}
                              <ItemLabelContent>
                                {tvShowDetailData.production_countries
                                  .length === 0
                                  ? "Unknown"
                                  : tvShowDetailData.production_countries.map(
                                      (country, index, countries) => {
                                        return (
                                          <React.Fragment key={index}>
                                            <span>{country.name}</span>
                                            {index !== countries.length - 1 &&
                                              ", "}
                                          </React.Fragment>
                                        );
                                      },
                                    )}
                              </ItemLabelContent>
                            </ItemField>

                            {tvShowDetailData.production_companies.length ===
                            0 ? (
                              <ItemField>
                                <ItemLabel>Production Companies</ItemLabel>
                                {": "}
                                <ItemLabelContent>Unknown</ItemLabelContent>
                              </ItemField>
                            ) : (
                              <ItemFieldFlex>
                                <ItemLabel>Production Companies</ItemLabel>
                                <ItemLabelContentGrid>
                                  {tvShowDetailData.production_companies.map(
                                    (company, index) => {
                                      return (
                                        <div key={index}>
                                          {company.logo_path && (
                                            <ItemContentImage
                                              src={getImageUrl({
                                                pathSegment: company.logo_path,
                                                format: "w500",
                                              })}
                                            />
                                          )}
                                          <span>{company.name}</span>{" "}
                                          {!!company.origin_country && (
                                            <span>
                                              &lt;{company.origin_country}
                                              &gt;
                                            </span>
                                          )}
                                        </div>
                                      );
                                    },
                                  )}
                                </ItemLabelContentGrid>
                              </ItemFieldFlex>
                            )}

                            <ItemFieldFlex>
                              <ItemLabel>Similar</ItemLabel>
                              <ItemLabelContentFlex>
                                <Carousel
                                  id="similar"
                                  items={itemsTvShowsSimilar}
                                  images={imagesTvShowsSimilar}
                                  onOpenItem={onOpenMovie}
                                />
                              </ItemLabelContentFlex>
                            </ItemFieldFlex>

                            <ItemFieldFlex>
                              <ItemLabel>Recommended</ItemLabel>
                              <ItemLabelContentFlex>
                                <Carousel
                                  id="recommended"
                                  items={itemsTvShowsRecommended}
                                  images={imagesTvShowsRecommended}
                                  onOpenItem={onOpenMovie}
                                />
                              </ItemLabelContentFlex>
                            </ItemFieldFlex>

                            <Padding />
                          </ItemContent>
                        </>
                      )}
                    </>
                  )}
                </ModalContent>
              </Modal>
            </ModalContainer>
          </>
        )}
      </AnimatePresence>
    );
  },
});
