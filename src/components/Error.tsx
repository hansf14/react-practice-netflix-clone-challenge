import { styled } from "styled-components";
import { Button, Result, ResultProps } from "antd";
import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import { useNavigate } from "react-router-dom";
import { StyledComponentProps } from "@/utils";

const ErrorBase = styled(Result)`
  &&& .ant-result-icon .anticon {
    color: #ff4500;
  }
  &&& .ant-result-title {
    color: #fff;
  }
  &&& .ant-result-subtitle {
    color: #fff;
  }
`;

// const Buttons

const RefreshButton = styled(Button)`
  font-weight: bold;
  color: #000;
`;

const GoBackButton = styled(Button)`
  font-weight: bold;
  color: #000;
`;

type ErrorProps = {
  resultProps?: ResultProps;
} & StyledComponentProps<"div">;

export const Error = withMemoAndRef<"div", HTMLDivElement, ErrorProps>({
  displayName: "Error",
  Component: ({ resultProps = {}, ...otherProps }, ref) => {
    const navigate = useNavigate();

    const refreshPage = () => {
      navigate(0);
    };

    const goPrevPage = () => {
      navigate(-1);
    };

    return (
      <ErrorBase
        ref={ref}
        status="error"
        title="Error"
        subTitle="An error occurred while fetching the data."
        extra={[
          <RefreshButton key="refresh" onClick={refreshPage}>
            Refresh
          </RefreshButton>,
          <GoBackButton key="go-back" onClick={goPrevPage}>
            Go Back
          </GoBackButton>,
        ]}
        {...resultProps}
        {...otherProps}
      />
    );
  },
});
