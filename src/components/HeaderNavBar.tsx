import { styled } from "styled-components";
import {
  motion,
  useAnimation,
  useMotionValueEvent,
  useScroll,
  Variants,
} from "motion/react";
import { Link, useMatch } from "react-router-dom";
import { basePath } from "@/router";
import { useResolvedPath } from "react-router-dom";
import { Select } from "@/components/SearchBox";
import { useCallback, useEffect, useState } from "react";

const HeaderNavBarBase = styled(motion.nav)`
  position: fixed;
  top: 0;
  width: 100%;
  ${({ theme }) => `${theme.headerNavBarHeight}px;`}
  height: 60px;

  background-color: black;
  display: flex;
  justify-content: space-between;
  align-items: center;

  font-size: 14px;
  font-weight: bold;
`;

const HeaderNavBarColumn = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderNavBarLogo = styled(motion.svg)`
  width: 120px;
  height: auto;
  margin: 0 50px 0 10px;
`;

const HeaderNavBarItems = styled.ul`
  display: flex;
  align-items: center;
`;

const HeaderNavBarItem = styled.li`
  position: relative;
  margin-right: 20px;
`;

const HeaderNavBarItemCircle = styled(motion.span)`
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  margin: 0 auto;

  width: 6px;
  height: 6px;
  background-color: red;
  border-radius: 3px;

  display: flex;
  justify-content: center;
  flex-direction: column;

  // &:hover
`;

const HeaderNavBarSearchBox = styled.div``;

const HeaderNavBarSearchInput = styled(motion.input)``;

const logoVariants: Variants = {
  initial: {
    fillOpacity: 1,
  },
  hover: {
    fillOpacity: [0, 0.5, 0, 0.7, 0, 0.2, 1, 0],
    transition: {
      repeat: Infinity,
    },
  },
};

const headerNavBarVariants: Variants = {
  top: {
    backgroundColor: "rgba(0, 0, 0, 1)",
    transition: {
      type: "tween",
      duration: 1,
    },
  },
  scroll: {
    backgroundColor: "rgba(0, 0, 0, 0)",
    transition: {
      type: "tween",
      duration: 1,
    },
  },
};

export const HeaderNavBar = () => {
  const tvPath = `${basePath}/tv`;
  const homeMatch = useMatch(basePath);
  const tvMatch = useMatch(tvPath);

  const headerNavBarAnimation = useAnimation();

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latestValue) => {
    // console.log(latestValue);
    if (latestValue > 80) {
      headerNavBarAnimation.start("scroll");
    } else {
      headerNavBarAnimation.start("top");
    }
  });

  const [stateIsSearchBoxOpen, setStateIsSearchBoxOpen] =
    useState<boolean>(false);
  const openSearchBoxHandler = useCallback(() => {
    setStateIsSearchBoxOpen(true);
  }, []);

  return (
    <HeaderNavBarBase
      variants={headerNavBarVariants}
      animate={headerNavBarAnimation}
      initial="top"
    >
      <HeaderNavBarColumn>
        <HeaderNavBarLogo
          height="677"
          viewBox=".238 .034 919.406 248.488"
          width="2500"
          xmlns="http://www.w3.org/2000/svg"
          variants={logoVariants}
          initial="initial"
          whileHover="hover"
        >
          <motion.path
            d="m870.46 118.314 49.184 130.208c-14.495-2.07-28.982-4.663-43.733-6.999l-27.707-71.945-28.468 66.006c-13.973-2.336-27.698-3.114-41.672-4.928l49.955-113.89-45.309-116.732h41.937l25.362 65.22 27.185-65.22h42.442zm-120.864-118.28h-38.052v225.71c12.425.779 25.362 1.292 38.052 2.841zm-70.927 223.118c-34.68-2.328-69.37-4.39-104.829-5.177v-217.94h38.823v181.188c22.264.514 44.52 2.32 66.006 3.355zm-146.252-134.847v38.822h-53.06v88.263h-38.3v-215.356h108.713v38.822h-70.405v49.45h53.06zm-156.597-49.449v178.605c-12.946 0-26.14 0-38.83.514v-179.119h-40.122v-38.822h119.322v38.822zm-120.88 90.334c-17.08 0-37.274 0-51.769.787v57.715c22.778-1.557 45.556-3.363 68.59-4.141v37.273l-107.412 8.548v-229.338h107.405v38.822h-68.584v52.29c15.017 0 38.052-.778 51.768-.778v38.83zm-215.109-21.743v135.633c-13.965 1.557-26.398 3.371-39.593 5.442v-248.488h37.017l50.469 141.076v-141.076h38.83v232.436c-13.717 2.336-27.698 3.114-42.45 5.177z"
            fill="#e50914"
          />
        </HeaderNavBarLogo>
        <HeaderNavBarItems>
          <HeaderNavBarItem>
            <Link to={basePath}>
              Home
              {homeMatch && (
                <HeaderNavBarItemCircle layoutId="HeaderNavBarItemCircle" />
              )}
            </Link>
          </HeaderNavBarItem>
          <HeaderNavBarItem>
            <Link to={tvPath}>
              Tv Shows
              {tvMatch && (
                <HeaderNavBarItemCircle layoutId="HeaderNavBarItemCircle" />
              )}
            </Link>
          </HeaderNavBarItem>
        </HeaderNavBarItems>
      </HeaderNavBarColumn>
      <HeaderNavBarColumn>
        <HeaderNavBarSearchBox onClick={openSearchBoxHandler}>
          Search
          <HeaderNavBarSearchInput placeholder="Search for movie or TV show..." />
        </HeaderNavBarSearchBox>
      </HeaderNavBarColumn>
    </HeaderNavBarBase>
  );
};
