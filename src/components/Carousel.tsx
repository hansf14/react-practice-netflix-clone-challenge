import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMatch } from "react-router-dom";
import { AnimatePresence, motion, useAnimation, Variants } from "motion/react";
import { useMedia } from "react-use";
import { css, styled } from "styled-components";
import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import { StyledComponentProps } from "@/utils";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";

const CarouselBase = styled.div`
  width: 100%;
  container-name: carousel-base;
  container-type: inline-size;

  display: flex;
  flex-direction: column;
`;

const CarouselRows = styled(motion.div)`
  display: flex;
  width: fit-content;
`;

export type RowProps = {
  itemCntPerRow: number;
};

const CarouselRow = styled.div`
  flex: 0 0 auto;
  width: 80cqw;
  margin: 0 10cqw;
  @media (max-width: 1000px) {
    & {
      width: 100cqw;
      margin: 0;
    }
  }
`;

const CarouselRowContent = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !["itemCntPerRow"].includes(prop),
})<RowProps>`
  transform-style: preserve-3d;
  width: 100%;

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

const CarouselItemBox = styled(motion.div)`
  transform-style: preserve-3d;
  position: relative;
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

const cssCarouselItemPosterImage = css`
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  height: 100%;
`;

const CarouselItemPoster = styled.div`
  z-index: 100;
  transform: translateZ(5px);
  aspect-ratio: 2 / 3; // Prevent subpixel problem by setting the aspect ratio to the image intrinsic dimension.

  display: flex;
  align-items: center;

  img {
    ${cssCarouselItemPosterImage}
  }
`;

const CarouselItemTooltipOverflowParentGuard = styled.div`
  clip-path: inset(0px 0px -100vh 0px);
`;

const CarouselItemTooltip = styled(motion.div)`
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

const CarouselItemTooltipTitle = styled.h3`
  text-align: center;

  font-size: 14px;
  @media (max-width: 500px) {
    & {
      font-size: 12px;
    }
  }
`;

const CarouselControllers = styled.div`
  margin: 15px auto;

  display: flex;
  align-items: center;
  gap: 15px;
`;

const CarouselControllerPrev = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 25px;
`;

const CarouselControllerNext = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 25px;
`;

export type CarouselControllerNumberProps = {
  isActive: boolean;
};

const CarouselControllerNumber = styled.div<CarouselControllerNumberProps>`
  font-size: 25px;
  ${({ isActive }) =>
    isActive
      ? `
      color: #ffd700; // #1677ff;
      font-weight: bold;
    `
      : "cursor: pointer;"}
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

const SelectedItemPoster = styled.div`
  width: 50%;
  aspect-ratio: 2 / 3;
  margin: 10px;
  display: flex;
  justify-content: center;

  img {
    ${cssCarouselItemPosterImage}
    object-fit: contain;
  }
`;

const SelectedItemTitle = styled.h2`
  font-size: 36px;
  text-align: center;
`;

const rowContentVariants: Variants = {
  initial: { x: 0 },
};

const itemBoxVariants: Variants = {
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

const itemTooltipVariants: Variants = {
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

export type CarouselItem = {
  id: string;
  title: string;
};

export type CarouselImage = React.ReactNode;

export type OnOpenItem = ({ id, title }: CarouselItem) => void;

export type OnCloseItem = ({ id, title }: CarouselItem) => void;

export type CarouselProps = {
  items: CarouselItem[];
  images: CarouselImage[];
  pathMatchPattern: string;
  pathMatchParam: string;
  onOpenItem?: OnOpenItem;
  onCloseItem?: OnCloseItem;
} & StyledComponentProps<"div">;

export const Carousel = withMemoAndRef<"div", HTMLDivElement, CarouselProps>({
  displayName: "Carousel",
  Component: (
    {
      items,
      images,
      pathMatchPattern,
      pathMatchParam,
      onOpenItem,
      onCloseItem,
      ...otherProps
    },
    ref,
  ) => {
    const refBase = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => {
      return refBase.current as HTMLDivElement;
    });

    const isSmallerEqual600px = useMedia("(max-width: 600px)");
    const totalCntItem = items.length;

    const itemCntPerRow = isSmallerEqual600px ? 4 : 5;
    const maxRowIndex = Math.ceil(totalCntItem / itemCntPerRow) - 1;
    const [stateCurrentRowIndex, setStateCurrentRowIndex] = useState<number>(0);

    const rowContentAnimation = useAnimation();

    const increaseCurrentRowIndex = useCallback(() => {
      const nextRowIndex =
        stateCurrentRowIndex >= maxRowIndex ? 0 : stateCurrentRowIndex + 1;

      rowContentAnimation.start({
        x: -nextRowIndex * document.documentElement.clientWidth,
        transition: {
          ease: "easeInOut",
          duration: 0.5,
        },
      });
      setStateCurrentRowIndex(nextRowIndex);
    }, [stateCurrentRowIndex, rowContentAnimation, maxRowIndex]);

    const decreaseCurrentRowIndex = useCallback(() => {
      const prevRowIndex =
        stateCurrentRowIndex <= 0 ? maxRowIndex : stateCurrentRowIndex - 1;

      rowContentAnimation.start({
        x: -prevRowIndex * document.documentElement.clientWidth,
        transition: {
          ease: "easeInOut",
          duration: 0.5,
        },
      });
      setStateCurrentRowIndex(prevRowIndex);
    }, [stateCurrentRowIndex, rowContentAnimation, maxRowIndex]);

    const changeCurrentRowIndexTo = useCallback(
      ({
        indexTo,
        animationDuration = 0.5,
      }: {
        indexTo: number;
        animationDuration?: number;
      }) =>
        () => {
          console.log(indexTo, maxRowIndex);

          if (
            indexTo === stateCurrentRowIndex ||
            indexTo < 0 ||
            indexTo > maxRowIndex
          ) {
            return;
          }

          console.log("DOH");

          rowContentAnimation.start({
            x: -indexTo * document.documentElement.clientWidth,
            transition: {
              ease: "easeInOut",
              duration: animationDuration,
            },
          });
          setStateCurrentRowIndex(indexTo);
        },
      [stateCurrentRowIndex, rowContentAnimation, maxRowIndex],
    );

    // * Max row index edge case handling
    // When resize happens at small screen to big screen and the max index gets changed from 4 to 3 because the images per row gets changed.
    useEffect(() => {
      if (stateCurrentRowIndex > maxRowIndex) {
        console.log("stateCurrentRowIndex:", stateCurrentRowIndex);
        console.log("maxRowIndex:", maxRowIndex);

        changeCurrentRowIndexTo({
          indexTo: maxRowIndex,
          animationDuration: 0,
        })();
      }
    }, [stateCurrentRowIndex, maxRowIndex, changeCurrentRowIndexTo]);

    const windowResizeHandler = useCallback(() => {
      console.log(stateCurrentRowIndex);
      rowContentAnimation.start({
        x: -stateCurrentRowIndex * document.documentElement.clientWidth,
        transition: {
          duration: 0,
        },
      });
    }, [stateCurrentRowIndex, rowContentAnimation]);

    useEffect(() => {
      window.addEventListener("resize", windowResizeHandler);
      return () => {
        window.removeEventListener("resize", windowResizeHandler);
      };
    }, [windowResizeHandler]);

    const onClickItem = useCallback(
      ({ id, title }: CarouselItem) => {
        onOpenItem?.({ id, title });
      },
      [onOpenItem],
    );

    const onClickModalOverlay = useCallback(
      ({ id, title }: CarouselItem) => {
        onCloseItem?.({ id, title });
      },
      [onCloseItem],
    );

    const pathMatch = useMatch(pathMatchPattern);

    const selectedItemIndex = useMemo(
      () =>
        pathMatch && pathMatch.params[pathMatchParam]
          ? (items.findIndex(
              (item) => item.id.toString() === pathMatch.params[pathMatchParam],
            ) ?? -1)
          : -1,
      [items, pathMatch, pathMatchParam],
    );

    const selectedItem =
      selectedItemIndex === -1 ? null : items[selectedItemIndex];

    const [stateSelectedItemImage, setStateSelectedItemImage] =
      useState<React.ReactNode>(null);

    useEffect(() => {
      if (selectedItemIndex !== -1) {
        setStateSelectedItemImage(images[selectedItemIndex]);
      }
    }, [selectedItemIndex, images]);

    return (
      <>
        <CarouselBase ref={refBase} {...otherProps}>
          <CarouselRows
            variants={rowContentVariants}
            initial="initial"
            animate={rowContentAnimation}
          >
            {Array.from({ length: maxRowIndex + 1 }, (_, rowIndex) => {
              return (
                <CarouselRow>
                  <CarouselRowContent
                    key={rowIndex}
                    itemCntPerRow={itemCntPerRow}
                  >
                    {items
                      .slice(
                        itemCntPerRow * rowIndex,
                        itemCntPerRow * (rowIndex + 1),
                      )
                      .map((item, index) => {
                        const itemIndex = itemCntPerRow * rowIndex + index;

                        return (
                          <CarouselItemBox
                            key={item.id}
                            layoutId={item.id.toString()}
                            variants={itemBoxVariants}
                            initial="initial"
                            whileHover="hover"
                            transition={{
                              type: "tween",
                            }}
                            onClick={() =>
                              onClickItem({
                                id: item.id.toString(),
                                title: item.title,
                              })
                            }
                          >
                            <CarouselItemPoster>
                              {images[itemIndex]}
                            </CarouselItemPoster>
                            <CarouselItemTooltipOverflowParentGuard>
                              <CarouselItemTooltip
                                variants={itemTooltipVariants}
                                transition={{
                                  type: "tween",
                                }}
                              >
                                <CarouselItemTooltipTitle>
                                  {item.title}
                                </CarouselItemTooltipTitle>
                              </CarouselItemTooltip>
                            </CarouselItemTooltipOverflowParentGuard>
                          </CarouselItemBox>
                        );
                      })}
                  </CarouselRowContent>
                </CarouselRow>
              );
            })}
          </CarouselRows>
          <CarouselControllers>
            <CarouselControllerPrev onClick={decreaseCurrentRowIndex}>
              <CaretLeftFill />
            </CarouselControllerPrev>
            {Array.from({ length: maxRowIndex + 1 }, (_, index) => {
              const isActive = index === stateCurrentRowIndex;
              return (
                <CarouselControllerNumber
                  isActive={isActive}
                  onClick={changeCurrentRowIndexTo({ indexTo: index })}
                >
                  {index + 1}
                </CarouselControllerNumber>
              );
            })}
            <CarouselControllerNext onClick={increaseCurrentRowIndex}>
              <CaretRightFill />
            </CarouselControllerNext>
          </CarouselControllers>
        </CarouselBase>
        <AnimatePresence>
          {pathMatch && selectedItem && (
            <>
              <ModalOverlay
                onClick={() =>
                  onClickModalOverlay({
                    id: selectedItem.id.toString(),
                    title: selectedItem.title,
                  })
                }
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
              />
              <ModalContent layoutId={pathMatch.params[pathMatchParam]}>
                {selectedItem && (
                  <>
                    <SelectedItemPoster>
                      {stateSelectedItemImage}
                    </SelectedItemPoster>
                    <SelectedItemTitle>{selectedItem.title}</SelectedItemTitle>
                  </>
                )}
              </ModalContent>
            </>
          )}
        </AnimatePresence>
      </>
    );
  },
});
