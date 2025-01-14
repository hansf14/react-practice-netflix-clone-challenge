import { AnimatePresence, motion } from "motion/react";
import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import { css, styled } from "styled-components";
import parse from "html-react-parser";
import { cssItemPosterImage } from "@/components/Carousel";
import { useLocation, useMatch } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { preloadImage, StyledComponentProps } from "@/utils";
import { getImageUrl, getMovieDetails } from "@/api";
import React, { useCallback, useMemo } from "react";
import netflixInitialLogo from "@/assets/netflix-initial-logo.png";

const ModalOverlay = styled(motion.div)`
  z-index: 9999;
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;

  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const ModalContainer = styled(motion.div)`
  z-index: 10000;
  position: fixed;

  width: clamp(280px, 80%, 1000px);
  height: 80vh;

  container-name: modal-container;
  container-type: size;

  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;

  border-radius: 10px;
  background-color: #010101;
  border: 1px solid #fff;
  box-shadow: 0 8px 32px 0 rgba(255, 255, 255, 0.37);
  padding: 10px;
`;

const Modal = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  overscroll-behavior: none;

  &::after {
    content: "";
    display: table;
    clear: both;
  }
`;

const ModalContent = styled.div``;

const ItemPoster = styled.div`
  float: left;
  aspect-ratio: 2 / 3;
  max-width: 40cqw;

  display: flex;
  justify-content: center;

  // border: 1px solid #fff;
  // border-radius: 10px;
  overflow: hidden;

  img {
    ${cssItemPosterImage}
    object-fit: contain;
  }
`;

const ItemTitle = styled.h2`
  overflow: hidden; // for BFC (block formatting context)(take remaining space)

  font-size: 28px;
  font-weight: bold;
  text-align: center;

  padding: 20px 15px 25px 25px;
`;

const cssItemField = css`
  overflow: hidden;
  padding: 0 15px 0 15px;
  font-size: 16px;
  line-height: 1.2;

  &:not(last-child) {
    margin-bottom: 2px;
  }
`;

const ItemField = styled.div`
  ${cssItemField}
`;

const ItemFieldFlex = styled.div`
  ${cssItemField}
  display: flex;
`;

const ItemLabel = styled.span`
  font-weight: bold;
  float: left;
  white-space: nowrap;
`;

const ItemLabelContent = styled.p`
  display: inline;
  white-space: pre-wrap;
`;

const ItemLabelContentFlex = styled.p`
  display: flex;
  flex-direction: column;
  white-space: pre-wrap;
  justify-content: center;
`;

const ItemContentImage = styled.img`
  background-color: #fff;
  ${cssItemPosterImage}
  object-fit: contain;
  width: 100px;
  height: unset;
  display: inline-block;
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

    const { data: movieDetailData } = useQuery({
      queryKey: [location.pathname],
      queryFn: () => {
        if (!pathMatch) {
          return null;
        }
        const itemId = pathMatch.params[pathMatchParam];
        if (!itemId) {
          return null;
        }

        if (type === "movie") {
          return getMovieDetails({ movieId: itemId });
        } else if (type === "tv-show") {
          return null;
        }
        return null;
      },
      refetchOnWindowFocus: false,
      enabled: !!pathMatch,
    });
    console.log(movieDetailData);

    const imageSrcForPreload = useMemo(() => {
      if (location.state) {
        return location.state.image;
      }

      return !!movieDetailData?.poster_path
        ? getImageUrl({
            pathSegment: movieDetailData.poster_path,
            format: "w500",
          })
        : netflixInitialLogo;
    }, [location.state, movieDetailData?.poster_path]);

    const loadImage = useCallback(async () => {
      const preloadedImageElement = await preloadImage({
        src: imageSrcForPreload,
      });

      const preloadedImageComponent = preloadedImageElement?.outerHTML ? (
        parse(preloadedImageElement?.outerHTML)
      ) : (
        <img src={netflixInitialLogo} /> // Fallback
      );
      return preloadedImageComponent as React.JSX.Element;
    }, [imageSrcForPreload]);

    // console.log(["preloadImage", imageSrcForPreload]);
    const { data: imageComponent } = useQuery({
      queryKey: ["preloadImage", imageSrcForPreload],
      queryFn: () => {
        return loadImage();
      },
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      enabled: !!pathMatch,
    });

    const onClickModalOverlay = useCallback(
      ({ itemId, title }: OnCloseItemParams) =>
        () => {
          _onClickModalOverlay?.({ itemId, title });
        },
      [_onClickModalOverlay],
    );

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
                  ? searchParam + pathMatch.params[pathMatchParam]
                  : pathMatch.params[pathMatchParam]
              }
            >
              <Modal>
                <ModalContent>
                  <ItemPoster>{imageComponent}</ItemPoster>
                  {movieDetailData && (
                    <>
                      <ItemTitle>{movieDetailData.title}</ItemTitle>
                      {type === "movie" && (
                        <>
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
                              {movieDetailData.budget.toLocaleString("en-US")}{" "}
                              USD
                            </ItemLabelContent>
                          </ItemField>
                          <ItemField>
                            <ItemLabel>Revenue</ItemLabel>
                            {": "}
                            <ItemLabelContent>
                              {movieDetailData.revenue.toLocaleString("en-US")}
                            </ItemLabelContent>
                            USD
                          </ItemField>

                          <ItemField>
                            <ItemLabel>Spoken Languages</ItemLabel>
                            {": "}
                            <ItemLabelContent>
                              {movieDetailData.spoken_languages.map(
                                (language, index, languages) => {
                                  return (
                                    <React.Fragment key={index}>
                                      <span>{language.english_name}</span>
                                      {language.name &&
                                        language.name !== "English" && (
                                          <>
                                            {" "}
                                            <span>
                                              &lt;{language.name}
                                              &gt;
                                            </span>
                                          </>
                                        )}
                                      {index !== languages.length - 1 && ", "}
                                    </React.Fragment>
                                  );
                                },
                              )}
                            </ItemLabelContent>
                          </ItemField>

                          <ItemField>
                            <ItemLabel>Tagline</ItemLabel>
                            {": "}
                            <ItemLabelContent>
                              {movieDetailData.tagline}
                            </ItemLabelContent>
                          </ItemField>
                          <ItemField>
                            <ItemLabel>Overview</ItemLabel>
                            {": "}
                            <ItemLabelContent>
                              {movieDetailData.overview}
                            </ItemLabelContent>
                          </ItemField>

                          <ItemField>
                            <ItemLabel>Homepage</ItemLabel>
                            {": "}
                            <ItemLabelContent>
                              <a href={movieDetailData.homepage}>
                                {movieDetailData.homepage.replace(
                                  /^https?:\/\//,
                                  "",
                                )}
                              </a>
                            </ItemLabelContent>
                          </ItemField>

                          <ItemField>
                            <ItemLabel>Production Countries</ItemLabel>
                            {": "}
                            <ItemLabelContent>
                              {movieDetailData.production_countries.map(
                                (country, index, countries) => {
                                  return (
                                    <React.Fragment key={index}>
                                      <span>{country.name}</span>
                                      {index !== countries.length - 1 && ", "}
                                    </React.Fragment>
                                  );
                                },
                              )}
                            </ItemLabelContent>
                          </ItemField>

                          <ItemFieldFlex>
                            <ItemLabel>Production Companies</ItemLabel>
                            <ItemLabelContentFlex>
                              {movieDetailData.production_companies.map(
                                (company, index) => {
                                  return (
                                    <React.Fragment key={index}>
                                      {company.logo_path && (
                                        <ItemContentImage
                                          src={getImageUrl({
                                            pathSegment: company.logo_path,
                                            format: "w500",
                                          })}
                                        />
                                      )}
                                      <span>{company.name}</span>
                                      <>
                                        {" "}
                                        <span>
                                          &lt;{company.origin_country}
                                          &gt;
                                        </span>
                                      </>
                                    </React.Fragment>
                                  );
                                },
                              )}
                            </ItemLabelContentFlex>
                          </ItemFieldFlex>

                          {movieDetailData.belongs_to_collection && (
                            <ItemFieldFlex>
                              <ItemLabel>Collection</ItemLabel>
                              <ItemLabelContentFlex>
                                <ItemContentImage src={collectionImageSrc} />
                                {movieDetailData.belongs_to_collection.name}
                              </ItemLabelContentFlex>
                            </ItemFieldFlex>
                          )}
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
