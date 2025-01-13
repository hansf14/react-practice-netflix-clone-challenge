import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import { styled } from "styled-components";

const LoaderBase = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Loader = withMemoAndRef<"div">({
  displayName: "Loader",
  Component: (props, ref) => {
    return (
      <LoaderBase ref={ref} {...props}>
        Loading...
      </LoaderBase>
    );
  },
});
