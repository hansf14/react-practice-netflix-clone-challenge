import { theme01 } from "@/theme";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { styled, ThemeProvider, createGlobalStyle } from "styled-components";
import { Outlet } from "react-router-dom";
import { queryClient } from "@/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeaderNavBar } from "@/components/HeaderNavBar";
import { Footer } from "@/components/Footer";
import { getScrollbarCss } from "@/csses/scrollbar";
// import { RecoilRoot } from "recoil";
// import RecoilNexus from "recoil-nexus";
// import reactLogo from "./assets/react.svg"; // /src/assets/...
// import viteLogo from "/vite.svg"; // /public/...

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

  // Customized by me
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
    overflow-y: auto;
    width: 100%;

    font-family: "Source Sans 3", sans-serif;
    font-optical-sizing: auto;
    font-style: normal;
    word-break: break-word;
  }
  
  // Override for antd modal global css injection "html body { overflow-y: hidden; width: calc(100%- 17px); }"
  // https://stackoverflow.com/a/28300471/11941803
  body:not(_):not(_):not(_) {
    overflow-y: unset;
    width: 100%;
  }
  
  #root {
    width: 100%;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  html, body {
    ${({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      theme,
    }) =>
      getScrollbarCss({
        // outline: "1px solid #fff",
        margin: "1px",

        thumbBackground: "#fff",
        trackBackground: "#000",
      })} 
  }
  * {
    ${({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      theme,
    }) =>
      getScrollbarCss({
        thumbBackground: "#fff",
        trackBackground: "transparent",
      })}
  }
`;

const Layout = styled.div`
  flex-grow: 1;
  overflow: hidden;
  width: 100%;

  padding-top: ${({ theme }) => `${theme.headerNavBarHeight}px`};
  background-color: ${({ theme }) => theme.layoutBackground};

  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.layoutFontColor01};
`;

function Root({ outlet }: { outlet?: React.ReactNode }) {
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
            {!!outlet ? outlet : <Outlet />}
            <Footer />
          </Layout>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default Root;
