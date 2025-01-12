import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useMatch } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  MotionProps,
  useAnimation,
  Variants,
} from "motion/react";
import { useMedia } from "react-use";
import { css, styled } from "styled-components";
import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import { StyledComponentProps } from "@/utils";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import { useResizeObserver } from "usehooks-ts";
import { throttle } from "lodash-es";

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

  gap: 10px;
  @media (max-width: 600px) {
    & {
      gap: 0;
    }
  }
`;

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

export type CarouselRowContentProps = {
  itemCntPerRow: number;
};

const CarouselRowContent = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !["itemCntPerRow"].includes(prop),
})<CarouselRowContentProps>`
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
  // z-index: 100;
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
  // z-index: 10;
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
  z-index: 10000;
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
  z-index: 9999;
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
    // zIndex: 10,
    y: -10,
    transition: {
      ease: "linear",
      delay: 0.5,
      duration: 0.3,
    },
  },
};

const itemTooltipVariants: Variants = {
  hover: {
    opacity: 1,
    y: "calc(100% - 1px)", // prevent subpixel: 1px
    transition: {
      ease: "linear",
      delay: 0.5,
      duration: 0.3,
    },
  },
};

type Size = {
  width?: number;
  height?: number;
};

export type CarouselItem = {
  id: string;
  title: string;
};

export type CarouselImage = React.ReactNode;

export type OnOpenItemParams = {
  id: string;
  movieId: string;
  title: string;
};

export interface OnCloseItemParams extends OnOpenItemParams {}

export type OnOpenItem = ({ id, movieId, title }: OnOpenItemParams) => void;

export type OnCloseItem = ({ id, movieId, title }: OnCloseItemParams) => void;

export type CarouselProps = {
  id: string;
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
      id,
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

    const refCarouselItemBoxes = useRef<(HTMLDivElement | null)[]>([]);

    const isSmallerEqual600px = useMedia("(max-width: 600px)");
    const totalCntItem = items.length;
    const defaultAnimationDuration = 1;
    const gap = !isSmallerEqual600px ? 10 : 0;

    const itemCntPerRow = isSmallerEqual600px ? 4 : 5;
    const maxRowIndex = Math.ceil(totalCntItem / itemCntPerRow) - 1;
    const [stateCurrentRowIndex, setStateCurrentRowIndex] = useState<number>(0);

    const rowsAnimation = useAnimation();
    const rowContentAnimation = useAnimation();

    const refSize = useRef<Size>({ width: undefined, height: undefined });
    const onResize = useMemo(
      () =>
        throttle(
          ({ width, height }: Size) => {
            refSize.current = { width, height };
          },
          100,
          { leading: true },
        ),
      [],
    );

    useResizeObserver({
      ref: refBase,
      box: "border-box",
      onResize,
    });

    const increaseCurrentRowIndex = useCallback(async () => {
      const nextRowIndex =
        stateCurrentRowIndex >= maxRowIndex ? 0 : stateCurrentRowIndex + 1;

      if (refSize.current.width) {
        await rowsAnimation.start({
          x:
            -nextRowIndex * refSize.current.width +
            (nextRowIndex > 0 ? -nextRowIndex * gap : 0),
          transition: {
            ease: "easeInOut",
            duration: defaultAnimationDuration,
          },
        });

        // Snap to origin (go back to default position) after the rowsAnimation ends (slide animation)
        await rowContentAnimation.start({
          x: 0,
          transition: {
            ease: "linear",
            duration: 0,
          },
        });
      }
      setStateCurrentRowIndex(nextRowIndex);
    }, [
      gap,
      stateCurrentRowIndex,
      rowsAnimation,
      rowContentAnimation,
      maxRowIndex,
    ]);

    const decreaseCurrentRowIndex = useCallback(async () => {
      const prevRowIndex =
        stateCurrentRowIndex <= 0 ? maxRowIndex : stateCurrentRowIndex - 1;

      if (refSize.current.width) {
        await rowsAnimation.start({
          x:
            -prevRowIndex * refSize.current.width +
            (prevRowIndex > 0 ? -prevRowIndex * gap : 0),
          transition: {
            ease: "easeInOut",
            duration: defaultAnimationDuration,
          },
        });

        await rowContentAnimation.start({
          x: 0,
          transition: {
            ease: "linear",
            duration: 0,
          },
        });
      }
      setStateCurrentRowIndex(prevRowIndex);
    }, [
      gap,
      stateCurrentRowIndex,
      rowsAnimation,
      rowContentAnimation,
      maxRowIndex,
    ]);

    const changeCurrentRowIndexTo = useCallback(
      ({
        indexTo,
        animationDuration = defaultAnimationDuration,
      }: {
        indexTo: number;
        animationDuration?: number;
      }) =>
        async () => {
          if (
            indexTo === stateCurrentRowIndex ||
            indexTo < 0 ||
            indexTo > maxRowIndex
          ) {
            return;
          }

          if (refSize.current.width) {
            await rowsAnimation.start({
              x:
                -indexTo * refSize.current.width +
                (indexTo > 0 ? -indexTo * gap : 0),
              transition: {
                ease: "easeInOut",
                duration: animationDuration,
              },
            });

            await rowContentAnimation.start({
              x: 0,
              transition: {
                ease: "linear",
                duration: 0,
              },
            });
          }
          setStateCurrentRowIndex(indexTo);
        },
      [
        gap,
        stateCurrentRowIndex,
        rowsAnimation,
        rowContentAnimation,
        maxRowIndex,
      ],
    );

    // * Max row index edge case handling
    // When resize happens at small screen to big screen and the max index gets changed from 4 to 3 because the images per row gets changed.
    useEffect(() => {
      if (stateCurrentRowIndex > maxRowIndex) {
        // console.log("stateCurrentRowIndex:", stateCurrentRowIndex);
        // console.log("maxRowIndex:", maxRowIndex);

        changeCurrentRowIndexTo({
          indexTo: maxRowIndex,
          animationDuration: 0,
        })();
      }
    }, [stateCurrentRowIndex, maxRowIndex, changeCurrentRowIndexTo]);

    const windowResizeHandler = useCallback(() => {
      console.log(stateCurrentRowIndex);
      if (refSize.current.width) {
        rowsAnimation.start({
          x:
            -stateCurrentRowIndex * refSize.current.width +
            (stateCurrentRowIndex > 0 ? -stateCurrentRowIndex * gap : 0),
          transition: {
            duration: 0,
          },
        });
      }
    }, [gap, stateCurrentRowIndex, rowsAnimation]);

    useEffect(() => {
      window.addEventListener("resize", windowResizeHandler);
      return () => {
        window.removeEventListener("resize", windowResizeHandler);
      };
    }, [windowResizeHandler]);

    const onClickItem = useCallback(
      ({ id, movieId, title }: OnOpenItemParams) =>
        () => {
          onOpenItem?.({ id, movieId, title });
        },
      [onOpenItem],
    );

    const onClickModalOverlay = useCallback(
      ({ id, movieId, title }: OnCloseItemParams) =>
        () => {
          onCloseItem?.({ id, movieId, title });
        },
      [onCloseItem],
    );

    const pathMatch = useMatch(pathMatchPattern);
    const location = useLocation();
    const list = new URLSearchParams(location.search).get("list");
    // console.log(list);

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

    const onLayoutAnimationToModal = useCallback(
      ({ index }: { index: number }) =>
        () => {
          if (!refCarouselItemBoxes.current?.[index]) {
            return;
          }
          refCarouselItemBoxes.current[index].style.translate = "0 0 100px";
        },
      [],
    );

    const onLayoutAnimationFromModal = useCallback(
      ({ index }: { index: number }) =>
        () => {
          if (!refCarouselItemBoxes.current?.[index]) {
            return;
          }
          refCarouselItemBoxes.current[index].style.translate = "";
        },
      [],
    );

    const [stateIsDragging, setStateIsDragging] = useState<boolean>(false);

    const swipePower = useCallback(
      ({ offset, velocity }: { offset: number; velocity: number }) => {
        return Math.abs(offset) * velocity;
      },
      [],
    );

    // // https://codesandbox.io/p/sandbox/framer-motion-image-gallery-pqvx3?file=%2Fsrc%2FExample.tsx%3A71%2C21&from-embed
    // const onDragEnd = useCallback<NonNullable<MotionProps["onDragEnd"]>>(
    //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   (event, { delta, offset, point, velocity }) => {
    //     // Experimenting with distilling swipe offset and velocity into a single variable, so the less distance a user has swiped, the more velocity they need to register as a swipe.
    //     // Should accommodate longer swipes and short flicks without having binary checks on just distance thresholds and velocity > 0.
    //     const swipeConfidenceThreshold = 10000;
    //     const swipe = swipePower({ offset: offset.x, velocity: velocity.x });

    //     if (swipe > swipeConfidenceThreshold) {
    //       // Swipe right (previous slide)
    //       decreaseCurrentRowIndex();
    //     } else if (swipe < -swipeConfidenceThreshold) {
    //       // Swipe left (next slide)
    //       increaseCurrentRowIndex();
    //     }
    //   },
    //   [swipePower, decreaseCurrentRowIndex, increaseCurrentRowIndex],
    // );

    const defaultDragBuffer = 50;

    const onDragEnd = useCallback<NonNullable<MotionProps["onDragEnd"]>>(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (event, { delta, offset, point, velocity }) => {
        if (offset.x > defaultDragBuffer) {
          // Swipe right (previous slide)
          decreaseCurrentRowIndex();
        } else if (offset.x < -defaultDragBuffer) {
          // Swipe left (next slide)
          increaseCurrentRowIndex();
        }
      },
      [decreaseCurrentRowIndex, increaseCurrentRowIndex],
    );

    return (
      <>
        <CarouselBase ref={refBase} {...otherProps}>
          <CarouselRows
            variants={rowContentVariants}
            initial="initial"
            animate={rowsAnimation}
          >
            {Array.from({ length: maxRowIndex + 1 }, (_, rowIndex) => {
              return (
                <CarouselRow>
                  <CarouselRowContent
                    key={rowIndex}
                    itemCntPerRow={itemCntPerRow}
                    drag="x"
                    animate={rowContentAnimation}
                    // dragConstraints={{ left: 0, right: 0 }}
                    // dragElastic={1}
                    // dragSnapToOrigin={true}
                    // dragMomentum={false}
                    // dragPropagation
                    onTap={() => {
                      setStateIsDragging(true);
                    }}
                    onDragEnd={onDragEnd}
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
                            // onPointerDownCapture={(e) => e.stopPropagation()}
                            key={item.id}
                            ref={(el) => {
                              refCarouselItemBoxes.current[itemIndex] = el;
                            }}
                            layoutId={id + item.id}
                            variants={itemBoxVariants}
                            initial="initial"
                            whileHover="hover"
                            onClick={onClickItem({
                              id,
                              movieId: item.id.toString(),
                              title: item.title,
                            })}
                            style={{
                              pointerEvents: stateIsDragging ? "none" : "none",
                            }}
                            onTapStart={onLayoutAnimationToModal({ index })}
                            // ㄴ onLayoutAnimationStart는 toModal 변하는 방향, fromModal 다시 되돌아오는 방향들 각각 시작할때 모두 발생해서 `onLayoutAnimationStart` 보다 `onTapStart`가 더 잘 맞는다.
                            onLayoutAnimationComplete={onLayoutAnimationFromModal(
                              { index },
                            )}
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
          {pathMatch && selectedItem && list === id && (
            <>
              <ModalOverlay
                onClick={onClickModalOverlay({
                  id,
                  movieId: selectedItem.id.toString(),
                  title: selectedItem.title,
                })}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
              />
              <ModalContent layoutId={id + pathMatch.params[pathMatchParam]}>
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
