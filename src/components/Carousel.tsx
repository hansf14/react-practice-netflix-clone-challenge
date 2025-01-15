import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  motion,
  MotionProps,
  useAnimation,
  useDragControls,
  Variants,
} from "motion/react";
import { useMedia } from "react-use";
import { css, styled } from "styled-components";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import { useResizeObserver } from "usehooks-ts";
import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import { SmartOmit, StyledComponentProps } from "@/utils";
import netflixInitialLogo from "@/assets/netflix-initial-logo.png";
import { Error } from "@/components/Error";
import { Loader } from "@/components/Loader";
import { useLoadImage } from "@/hooks/useLoadImage";

const CarouselBase = styled.div`
  width: 100%;
  container-name: carousel-base;
  container-type: inline-size;

  display: flex;
  flex-direction: column;
`;

const CarouselRows = styled(motion.div)`
  will-change: transform;
  display: flex;
  width: fit-content;

  gap: 10px;
  @container (max-width: 600px) {
    & {
      gap: 0;
    }
  }
`;

const CarouselRow = styled.div`
  flex: 0 0 auto;
  width: 80cqw;
  margin: 0 10cqw;
  @container (max-width: 1000px) {
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
  will-change: transform;
  width: 100%;

  display: grid;
  grid-template-columns: repeat(
    ${({ itemCntPerRow }) => itemCntPerRow.toString()},
    1fr
  );
  gap: 10px;
  @container (max-width: 600px) {
    & {
      gap: 0;
    }
  }
`;

const CarouselItemBox = styled(motion.div)`
  transform-style: preserve-3d;
  will-change: transform;
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

export const cssItemPosterImage = css`
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  height: 100%;
`;

const CarouselItemPoster = styled.div`
  transform: translateZ(5px);
  aspect-ratio: 2 / 3; // Prevent subpixel problem by setting the aspect ratio to the image intrinsic dimension.

  display: flex;
  align-items: center;

  img {
    ${cssItemPosterImage}
  }

  container-name: carousel-item-poster;
  container-type: size;
`;

const CarouselItemPosterLoadIndicatorPlaceholder = styled.div`
  width: 100cqw;
  height: 100cqh;
`;

const CarouselItemTooltipOverflowParentGuard = styled.div`
  clip-path: inset(0px 0px -100vh 0px);
`;

const CarouselItemTooltip = styled(motion.div)`
  transform: translateZ(3px);
  will-change: transform;
  position: absolute;
  bottom: 0;
  width: 100%;

  padding: 10px;
  opacity: 0;
  background-color: #eee;
  color: #111;

  @container (max-width: 500px) {
    & {
      padding: 10px 5px;
    }
  }
`;

const CarouselItemTooltipTitle = styled.h3`
  text-align: center;

  font-size: 14px;
  @container (max-width: 500px) {
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

const CarouselControllerNumber = styled.div.withConfig({
  shouldForwardProp: (prop) => !["isActive"].includes(prop),
})<CarouselControllerNumberProps>`
  font-size: 25px;
  ${({ isActive }) =>
    isActive
      ? `
      color: #ffd700; // #1677ff;
      font-weight: bold;
    `
      : "cursor: pointer;"}
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

export type OnOpenItemParams = {
  carouselId: string;
  itemId: string;
  title: string;
  image: string;
};

export type OnOpenItem = ({
  carouselId,
  itemId,
  title,
}: OnOpenItemParams) => void;

export type CarouselProps = {
  id: string;
  items: CarouselItem[];
  images: string[];
  onOpenItem?: OnOpenItem;
} & SmartOmit<StyledComponentProps<"div">, "children">;

export const Carousel = withMemoAndRef<"div", HTMLDivElement, CarouselProps>({
  displayName: "Carousel",
  Component: ({ id, items, images, onOpenItem, ...otherProps }, ref) => {
    const { imageComponentObjs } = useLoadImage({
      images,
      fallbackImage: netflixInitialLogo,
    });

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

    const refSize = useRef<Size>({ width: undefined, height: undefined });
    const onResize = useCallback(
      ({ width, height }: Size) => {
        refSize.current = { width, height };

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
      },
      [gap, rowsAnimation, stateCurrentRowIndex],
    );

    useResizeObserver({
      ref: refBase,
      box: "border-box",
      onResize,
    });

    // * Needed for drag handle
    // `CarouselRows`: Actual being dragged item
    // `CarouselRowContent`: drag handle
    const dragControls = useDragControls(); // Initialize drag controls

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
      }
      setStateCurrentRowIndex(nextRowIndex);
    }, [gap, stateCurrentRowIndex, rowsAnimation, maxRowIndex]);

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
      }
      setStateCurrentRowIndex(prevRowIndex);
    }, [gap, stateCurrentRowIndex, rowsAnimation, maxRowIndex]);

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
          }
          setStateCurrentRowIndex(indexTo);
        },
      [gap, stateCurrentRowIndex, rowsAnimation, maxRowIndex],
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

    //////////////////////////////////////////
    // To support both drag & click
    // `stateWasDrag` will be used at `onClickItem` which causes to open up the modal
    // (it only does navigation but it will end up opening modal at the end.)

    const [stateIsPointerDown, setStateIsPointerDown] =
      useState<boolean>(false);
    const [stateWasDrag, setStateWasDrag] = useState<boolean>(false);
    const refPosStartX = useRef<number>(0);

    const onPointerDown = useCallback<
      React.PointerEventHandler<HTMLDivElement>
    >(
      (event) => {
        // console.log("[onPointerDown]");
        dragControls.start(event);

        refPosStartX.current = event.clientX;
        setStateIsPointerDown(true);
        setStateWasDrag(false);
      },
      [dragControls],
    );

    const onPointerMove = useCallback<
      React.PointerEventHandler<HTMLDivElement>
    >(
      (event) => {
        if (
          stateIsPointerDown &&
          Math.abs(event.clientX - refPosStartX.current) >= defaultDragThreshold
        ) {
          setStateWasDrag(true);
        }
      },
      [stateIsPointerDown],
    );

    const onPointerUp = useCallback<React.PointerEventHandler<HTMLDivElement>>(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (event) => {
        setStateIsPointerDown(false);
      },
      [],
    );

    //////////////////////////////////////////

    const onClickItem = useCallback(
      ({ carouselId, itemId, title, image }: OnOpenItemParams) =>
        () => {
          // console.log("[onClickItem]");

          if (stateWasDrag) {
            return;
          }

          onOpenItem?.({ carouselId, itemId, title, image });
        },
      [stateWasDrag, onOpenItem],
    );

    const onLayoutAnimationToModal = useCallback(
      ({ index }: { index: number }) =>
        () => {
          if (!refCarouselItemBoxes.current?.[index]) {
            return;
          }
          // console.log("[onLayoutAnimationToModal]");

          refCarouselItemBoxes.current[index].style.translate = "0 0 100px";
          setTimeout(() => {
            if (!refCarouselItemBoxes.current?.[index]) {
              return;
            }
            refCarouselItemBoxes.current[index].style.translate = "";
          }, 1000);
        },
      [],
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const defaultDragThreshold = 50;
    // Drag threshold / drag buffer
    // Minimum movement to consider it a drag

    const onDragEnd = useCallback<NonNullable<MotionProps["onDragEnd"]>>(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (event, { delta, offset, point, velocity }) => {
        // console.log("[onDragEnd]");

        if (offset.x > defaultDragThreshold) {
          // Swipe right (previous slide)
          decreaseCurrentRowIndex();
        } else if (offset.x < -defaultDragThreshold) {
          // Swipe left (next slide)
          increaseCurrentRowIndex();
        } else {
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
        }
      },
      [
        gap,
        rowsAnimation,
        stateCurrentRowIndex,
        decreaseCurrentRowIndex,
        increaseCurrentRowIndex,
      ],
    );

    return (
      <>
        <CarouselBase ref={refBase} {...otherProps}>
          <CarouselRows
            variants={rowContentVariants}
            initial="initial"
            animate={rowsAnimation}
            drag="x" // Allow dragging
            dragControls={dragControls} // Bind drag controls
            dragListener={false} // Disable default drag behavior (since we will attach the drag listeners to the drag handle(`CarouselRowContent`))
            // onDragStart={() => console.log("[onDragStart]")}
            onDragEnd={onDragEnd}
          >
            {Array.from({ length: maxRowIndex + 1 }, (_, rowIndex) => {
              return (
                <CarouselRow key={rowIndex}>
                  <CarouselRowContent
                    itemCntPerRow={itemCntPerRow}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    // * https://motion.dev/docs/react-use-drag-controls
                    // Touch support
                    // To support touch screens, the triggering element should have the touch-action: none style applied.
                    // * userSelect
                    // Make text selectable
                    // To make draggable complete, need this property.
                    style={{ touchAction: "none", userSelect: "none" }}
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
                            ref={(el) => {
                              refCarouselItemBoxes.current[itemIndex] = el;
                            }}
                            layoutId={id + item.id}
                            variants={itemBoxVariants}
                            initial="initial"
                            whileHover="hover"
                            onClick={onClickItem({
                              carouselId: id,
                              itemId: item.id.toString(),
                              title: item.title,
                              image: images[itemIndex],
                            })}
                            onTapStart={onLayoutAnimationToModal({
                              index,
                            })}
                            // ㄴ onLayoutAnimationStart는 fromModal (다시 되돌아오는 방향)에서만 발생해서 `onLayoutAnimationStart` 보다 `onTapStart`가 더 잘 맞는다.
                          >
                            <CarouselItemPoster>
                              {imageComponentObjs[itemIndex].status ===
                                "error" && <Error />}
                              {imageComponentObjs[itemIndex].status ===
                                "pending" && (
                                <Loader>
                                  <CarouselItemPosterLoadIndicatorPlaceholder />
                                </Loader>
                              )}
                              {imageComponentObjs[itemIndex].status ===
                                "success" &&
                                imageComponentObjs[itemIndex].data &&
                                React.cloneElement(
                                  imageComponentObjs[itemIndex]
                                    .data as React.ReactElement,
                                  {
                                    style: { pointerEvents: "none" },
                                  },
                                )}
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
                  key={index}
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
      </>
    );
  },
});
