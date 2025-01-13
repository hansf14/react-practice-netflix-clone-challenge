import Root from "@/Root";
import { Home } from "@/sections/Home";
import { Search } from "@/sections/Search";
import { TvShows } from "@/sections/TvShows";
import { createBrowserRouter } from "react-router-dom";

export const basePath = "/react-practice-netflix-clone-challenge";

export const router = createBrowserRouter([
  {
    path: `${basePath}/`,
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
