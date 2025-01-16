import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { styled } from "styled-components";
import {
  motion,
  useAnimation,
  useMotionValueEvent,
  useScroll,
  Variants,
} from "motion/react";
import { Link, useMatch, useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import { SubmitHandler, useForm } from "react-hook-form";
import { SearchProps } from "antd/es/input";
import { Input, InputRef, Modal } from "antd";
import { useClickAway, useMedia } from "react-use";
import { BASE_PATH } from "@/api";
import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import { SmartOmit, StyledComponentProps } from "@/utils";
import { useStateWithCb } from "@/hooks/useStateWithCb";
// import DOMPurify from "dompurify";
import validator from "validator";
import qs from "qs";

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
  ${({ isSearchBoxOpen }) =>
    !isSearchBoxOpen
      ? `
        transform: translate3d(-50%, -50%, 0);
        left: 50%;
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
  &&& {
    font-weight: bold;
    color: inherit;

    input::placeholder {
      color: #999;
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
  query: string;
  queryModal: string;
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
    const tvShowsPath = `${BASE_PATH}/tv-shows`;
    const homeMatch = useMatch(BASE_PATH);
    const tvShowsMatch = useMatch(tvShowsPath);

    const isSmallerEqual600px = useMedia("(max-width: 600px)");

    const headerNavBarAnimation = useAnimation();
    const searchBoxInputAnimation = useAnimation();

    const [stateIsSearchBoxOpen, setStateIsSearchBoxOpen] =
      useState<boolean>(false);
    const [stateIsSubmit, setStateIsSubmit] = useState<boolean>(false);
    const { state: stateIsModalOpen, setState: setStateIsModalOpen } =
      useStateWithCb<boolean>({
        initialState: false,
      });

    const refSearchBox = useRef<HTMLFormElement | null>(null);
    const refSearchBoxModalInput = useRef<InputRef | null>(null);

    const { scrollY } = useScroll();

    const { register, handleSubmit, watch, setValue, setFocus } =
      useForm<FormData>();

    const { ref: searchBoxInputFormPropsRef, ...searchBoxInputFormOtherProps } =
      useMemo(() => register("query", { required: true }), [register]);

    const {
      ref: searchBoxModalInputFormPropsRef,
      ...searchBoxModalInputFormOtherProps
    } = useMemo(() => register("queryModal", { required: true }), [register]);

    const searchBoxInputCbRef = useCallback(
      (instance: InputRef | null) => {
        searchBoxInputFormPropsRef(instance?.nativeElement);
      },
      [searchBoxInputFormPropsRef],
    );

    const searchBoxModalInputCbRef = useCallback(
      (instance: InputRef | null) => {
        refSearchBoxModalInput.current = instance;
        searchBoxModalInputFormPropsRef(instance?.nativeElement);
      },
      [searchBoxModalInputFormPropsRef],
    );

    const [searchInputValue] = watch(["query"]);

    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { unsubscribe } = watch((values, { name, type }) => {
        // console.log(values, name, type);
        if (values.query === values.queryModal) {
          return;
        }

        if (name === "query") {
          setValue("queryModal", values.query ?? "");
        } else if (name === "queryModal") {
          setValue("query", values.queryModal ?? "");
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

    const navigate = useNavigate();

    const openModal = useCallback(
      (params?: { cb?: () => void }) => {
        setStateIsModalOpen({ newStateOrSetStateAction: true, cb: params?.cb });
        setTimeout(() => {
          refSearchBoxModalInput.current?.focus({ cursor: "all" });
        }, 1);
      },
      [setStateIsModalOpen],
    );

    const closeModal = useCallback(
      (params?: { cb?: () => void }) => {
        // console.log("[closeModal]");

        setStateIsModalOpen({
          newStateOrSetStateAction: false,
          cb: params?.cb,
        });
      },
      [setStateIsModalOpen],
    );

    const openSearchBoxHandler = useCallback(() => {
      // console.log("[openSearchBoxHandler]");

      if (!isSmallerEqual600px) {
        setStateIsSearchBoxOpen(true);
        searchBoxInputAnimation
          .start({
            width: 270,
            transition: { ease: "easeInOut", duration: 0.3 },
          })
          .then(() => {
            setTimeout(() => {
              setFocus("query", { shouldSelect: true });
            }, 1);
            setStateIsSubmit(true);
          });
      } else {
        setStateIsSearchBoxOpen(true);
        setStateIsSubmit(false);
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
            setStateIsSubmit(false);
          });
      } else if (isSmallerEqual600px && stateIsSearchBoxOpen) {
        setStateIsSearchBoxOpen(false);
        setStateIsSubmit(false);
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
            setStateIsSubmit(false);
          });
      }
    }, [searchBoxInputAnimation, isSmallerEqual600px, stateIsSearchBoxOpen]);

    useClickAway(refSearchBox, searchBoxClickAwayHandler, ["click"]);

    useEffect(() => {
      window.addEventListener("resize", searchBoxClickAwayHandler);
      return () =>
        window.removeEventListener("resize", searchBoxClickAwayHandler);
    }, [searchBoxClickAwayHandler]);

    const onValid = useCallback<SubmitHandler<FormData>>(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (data, event) => {
        console.log("[onValid]");

        if (data["query"] !== data["queryModal"]) {
          console.warn('data["query"] !== data["queryModal"]');
        }
        const rawInput = data["query"];
        // const sanitizedInput = DOMPurify.sanitize(rawInput);
        const escapedInput = validator.escape(rawInput);
        const queryString = qs.stringify({ query: escapedInput });

        // console.log(`${BASE_PATH}/search?${queryString}`);
        navigate(`${BASE_PATH}/search?${queryString}`);

        closeSearchBoxHandler();
      },
      [navigate, closeSearchBoxHandler],
    );

    const onSearchModalInputHandler = useCallback<
      NonNullable<SearchProps["onSearch"]>
    >(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (value, event, info) => {
        // console.log(value, event, info);
        handleSubmit(onValid)(event);
      },
      [handleSubmit, onValid],
    );

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
            <Link to={BASE_PATH}>
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
            </Link>
            <HeaderNavBarItems>
              <HeaderNavBarItem>
                <Link to={BASE_PATH}>
                  Home
                  {homeMatch && (
                    <HeaderNavBarItemCircle layoutId="HeaderNavBarItemCircle" />
                  )}
                </Link>
              </HeaderNavBarItem>
              <HeaderNavBarItem>
                <Link to={tvShowsPath}>
                  Tv Shows
                  {tvShowsMatch && (
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
                type={stateIsSubmit ? "submit" : "button"}
                isSearchBoxOpen={stateIsSearchBoxOpen}
              >
                <HeaderNavBarSearchBoxIcon />
              </HeaderNavBarSearchBoxSearchButton>
              <HeaderNavBarSearchBoxInputContainer>
                <HeaderNavBarSearchBoxInput
                  ref={searchBoxInputCbRef}
                  placeholder={searchBoxInputPlaceholderText}
                  autoComplete="off"
                  allowClear
                  value={searchInputValue}
                  {...searchBoxInputFormOtherProps}
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
              onSearch={onSearchModalInputHandler}
              {...searchBoxModalInputFormOtherProps}
            />
          </HeaderNavBarSearchBoxModalBody>
        </HeaderNavBarSearchBoxModal>
      </>
    );
  },
});
