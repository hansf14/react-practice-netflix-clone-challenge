import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type DomainBoundNavigateBackParams = {
  basePath: string;
};

export const useDomainBoundNavigateBack = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const domainBoundNavigateBack = useCallback(
    (params?: DomainBoundNavigateBackParams) => {
      const { basePath = "/" } = params ?? {};
      // console.log(location.key);

      const hasPreviousState = location.key !== "default";
      hasPreviousState ? navigate(-1) : navigate(basePath);
    },
    [location.key, navigate],
  );

  return {
    domainBoundNavigateBack,
  };
};
