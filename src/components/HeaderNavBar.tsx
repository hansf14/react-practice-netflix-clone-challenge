import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { SubmitHandler, useForm } from "react-hook-form";

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
  margin: 0 35px 0 10px;

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

const HeaderNavBarSearchBox = styled(motion.form).withConfig({
  shouldForwardProp: (prop) => !["isSearchBoxOpen"].includes(prop),
})<HeaderNavBarSearchBoxProps>`
  position: relative;
  width: 34px;
  height: 34px;
  padding: 2px 10px 2px 4px;
  margin-right: 10px;

  border: 1px solid #999;
  border-radius: 5px;
  display: flex;
  align-items: center;

  ${({ isSearchBoxOpen }) => (!isSearchBoxOpen ? "cursor: pointer;" : "")}
`;

const HeaderNavBarSearchBoxInputContainer = styled.div`
  overflow: hidden;
  margin-left: 30px;
  width: 100%;
`;

type HeaderNavBarSearchBoxSearchButtonProps = {
  isSearchBoxOpen: boolean;
};

const HeaderNavBarSearchBoxSearchButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !["isSearchBoxOpen"].includes(prop),
})<HeaderNavBarSearchBoxSearchButtonProps>`
  all: unset;
  box-sizing: border-box;

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

  width: 22px;
  height: 22px;
  svg {
    width: 22px;
    height: 22px;
  }
`;

const HeaderNavBarSearchBoxIcon = styled(SearchOutlined)``;

const HeaderNavBarSearchBoxInput = styled(Input)`
  // antd style unset
  &&& {
    all: unset;
    box-sizing: border-box;
    width: 100%;

    input {
      all: unset;
      box-sizing: border-box;
      width: 100%;

      &:hover {
        border-color: unset;
        background-color: unset;
      }
      &:focus-within {
        border-color: unset;
        box-shadow: unset;
        outline: 0;
        background-color: unset;
      }

      &::-webkit-input-placeholder {
        color: inherit;
        width: auto;
      }
    }
  }

  &&& {
    display: flex;

    & .ant-input-clear-icon {
      color: inherit;
    }
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

const HeaderNavBarSearchBoxModalBody = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

const HeaderNavBarSearchBoxModalInput = styled(Input.Search)`
  white-space: nowrap;
  overflow: hidden;

  font-weight: bold;
  color: #111;

  &::placeholder {
    font-weight: bold;
    color: #ccc;
  }
`;

const HeaderNavBarSearchBoxModalSearchButton = styled(Button)`
  &&& {
    font: inherit;
    font-weight: bold;

    svg {
      width: 26px;
      height: 26px;
    }
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

export interface FormData {
  keyword: string;
  keywordModal: string;
}

export type HeaderNavBarProps = SmartOmit<
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
    const searchBoxInputAnimation = useAnimation();

    const [stateIsSearchBoxOpen, setStateIsSearchBoxOpen] =
      useState<boolean>(false);
    const [stateIsModalOpen, setStateIsModalOpen] = useState<boolean>(false);

    const refSearchBoxModalInput = useRef<InputRef | null>(null);
    const refSearchBox = useRef<HTMLFormElement | null>(null);

    const { scrollY } = useScroll();

    const { register, handleSubmit, watch, setValue, setFocus } =
      useForm<FormData>();

    const searchBoxInputFormProps = useMemo(
      () => register("keyword", { required: true }),
      [register],
    );
    const [searchInputValue] = watch(["keyword"]);

    const {
      ref: searchBoxModalInputFormPropsRef,
      ...searchBoxModalInputFormProps
    } = useMemo(() => register("keywordModal", { required: true }), [register]);

    const searchBoxModalInputCbRef = useCallback(
      (instance: InputRef | null) => {
        refSearchBoxModalInput.current = instance;
        searchBoxModalInputFormPropsRef(instance?.input);
      },
      [searchBoxModalInputFormPropsRef],
    );

    const onValid = useCallback<SubmitHandler<FormData>>(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (data, event) => {
        console.log(data);
      },
      [],
    );

    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { unsubscribe } = watch((values, { name, type }) => {
        // console.log(values, name, type);
        if (values.keyword === values.keywordModal) {
          return;
        }

        if (name === "keyword") {
          setValue("keywordModal", values.keyword ?? "");
        } else if (name === "keywordModal") {
          setValue("keyword", values.keywordModal ?? "");
        }
      });
      return () => unsubscribe();
    }, [watch, setValue]);

    useMotionValueEvent(scrollY, "change", (latestValue) => {
      // console.log(latestValue);
      if (latestValue > 80) {
        headerNavBarAnimation.start("scroll");
      } else {
        headerNavBarAnimation.start("top");
      }
    });

    const openModal = useCallback(() => {
      setStateIsModalOpen(true);
      setTimeout(() => {
        refSearchBoxModalInput.current?.focus({ cursor: "all" });
      }, 1);
    }, []);

    const closeModal = useCallback(() => {
      setStateIsModalOpen(false);
    }, []);

    // const refS

    const openSearchBoxHandler = useCallback(() => {
      // console.log("[openSearchBoxHandler]");

      setStateIsSearchBoxOpen(true);

      if (!isSmallerEqual600px) {
        searchBoxInputAnimation
          .start({
            width: 270,
            transition: { ease: "easeInOut", duration: 0.3 },
          })
          .then(() => {
            setTimeout(() => {
              setFocus("keyword", { shouldSelect: true });
            }, 1);
          });
      } else {
        openModal();
      }
    }, [searchBoxInputAnimation, isSmallerEqual600px, openModal, setFocus]);

    const closeSearchBoxHandler = useCallback(() => {
      if (!isSmallerEqual600px && stateIsSearchBoxOpen) {
        searchBoxInputAnimation
          .start({
            width: 34,
            transition: { ease: "easeInOut", duration: 0.3 },
          })
          .then(() => {
            setStateIsSearchBoxOpen(false);
          });
      } else if (isSmallerEqual600px && stateIsSearchBoxOpen) {
        setStateIsSearchBoxOpen(false);
        closeModal();
      }
    }, [
      searchBoxInputAnimation,
      isSmallerEqual600px,
      stateIsSearchBoxOpen,
      closeModal,
    ]);

    const searchBoxClickAwayHandler = useCallback(() => {
      if (!isSmallerEqual600px && stateIsSearchBoxOpen) {
        searchBoxInputAnimation
          .start({
            width: 34,
            transition: { ease: "easeInOut", duration: 0.3 },
          })
          .then(() => {
            setStateIsSearchBoxOpen(false);
          });
      }
    }, [searchBoxInputAnimation, isSmallerEqual600px, stateIsSearchBoxOpen]);

    useClickAway(refSearchBox, searchBoxClickAwayHandler, ["click"]);

    useEffect(() => {
      window.addEventListener("resize", searchBoxClickAwayHandler);
      return () =>
        window.removeEventListener("resize", searchBoxClickAwayHandler);
    }, [searchBoxClickAwayHandler]);

    // const searchBoxInputValue = watch("keyword");
    // const searchBoxModalInputValue = watch("keywordModal");

    // // Sync searchBoxModalInput when searchBoxInput changes
    // useEffect(() => {
    //   if (searchBoxInputValue !== searchBoxModalInputValue) {
    //     setValue("keywordModal", searchBoxInputValue);
    //   }
    // }, [searchBoxInputValue, searchBoxModalInputValue, setValue]);

    // // Sync searchBoxInput when searchBoxModalInput changes
    // useEffect(() => {
    //   if (searchBoxModalInputValue !== searchBoxInputValue) {
    //     setValue("keyword", searchBoxModalInputValue);
    //   }
    // }, [searchBoxModalInputValue, searchBoxInputValue, setValue]);

    // const [stateSearchBoxInputValue, setStateSearchBoxInputValue] =
    //   useState<string>("");

    // const onChangeSearchBoxInput = useCallback((event: React.ChangeEvent) => {
    //   const element = event.target as HTMLInputElement;
    //   setStateSearchBoxInputValue(element.value);
    //   console.log(element.value);
    // }, []);

    const searchBoxInputPlaceholderText = "Search for a movie or a TV show...";

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
              animate={searchBoxInputAnimation}
              isSearchBoxOpen={stateIsSearchBoxOpen}
              onClick={openSearchBoxHandler}
              onSubmit={handleSubmit(onValid)}
            >
              <HeaderNavBarSearchBoxSearchButton
                type="submit"
                isSearchBoxOpen={stateIsSearchBoxOpen}
              >
                <HeaderNavBarSearchBoxIcon />
              </HeaderNavBarSearchBoxSearchButton>
              <HeaderNavBarSearchBoxInputContainer>
                <HeaderNavBarSearchBoxInput
                  placeholder={searchBoxInputPlaceholderText}
                  autoComplete="off"
                  allowClear
                  {...searchBoxInputFormProps}
                />
              </HeaderNavBarSearchBoxInputContainer>
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
          footer={null}
          onCancel={closeSearchBoxHandler}
        >
          <HeaderNavBarSearchBoxModalBody onSubmit={handleSubmit(onValid)}>
            <HeaderNavBarSearchBoxModalInput
              ref={searchBoxModalInputCbRef}
              placeholder={searchBoxInputPlaceholderText}
              autoComplete="off"
              allowClear
              value={searchInputValue}
              onSearch={(value, event) => {}}
              {...searchBoxModalInputFormProps}
            />
          </HeaderNavBarSearchBoxModalBody>
        </HeaderNavBarSearchBoxModal>
      </>
    );
  },
});
