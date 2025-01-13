import { useLocation } from "react-router-dom";

export function Search() {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get("keyword");
  return null;
}
