import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import { styled } from "styled-components";

const FooterBase = styled.div`
  height: 100px;
`;

export const Footer = withMemoAndRef<"div", HTMLDivElement>({
  displayName: "Footer",
  Component: (props, ref) => {
    return <FooterBase ref={ref} {...props} />;
  },
});
