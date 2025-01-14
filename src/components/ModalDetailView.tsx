import { AnimatePresence, motion } from "motion/react";
import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import { styled } from "styled-components";
import parse from "html-react-parser";
import {
  cssCarouselItemPosterImage,
  OnOpenItemParams,
} from "@/components/Carousel";
import { useLocation, useMatch } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { preloadImage, StyledComponentProps } from "@/utils";
import { getImageUrl, getMovieDetails } from "@/api";
import { useCallback, useMemo } from "react";
import netflixInitialLogo from "@/assets/netflix-initial-logo.png";
import { queryClient } from "@/queryClient";

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

const SelectedItemPoster = styled.div`
  float: left;
  aspect-ratio: 2 / 3;
  max-width: 40cqw;

  display: flex;
  justify-content: center;

  // border: 1px solid #fff;
  // border-radius: 10px;
  overflow: hidden;

  img {
    ${cssCarouselItemPosterImage}
    object-fit: contain;
  }
`;

const SelectedItemTitle = styled.h2`
  overflow: hidden; // for BFC (block formatting context)(take remaining space)

  font-size: 28px;
  text-align: center;

  padding: 10px 15px 10px 25px;
`;

export type OnCloseItemParams = {
  itemId: string;
  title: string;
};

export type OnCloseItem = ({ itemId, title }: OnCloseItemParams) => void;

export type ModalDetailViewProps = {
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
      pathMatchPattern,
      pathMatchParam,
      searchParam: _searchParam,
      onClickModalOverlay: _onClickModalOverlay,
    },
    ref,
  ) => {
    const pathMatch = useMatch(pathMatchPattern);
    const location = useLocation();
    console.log(location);

    const searchParam = new URLSearchParams(location.search).get(_searchParam);

    const { data: movieDetailData } = useQuery({
      queryKey: [location.pathname],
      queryFn: () => {
        if (!pathMatch) {
          return null;
        }
        const movieId = pathMatch.params[pathMatchParam];
        if (!movieId) {
          return null;
        }
        return getMovieDetails({ movieId });
      },
      refetchOnWindowFocus: false,
      enabled: !!pathMatch,
    });
    // console.log(movieDetailData);

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

    console.log(["preloadImage", imageSrcForPreload]);
    const { data: imageComponent } = useQuery({
      queryKey: ["preloadImage", imageSrcForPreload],
      queryFn: () => {
        return loadImage();
      },
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      enabled: !!pathMatch,
    });

    // const selectedItemIndex = useMemo(
    //   () =>
    //     pathMatch && pathMatch.params[pathMatchParam]
    //       ? (items.findIndex(
    //           (item) => item.id.toString() === pathMatch.params[pathMatchParam],
    //         ) ?? -1)
    //       : -1,
    //   [items, pathMatch, pathMatchParam],
    // );

    // const selectedItem =
    //   selectedItemIndex === -1 ? null : items[selectedItemIndex];

    // const [stateSelectedItemImage, setStateSelectedItemImage] =
    //   useState<React.ReactNode>(null);

    // const imageComponent = imageComponentObjs[selectedItemIndex]?.data;
    // useEffect(() => {
    //   if (selectedItemIndex !== -1) {
    //     setStateSelectedItemImage(imageComponent ?? null);
    //   }
    // }, [selectedItemIndex, imageComponentObjs, imageComponent]);
    // imageComponentObjs[selectedItemIndex]?.data
    // ㄴ React Hook useEffect has a complex expression in the dependency array. Extract it to a separate variable so it can be statically checked.

    const onClickModalOverlay = useCallback(
      ({ itemId, title }: OnCloseItemParams) =>
        () => {
          _onClickModalOverlay?.({ itemId, title });
        },
      [_onClickModalOverlay],
    );

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
                  <SelectedItemPoster>{imageComponent}</SelectedItemPoster>
                  <SelectedItemTitle>
                    Hello
                    {/* {selectedItem.title} */}
                  </SelectedItemTitle>
                </ModalContent>
              </Modal>
            </ModalContainer>
          </>
        )}
      </AnimatePresence>
    );
  },
});
