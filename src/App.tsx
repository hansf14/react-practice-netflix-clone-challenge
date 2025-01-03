import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { createGlobalStyle, styled } from "styled-components";
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
  
  body {
    font-weight: 300;
    font-family: 'Source Sans Pro', sans-serif;
    color:black;
    line-height: 1.2;
  }
`;

const Wrapper = styled(motion.div)`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: linear-gradient(135deg, #e09, #d0e);
`;

const Grid = styled.div`
  width: 50vw;
  gap: 10px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  div: first-child,
  div: last-child {
    grid-column: span 2;
  }
`;

const Box = styled(motion.div)`
  height: 200px;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 40px;
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.06);

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Overlay = styled(motion.div)`
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  position: absolute;

  display: flex;
  justify-content: center;
  align-items: center;
`;

// const Circle = styled(motion.div)`
//   width: 100px;
//   height: 100px;
//   background-color: #00a5ff;
//   border-radius: 50px;
//   box-shadow:
//     0 2px 3px rgba(0, 0, 0, 0.1),
//     0 10px 20px rgba(0, 0, 0, 0.06);
// `;

function App() {
  const [stateId, setStateId] = useState<null | string>(null);

  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <Grid>
          {Array.from({ length: 4 }, (_, index) => (index + 1).toString()).map(
            (n) => (
              <Box onClick={() => setStateId(n)} key={n} layoutId={n} />
            ),
          )}
        </Grid>
        <AnimatePresence>
          {stateId ? (
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStateId(null)}
            >
              <Box layoutId={stateId} style={{ width: 400, height: 200 }} />
            </Overlay>
          ) : null}
        </AnimatePresence>
      </Wrapper>
    </>
  );
}

export default App;
