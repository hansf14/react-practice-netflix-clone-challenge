import { theme01 } from "@/theme";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { styled, ThemeProvider, createGlobalStyle } from "styled-components";
import { Outlet } from "react-router-dom";
import { queryClient } from "@/queryClient";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { HeaderNavBar } from "@/components/HeaderNavBar";
// import { RecoilRoot } from "recoil";
// import RecoilNexus from "recoil-nexus";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";

/* @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap'); */
const GlobalStyle = createGlobalStyle`
  /* http://meyerweb.com/eric/tools/css/reset/
    v5.0.1 | 20191019
    License: none (public domain)
  */
  html, body, div, span, applet, object, iframe,
  h1, h2, h3, h4, h5, h6, p, blockquote, pre,
  a, abbr, acronym, address, big, cite, code,
  del, dfn, em, img, ins, kbd, q, s, samp,
  small, strike, strong, sub, sup, tt, var,
  b, u, i, center,
  dl, dt, dd, menu, ol, ul, li,
  fieldset, form, label, legend,
  table, caption, tbody, tfoot, thead, tr, th, td,
  article, aside, canvas, details, embed,
  figure, figcaption, footer, header, hgroup,
  main, menu, nav, output, ruby, section, summary,
  time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
  }
  /* HTML5 display-role reset for older browsers */
  article, aside, details, figcaption, figure,
  footer, header, hgroup, main, menu, nav, section {
    display: block;
  }
  /* HTML5 hidden-attribute fix for newer browsers */
  *[hidden] {
      display: none;
  }
  body {
    line-height: 1;
  }
  menu, ol, ul {
    list-style: none;
  }
  blockquote, q {
    quotes: none;
  }
  blockquote:before, blockquote:after,
  q:before, q:after {
    content: '';
    content: none;
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  * {
    box-sizing: border-box;
  }
  a {
    text-decoration:none;
    color:inherit;
  }
  :root {
    color-scheme: only light;
  }
  
  html {
    width: 100%;
    height: 100%;
    min-height: 100%;

    font-family: "Source Sans 3", sans-serif;
    font-optical-sizing: auto;
    font-style: normal;
    word-break: break-word;
  }
  body,
  #root {
    width: 100%;
    height: 100%;
  }
`;

const Layout = styled.main`
  overflow-x: hidden;
  width: 100%;
  // height: 100%;
  height: 200vh;

  padding-top: ${({ theme }) => `${theme.headerNavBarHeight}px`};
  background-color: ${({ theme }) => theme.layoutBackground};

  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.layoutFontColor01};
`;

function Root() {
  // const { theme } = useThemeContext(lightTheme);
  // console.log(theme);

  return (
    <ThemeProvider theme={theme01}>
      <GlobalStyle />
      {/* <RecoilNexus /> */}
      <HelmetProvider>
        <Helmet>
          <link
            href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap"
            rel="stylesheet"
          />
        </Helmet>
        <QueryClientProvider client={queryClient}>
          <Layout>
            <HeaderNavBar />
            <Outlet />
          </Layout>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default Root;
