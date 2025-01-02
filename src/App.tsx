import { motion, Variants } from "motion/react";
import { useRef } from "react";
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
    background:linear-gradient(135deg,#e09,#d0e);
  }
`;

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// const Box = styled(motion.div)`
//   width: 200px;
//   height: 200px;
//   background-color: white;
//   border-radius: 15px;
//   box-shadow:
//     0 2px 3px rgba(0, 0, 0, 0.1),
//     0 10px 20px rgba(0, 0, 0, 0.06);
// `;

// const Box = styled(motion.div)`
//   width: 200px;
//   height: 200px;
//   display: grid;
//   grid-template-columns: repeat(2, 1fr);
//   background-color: rgba(255, 255, 255, 0.2);
//   border-radius: 40px;
//   box-shadow:
//     0 2px 3px rgba(0, 0, 0, 0.1),
//     0 10px 20px rgba(0, 0, 0, 0.06);
// `;

// const Circle = styled(motion.div)`
//   width: 70px;
//   height: 70px;
//   place-self: center;
//   background-color: white;
//   border-radius: 35px;
//   box-shadow:
//     0 2px 3px rgba(0, 0, 0, 0.1),
//     0 10px 20px rgba(0, 0, 0, 0.06);
// `;

// const myVariants = {
//   start: { scale: 0 },
//   end: { scale: 1, rotateZ: 360, transition: { type: "spring", delay: 0.5 } },
// };

// const boxVariants: Variants = {
//   start: { opacity: 0, scale: 0.5 },
//   end: {
//     opacity: 1,
//     scale: 1,
//     transition: {
//       type: "spring",
//       duration: 2,
//       bounce: 0.5,
//       delayChildren: 2,
//       staggerChildren: 0.2,
//     },
//   },
// };

// const circleVariants: Variants = {
//   start: {
//     scale: 0,
//   },
//   end: {
//     scale: 2,
//     transition: {
//       type: "spring",
//       bounce: 0.8,
//       duration: 5,
//     },
//   },
// };

// const circleVariants: Variants = {
//   start: {
//     opacity: 0,
//     y: 10,
//   },
//   end: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       type: "spring",
//       duration: 3,
//     },
//   },
// };

const BiggerBox = styled.div`
  width: 600px;
  height: 600px;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 40px;

  display: flex;
  justify-content: center;
  align-items: center;
  // overflow: hidden;
`;

const Box = styled(motion.div)`
  width: 200px;
  height: 200px;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 40px;
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.06);
`;

const boxVariants: Variants = {
  hover: {
    scale: 1.5,
    rotateZ: 90,
  },
  click: {
    scale: 1,
    borderRadius: "100px",
  },
  drag: { backgroundColor: "rgba(46, 204, 113)", transition: { duration: 10 } },
};

function App() {
  const refBiggerBox = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <GlobalStyle />
      <Wrapper>
        {/* <Box
          variants={boxVariants}
          whileHover="hover"
          whileTap="click"
          whileDrag="drag"
          drag
        /> */}
        <BiggerBox ref={refBiggerBox}>
          <Box
            drag
            // dragConstraints={{
            //   top: -200,
            //   left: -200,
            //   right: 200,
            //   bottom: 200,
            // }}
            dragConstraints={refBiggerBox}
            // dragSnapToOrigin
            // dragElastic={1}
            // dragElastic={0.5}
            dragElastic={0}
          />
        </BiggerBox>
      </Wrapper>
    </>
  );
}

export default App;
