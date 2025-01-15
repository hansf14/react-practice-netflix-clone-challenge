import { createBrowserRouter } from "react-router-dom";
import { BASE_PATH } from "@/api";
import Root from "@/Root";
import { Home } from "@/sections/Home";
import { Search } from "@/sections/Search";
import { TvShows } from "@/sections/TvShows";

export const router = createBrowserRouter([
  {
    path: `${BASE_PATH}/`,
    element: <Root />,
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
      },
      {
        path: "movies/:movieId",
        element: <Home />,
      },
      {
        path: "tv-shows/:tvShowId",
        element: <TvShows />,
      },
    ],
  },
]);
