import Root from "@/Root";
import Home from "@/sections/Home";
import Search from "@/sections/Search";
import Tv from "@/sections/Tv";
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
        path: "tv",
        element: <Tv />,
      },
      {
        path: "search",
        element: <Search />,
      },
    ],
  },
]);
