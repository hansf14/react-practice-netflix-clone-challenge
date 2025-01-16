import { createBrowserRouter } from "react-router-dom";
import { BASE_PATH } from "@/api";
import Root from "@/Root";
import { Home } from "@/sections/Home";
import { Search } from "@/sections/Search";
import { TvShows } from "@/sections/TvShows";
import { Error404 } from "@/components/Error404";
import { Error400 } from "@/components/Error400";

export const router = createBrowserRouter([
  {
    path: `${BASE_PATH}/`,
    element: <Root />,
    errorElement: <Root outlet={<Error400 />} />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "tv-shows",
        element: <TvShows />,
      },
      {
        path: "search",
        element: <Search />,
        children: [
          {
            path: "movies/:movieId",
            element: <Search />,
          },
          {
            path: "tv-shows/:tvShowId",
            element: <Search />,
          },
        ],
      },
      {
        path: "movies/:movieId",
        element: <Home />,
      },
      {
        path: "tv-shows/:tvShowId",
        element: <TvShows />,
      },
      {
        path: "*", // Matches all other paths (404 handler)
        element: <Error404 />,
      },
    ],
  },
]);
