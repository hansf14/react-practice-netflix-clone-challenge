import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import { StyledComponentProps } from "@/utils";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin, SpinProps } from "antd";
import { css, styled } from "styled-components";

const LoaderBase = styled.div`
  display: contents;

  &&& .ant-spin {
    max-height: auto;
  }
  &&& .ant-spin-text {
    text-shadow: none;
  }
  &&& .ant-spin-container {
    // opacity: unset;

    &::after {
      opacity: unset;
      background: unset;
    }
  }
`;

type SpinnerProps = {
  css?: ReturnType<typeof css>;
};

const Spinner = styled(Spin)<SpinnerProps>`
  color: #fff;
  // font-size: 48px;

  ${({ css }) => css}
`;

export type LoaderProps = {
  spinnerProps?: SpinProps;
  spinnerCss?: ReturnType<typeof css>;
} & StyledComponentProps<"div">;

export const Loader = withMemoAndRef<"div", HTMLDivElement, LoaderProps>({
  displayName: "Loader",
  Component: ({ spinnerProps, children, ...otherProps }, ref) => {
    const {
      size = "large",
      tip = "Loading...",
      indicator = <LoadingOutlined spin />,
      ...otherSpinnerProps
    } = spinnerProps ?? {};
    return (
      <LoaderBase ref={ref} {...otherProps}>
        <Spinner
          size={size}
          tip={tip}
          indicator={indicator}
          {...otherSpinnerProps}
        >
          {children}
        </Spinner>
      </LoaderBase>
    );
  },
});
