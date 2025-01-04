// https://stackoverflow.com/a/69325090/11941803

export const preloadImage = async ({
  src,
}: {
  src: string;
}): Promise<HTMLImageElement | null> => {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);

      img.onload = () => {
        // Releasing event listeners.
        img.onload = null;
        URL.revokeObjectURL(blobUrl);
        resolve(img);
      };
      // img.onerror = img.onabort = reject(src);
      img.onerror = img.onabort = () => {
        // Releasing event listeners.
        img.onerror = img.onabort = null;
        URL.revokeObjectURL(blobUrl);
        reject(src);
      };
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const preloadAllImages = async ({ srcArr }: { srcArr: string[] }) => {
  const promises = srcArr.map((src) => {
    return preloadImage({ src });
  });

  return await Promise.all(promises);
};

export const preloadFastestImage = async ({ srcArr }: { srcArr: string[] }) => {
  const promises = srcArr.map((src) => {
    return preloadImage({ src });
  });

  return await Promise.any(promises);
};
