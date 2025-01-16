import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type DomainBoundNavigateBackParams = {
  fallbackPath: string;
  onAboutToFallback?: ({
    cancelFallback,
  }: {
    cancelFallback: () => void;
  }) => void;
};

export const useDomainBoundNavigateBack = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const domainBoundNavigateBack = useCallback(
    (params?: DomainBoundNavigateBackParams) => {
      const { fallbackPath = "/", onAboutToFallback } = params ?? {};
      // console.log(location.key);

      const hasPreviousState = location.key !== "default";
      if (hasPreviousState) {
        navigate(-1);
      } else {
        let shouldFallback = true;
        const cancelFallback = () => {
          shouldFallback = false;
        };
        onAboutToFallback?.({ cancelFallback });
        shouldFallback && navigate(fallbackPath);
      }
    },
    [location.key, navigate],
  );

  return {
    domainBoundNavigateBack,
  };
};
