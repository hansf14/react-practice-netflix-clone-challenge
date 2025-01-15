import React, { useMemo } from "react";
import parse from "html-react-parser";
import { useQueries, UseQueryOptions } from "@tanstack/react-query";
import { preloadImage } from "@/utils";

export async function loadImage({
  src,
  fallbackImage,
}: {
  src: string;
  fallbackImage: string;
}) {
  const fallbackImageComponent = <img src={fallbackImage} />;
  let result = {
    imageComponent: fallbackImageComponent,
  };

  if (!src || !fallbackImage) {
    console.warn("[loadImage] Warning: !src || !fallbackImage");
    return result;
  }

  try {
    const preloadedImageElement = await preloadImage({
      src,
    });
    if (
      !preloadedImageElement ||
      !(preloadedImageElement instanceof HTMLElement)
    ) {
      console.warn(
        "[loadImage] Warning: Invalid preloaded image element:",
        preloadedImageElement,
      );
      return result;
    }

    const preloadedImageComponent = preloadedImageElement?.outerHTML
      ? parse(preloadedImageElement.outerHTML)
      : fallbackImageComponent;

    if (
      !preloadedImageComponent ||
      !React.isValidElement(preloadedImageComponent)
    ) {
      console.warn(
        "[loadImage] Warning: Parsed element is not a valid React element.",
      );
      return result;
    }

    result = {
      imageComponent: preloadedImageComponent,
    };
    return result;
  } catch (error) {
    console.warn("[loadImage] Warning: loading image:", error);
    return result;
  }
}

export const useLoadImage = ({
  images,
  fallbackImage,
}: {
  images: string[];
  fallbackImage: string;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const loadImages = useCallback(async () => {
  //   const imageSrcArrForPreload = images;
  //   const preloadedImageElements = await preloadAllImages({
  //     srcArr: imageSrcArrForPreload,
  //   });
  //   // console.log(preloadedImageElements);

  //   const preloadedImageComponents = preloadedImageElements.map((element) =>
  //     element?.outerHTML ? (
  //       parse(element?.outerHTML)
  //     ) : (
  //       <img src={fallbackImage} /> // Fallback
  //     ),
  //   );
  //   return preloadedImageComponents as React.JSX.Element[];
  // }, [images, fallbackImage]);

  // const loadImage = useCallback(
  //   async ({ index }: { index: number }) => {
  //     const imageSrcForPreload = images[index];
  //     const preloadedImageElement = await preloadImage({
  //       src: imageSrcForPreload,
  //     });

  //     const preloadedImageComponent = preloadedImageElement?.outerHTML ? (
  //       parse(preloadedImageElement?.outerHTML)
  //     ) : (
  //       <img src={fallbackImage} /> // Fallback
  //     );
  //     return preloadedImageComponent as React.JSX.Element;
  //   },
  //   [images, fallbackImage],
  // );

  const queryOptionsArr = useMemo(() => {
    return images.map((src, index) => {
      const queryOptions: UseQueryOptions<
        React.JSX.Element,
        unknown,
        React.JSX.Element
      > = {
        queryKey: ["preloadImage", src],
        queryFn: async () => {
          const { imageComponent } = await loadImage({
            src: images[index],
            fallbackImage,
          });
          return imageComponent;
        },
        refetchOnWindowFocus: false,
      };
      return queryOptions;
    });
  }, [images, fallbackImage]);

  const imageComponentObjs = useQueries({ queries: queryOptionsArr });

  return {
    imageComponentObjs,
  };
};
