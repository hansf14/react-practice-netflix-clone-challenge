import { QueryClient } from "react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * (60 * 1000), // 60 mins
      cacheTime: 65 * (60 * 1000), // 65 mins
      refetchInterval: 65 * (60 * 1000),
    },
  },
});
