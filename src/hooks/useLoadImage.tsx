import React, { useCallback, useMemo } from "react";
import parse from "html-react-parser";
import { useQueries, UseQueryOptions } from "@tanstack/react-query";
import { preloadAllImages, preloadImage } from "@/utils";

export async function loadImage({
  src,
  fallbackImage,
}: {
  src: string;
  fallbackImage: string;
}) {
  try {
    const preloadedImageElement = await preloadImage({
      src,
    });

    const preloadedImageComponent = preloadedImageElement?.outerHTML ? (
      parse(preloadedImageElement.outerHTML)
    ) : (
      <img src={fallbackImage} /> // Fallback
    );

    // console.log(React.isValidElement(preloadedImageComponent));
    return {
      imageComponent: preloadedImageComponent as React.JSX.Element,
    };
  } catch (error) {
    console.error("Error loading image:", error);
    return {
      imageComponent: <img src={fallbackImage} />,
    };
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
  const loadImages = useCallback(async () => {
    const imageSrcArrForPreload = images;
    const preloadedImageElements = await preloadAllImages({
      srcArr: imageSrcArrForPreload,
    });
    // console.log(preloadedImageElements);

    const preloadedImageComponents = preloadedImageElements.map((element) =>
      element?.outerHTML ? (
        parse(element?.outerHTML)
      ) : (
        <img src={fallbackImage} /> // Fallback
      ),
    );
    return preloadedImageComponents as React.JSX.Element[];
  }, [images, fallbackImage]);

  const loadImage = useCallback(
    async ({ index }: { index: number }) => {
      const imageSrcForPreload = images[index];
      const preloadedImageElement = await preloadImage({
        src: imageSrcForPreload,
      });

      const preloadedImageComponent = preloadedImageElement?.outerHTML ? (
        parse(preloadedImageElement?.outerHTML)
      ) : (
        <img src={fallbackImage} /> // Fallback
      );
      return preloadedImageComponent as React.JSX.Element;
    },
    [images, fallbackImage],
  );

  const queryOptionsArr = useMemo(() => {
    return images.map((src, index) => {
      const queryOptions: UseQueryOptions<
        React.JSX.Element,
        unknown,
        React.JSX.Element
      > = {
        queryKey: ["preloadImage", src],
        queryFn: () => {
          return loadImage({ index });
        },
        refetchOnWindowFocus: false,
      };
      return queryOptions;
    });
  }, [images, loadImage]);

  const imageComponentObjs = useQueries({ queries: queryOptionsArr });

  return {
    imageComponentObjs,
  };
};
