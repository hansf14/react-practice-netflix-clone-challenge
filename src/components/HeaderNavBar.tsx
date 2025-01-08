import { useCallback, useRef, useState } from "react";
import { styled } from "styled-components";
import {
  motion,
  useAnimation,
  useMotionValueEvent,
  useScroll,
  Variants,
} from "motion/react";
import { Link, useMatch } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, InputRef, Modal } from "antd";
import { useClickAway, useMedia } from "react-use";
import { basePath } from "@/router";
import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import { SmartOmit, StyledComponentProps } from "@/utils";

const HeaderNavBarBase = styled(motion.nav)`
  z-index: 1000;
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

  @media (max-width: 400px) {
    & {
      margin: 0 15px 0 10px;
    }
  }
`;

const HeaderNavBarItems = styled.ul`
  display: flex;
  align-items: center;
`;

const HeaderNavBarItem = styled.li`
  position: relative;
  margin-right: 20px;
  &:last-child {
    margin-right: 0;
  }
  @media (max-width: 400px) {
    & {
      margin-right: 15px;
    }
  }
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
`;

type HeaderNavBarSearchBoxProps = {
  isSearchBoxOpen: boolean;
};

const HeaderNavBarSearchBox = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !["isSearchBoxOpen"].includes(prop),
})<HeaderNavBarSearchBoxProps>`
  position: relative;
  width: 40px;
  height: 40px;
  padding: 5px;
  margin-right: 10px;

  border: 1px solid #999;
  border-radius: 5px;
  display: flex;
  align-items: center;

  ${({ isSearchBoxOpen }) => (!isSearchBoxOpen ? "cursor: pointer;" : "")}
`;

const HeaderNavBarSearchInputContainer = styled.div`
  overflow: hidden;
`;

type HeaderNavBarSearchIconProps = {
  isSearchBoxOpen: boolean;
};

const HeaderNavBarSearchIcon = styled(SearchOutlined).withConfig({
  shouldForwardProp: (prop) => !["isSearchBoxOpen"].includes(prop),
})<HeaderNavBarSearchIconProps>`
  position: absolute;
  top: 50%;
  left: 50%;
  ${({ isSearchBoxOpen }) =>
    !isSearchBoxOpen
      ? `
        transform: translate3d(-50%, -50%, 0);
      `
      : `
        transform: translate3d(0, -50%, 0);
        left: 5px;
      `}

  cursor: pointer;

  svg {
    width: 28px;
    height: 28px;
  }
`;

const HeaderNavBarSearchInput = styled.input`
  all: unset;
  box-sizing: border-box;
  margin-left: 36px;

  // position: absolute;

  &::-webkit-input-placeholder {
    // width: fit-content;
    width: auto;
  }
`;

const HeaderNavBarSearchBoxModal = styled(Modal)`
  &&& .ant-modal-content {
    padding: 16px 20px;
  }
  &&& .ant-modal-close {
  }
  &&& .ant-btn {
  }
`;

const HeaderNavBarSearchBoxModalTitle = styled.div`
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: bold;
  color: #111;
`;

const HeaderNavBarSearchBoxModalBody = styled.div`
  margin-bottom: 15px;

  background-color: rgb(212, 238, 236, 0.5);
`;

const HeaderNavBarSearchBoxModalInput = styled(Input)`
  white-space: nowrap;
  overflow: hidden;

  font-weight: bold;
  color: #111;

  &::placeholder {
    font-weight: bold;
    color: #ccc;
  }
`;

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
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    transition: {
      type: "tween",
      duration: 1,
    },
  },
};

type HeaderNavBarProps = SmartOmit<
  {} & StyledComponentProps<"div">,
  "children"
>;

export const HeaderNavBar = withMemoAndRef<
  "nav",
  HTMLElement,
  HeaderNavBarProps
>({
  displayName: "HeaderNavBar",
  Component: (props, ref) => {
    const tvPath = `${basePath}/tv`;
    const homeMatch = useMatch(basePath);
    const tvMatch = useMatch(tvPath);

    const isSmallerEqual600px = useMedia("(max-width: 600px)");

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

    const [stateIsModalOpen, setStateIsModalOpen] = useState<boolean>(false);
    const refSearchBoxModalInput = useRef<InputRef | null>(null);

    const openModal = useCallback(() => {
      setStateIsModalOpen(true);
      setTimeout(() => {
        refSearchBoxModalInput.current?.focus({ cursor: "all" });
      }, 1);
    }, []);

    const closeModal = useCallback(() => {
      setStateIsModalOpen(false);
    }, []);

    const [stateIsSearchBoxOpen, setStateIsSearchBoxOpen] =
      useState<boolean>(false);

    const inputAnimation = useAnimation();

    const openSearchBoxHandler = useCallback(() => {
      // console.log("[openSearchBoxHandler]");

      setStateIsSearchBoxOpen(true);

      if (!isSmallerEqual600px) {
        inputAnimation.start({
          width: 260,
          transition: { ease: "easeInOut", duration: 0.3 },
        });
      } else {
        openModal();
      }
    }, [inputAnimation, isSmallerEqual600px, openModal]);

    const closeSearchBoxHandler = useCallback(() => {
      if (!isSmallerEqual600px && stateIsSearchBoxOpen) {
        inputAnimation.start({
          width: 40,
          transition: { ease: "easeInOut", duration: 0.3 },
          onAnimationEnd: () => setStateIsSearchBoxOpen(false),
        });
      } else if (isSmallerEqual600px && stateIsSearchBoxOpen) {
        setStateIsSearchBoxOpen(false);
        closeModal();
      }
    }, [inputAnimation, isSmallerEqual600px, stateIsSearchBoxOpen, closeModal]);

    const searchBoxClickAwayHander = useCallback(() => {
      if (!isSmallerEqual600px && stateIsSearchBoxOpen) {
        inputAnimation.start({
          width: 40,
          transition: { ease: "easeInOut", duration: 0.3 },
          onAnimationEnd: () => setStateIsSearchBoxOpen(false),
        });
      }
    }, [inputAnimation, isSmallerEqual600px, stateIsSearchBoxOpen]);

    const refSearchBox = useRef<HTMLDivElement | null>(null);
    useClickAway(refSearchBox, searchBoxClickAwayHander, ["click"]);

    const searchInputPlaceholderText = "Search for a movie or a TV show...";

    const [stateSearchBoxInputValue, setStateSearchBoxInputValue] =
      useState<string>("");

    const onChangeSearchBoxInput = useCallback((event: React.ChangeEvent) => {
      const element = event.target as HTMLInputElement;
      setStateSearchBoxInputValue(element.value);
    }, []);

    return (
      <>
        <HeaderNavBarBase
          ref={ref}
          variants={headerNavBarVariants}
          animate={headerNavBarAnimation}
          initial="top"
          {...props}
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
            <HeaderNavBarSearchBox
              ref={refSearchBox}
              animate={inputAnimation}
              isSearchBoxOpen={stateIsSearchBoxOpen}
              onClick={openSearchBoxHandler}
            >
              <HeaderNavBarSearchIcon isSearchBoxOpen={stateIsSearchBoxOpen} />
              <HeaderNavBarSearchInputContainer>
                <HeaderNavBarSearchInput
                  placeholder={searchInputPlaceholderText}
                  size={searchInputPlaceholderText.length}
                />
              </HeaderNavBarSearchInputContainer>
            </HeaderNavBarSearchBox>
          </HeaderNavBarColumn>
        </HeaderNavBarBase>
        <HeaderNavBarSearchBoxModal
          // centered
          width={"min(80%, 350px)"}
          open={stateIsModalOpen}
          title={
            <HeaderNavBarSearchBoxModalTitle>
              Search
            </HeaderNavBarSearchBoxModalTitle>
          }
          footer={[
            <Button key="submit" type="primary" onClick={() => {}}>
              Search
            </Button>,
          ]}
          onCancel={closeSearchBoxHandler}
        >
          <HeaderNavBarSearchBoxModalBody>
            <HeaderNavBarSearchBoxModalInput
              ref={refSearchBoxModalInput}
              placeholder={searchInputPlaceholderText}
              value={stateSearchBoxInputValue}
              onChange={onChangeSearchBoxInput}
            />
          </HeaderNavBarSearchBoxModalBody>
        </HeaderNavBarSearchBoxModal>
      </>
    );
  },
});
