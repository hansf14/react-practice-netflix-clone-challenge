import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useAnimation, Variants } from "motion/react";
import { useMedia, useSize } from "react-use";
import { css, styled } from "styled-components";
import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import { StyledComponentProps } from "@/utils";
import { CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";

const CarouselBase = styled.div`
  container-name: carousel-base;
  container-type: inline-size;
`;

const CarouselRows = styled(motion.div)`
  display: flex;
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
    }
  }
`;

const CarouselRowContent = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !["itemCntPerRow"].includes(prop),
})<RowProps>`
  transform-style: preserve-3d;

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
  min-width: 0;
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
  grid-column: 1;
  grid-row: 2;
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

const SelectedMoviePoster = styled.div`
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

const SelectedMovieTitle = styled.h2`
  font-size: 36px;
  text-align: center;
`;

type RowVariantsParams = {
  direction: number;
  stepSize: number;
};

const rowContentVariants: Variants = {
  initial: { x: 0 },
  // animate: {x: }
  // hidden: ({ direction, stepSize }: RowVariantsParams) => {
  //   return {
  //     x: direction * stepSize * document.documentElement.clientWidth,
  //   };
  // },
  // visible: { x: 0, transition: { type: "tween", duration: 1 } },
  // exit: ({ direction, stepSize }: RowVariantsParams) => {
  //   return {
  //     x: -direction * stepSize * document.documentElement.clientWidth,
  //     transition: { type: "tween", duration: 1 },
  //   };
  // },
};

// const rowContentVariants: Variants = {
//   hidden: ({ direction, stepSize }: RowVariantsParams) => {
//     return {
//       x: direction * stepSize * document.documentElement.clientWidth,
//     };
//   },
//   visible: { x: 0, transition: { type: "tween", duration: 1 } },
//   exit: ({ direction, stepSize }: RowVariantsParams) => {
//     return {
//       x: -direction * stepSize * document.documentElement.clientWidth,
//       transition: { type: "tween", duration: 1 },
//     };
//   },
// };

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

type CarouselProps = {
  items: {
    id: string;
    title: string;
  }[];
  images: React.ReactNode[];
  pathMatchPattern: string;
  pathMatchParam: string;
} & StyledComponentProps<"div">;

export const Carousel = withMemoAndRef<"div", HTMLDivElement, CarouselProps>({
  displayName: "Carousel",
  Component: (
    { items, images, pathMatchPattern, pathMatchParam, ...otherProps },
    ref,
  ) => {
    const isSmallerEqual600px = useMedia("(max-width: 600px)");
    const itemCntPerRow = isSmallerEqual600px ? 4 : 5;

    const [stateCurrentRowIndex, setStateCurrentRowIndex] = useState<number>(0);
    const [stateIsExiting, setStateIsExiting] = useState<boolean>(false);

    const totalCntItem = items.length;
    const maxRowIndex = Math.ceil(totalCntItem / itemCntPerRow) - 1;

    // const [stateDirection, setStateDirection] = useState<-1 | 0 | 1>(0);
    // const [stateStepSize, setStateStepSize] = useState<number>(0);
    // const refDirection = useRef<-1 | 0 | 1>(0);
    // const refStepSize = useRef<number>(0);

    const rowContentAnimation = useAnimation();

    const increaseCurrentRowIndex = useCallback(() => {
      if (stateIsExiting) {
        return;
      }
      // setStateDirection(1);
      // setStateStepSize(1);
      // refDirection.current = 1;
      // refStepSize.current = 1;

      const nextRowIndex =
        stateCurrentRowIndex >= maxRowIndex ? 0 : stateCurrentRowIndex + 1;

      rowContentAnimation.start({
        x: -nextRowIndex * document.documentElement.clientWidth,
        transition: {
          ease: "easeInOut",
          duration: 0.5,
        },
      });
      // setStateIsExiting(true);
      setStateCurrentRowIndex(nextRowIndex);
      // TODO: maxRowIndex -> 0 => direction: -1, stepSize: n - 1
    }, [
      stateCurrentRowIndex,
      rowContentAnimation,
      maxRowIndex,
      stateIsExiting,
    ]);

    const decreaseCurrentRowIndex = useCallback(() => {
      if (stateIsExiting) {
        return;
      }
      // setStateDirection(-1);
      // setStateStepSize(1);
      // setStateIsExiting(true);
      // setStateCurrentRowIndex((currentIndex) =>
      //   currentIndex <= 0 ? maxRowIndex : currentIndex - 1,
      // );
    }, [maxRowIndex, stateIsExiting]);

    const changeCurrentRowIndexTo = useCallback(
      ({ indexTo }: { indexTo: number }) =>
        () => {
          if (stateIsExiting) {
            return;
          }
          // if (indexTo === stateCurrentRowIndex) {
          //   setStateDirection(0);
          //   setStateStepSize(0);
          //   return;
          // }
          // if (indexTo < 0 || indexTo > maxRowIndex) {
          //   return;
          // }

          // setStateDirection(stateCurrentRowIndex < indexTo ? 1 : -1);
          // setStateStepSize(Math.abs(stateCurrentRowIndex - indexTo));
          // setStateIsExiting(true);
          // setStateCurrentRowIndex(indexTo);
        },
      [stateIsExiting, stateCurrentRowIndex, maxRowIndex],
    );

    const onExitComplete = useCallback(() => {
      setStateIsExiting(false);
    }, []);

    const navigate = useNavigate();

    const onClickMovieBox = useCallback(
      ({ movieId }: { movieId: string }) => {
        navigate(`movies/${movieId}`); // TODO:
      },
      [navigate],
    );

    const onClickModalOverlay = useCallback(() => {
      navigate(-1);
    }, [navigate]);

    const pathMatch = useMatch(pathMatchPattern);

    const selectedMovieIndex = useMemo(
      () =>
        pathMatch && pathMatch.params[pathMatchParam]
          ? (items.findIndex(
              (movie) =>
                movie.id.toString() === pathMatch.params[pathMatchParam],
            ) ?? -1)
          : -1,
      [items, pathMatch, pathMatchParam],
    );

    const selectedMovie =
      selectedMovieIndex === -1 ? null : items[selectedMovieIndex];

    const [stateSelectedMovieImage, setStateSelectedMovieImage] =
      useState<React.ReactNode>(null);

    useEffect(() => {
      if (selectedMovieIndex !== -1) {
        setStateSelectedMovieImage(images[selectedMovieIndex]);
      }
    }, [selectedMovieIndex, images]);

    return (
      <>
        <CarouselBase ref={ref} {...otherProps}>
          {/* <AnimatePresence
              custom={{
                direction: stateDirection,
                stepSize: stateStepSize,
              }}
              initial={false}
              onExitComplete={onExitComplete}
            > */}
          <CarouselRows
            variants={rowContentVariants}
            initial="initial"
            animate={rowContentAnimation}
            // animate="visible"
            // exit="exit"
            onAnimationComplete={(animationDefinition) => {
              console.log(animationDefinition);
              onExitComplete();
            }}
          >
            {Array.from({ length: maxRowIndex + 1 }, (_, rowIndex) => {
              return (
                <CarouselRow>
                  <CarouselRowContent
                    key={rowIndex}
                    itemCntPerRow={itemCntPerRow}
                    // custom={{
                    //   direction: stateDirection,
                    //   stepSize: stateStepSize,
                    // }}
                    // variants={rowContentVariants}
                    // initial="hidden"
                    // animate={rowContentAnimation}
                    // // animate="visible"
                    // // exit="exit"
                    // itemCntPerRow={itemCntPerRow}
                    // onAnimationComplete={(animationDefinition) => {
                    //   console.log(animationDefinition);
                    //   onExitComplete();
                    // }}
                  >
                    {items
                      .slice(
                        itemCntPerRow * rowIndex,
                        itemCntPerRow * (rowIndex + 1),
                      )
                      .map((item, index) => {
                        const movieIndex = itemCntPerRow * rowIndex + index;

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
                              onClickMovieBox({ movieId: item.id.toString() })
                            }
                          >
                            <CarouselItemPoster>
                              {images[movieIndex]}
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
          {!!pathMatch && (
            <>
              <ModalOverlay
                onClick={onClickModalOverlay}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
              />
              <ModalContent layoutId={pathMatch.params.movieId}>
                {selectedMovie && (
                  <>
                    <SelectedMoviePoster>
                      {stateSelectedMovieImage}
                    </SelectedMoviePoster>
                    <SelectedMovieTitle>
                      {selectedMovie.title}
                    </SelectedMovieTitle>
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
