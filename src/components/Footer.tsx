import { styled } from "styled-components";
import { withMemoAndRef } from "@/hocs/withMemoAndRef";

const FooterBase = styled.div`
  height: 100px;
`;

export const Footer = withMemoAndRef<"div", HTMLDivElement>({
  displayName: "Footer",
  Component: (props, ref) => {
    return <FooterBase ref={ref} {...props} />;
  },
});
