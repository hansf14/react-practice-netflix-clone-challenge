import { styled } from "styled-components";
import { Button, Result, ResultProps } from "antd";
import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import { useNavigate } from "react-router-dom";
import { StyledComponentProps } from "@/utils";
import { useDomainBoundNavigateBack } from "@/hooks/useDomainBoundNavigateBack";
import { BASE_PATH } from "@/api";

const ErrorBase = styled(Result)`
  align-self: center;
  margin: auto;

  &&& .ant-result-icon .anticon {
    color: #e50914;
  }
  &&& .ant-result-title {
    color: #fff;
  }
  &&& .ant-result-subtitle {
    color: #fff;
  }
  &&& .ant-result-extra {
    display: flex;
    justify-content: center;
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
`;

const RefreshButton = styled(Button)`
  font-weight: bold;
  color: #000;
`;

const GoBackButton = styled(Button)`
  font-weight: bold;
  color: #000;
`;

export type ErrorProps = {
  resultProps?: ResultProps;
} & StyledComponentProps<"div">;

export const Error = withMemoAndRef<"div", HTMLDivElement, ErrorProps>({
  displayName: "Error",
  Component: ({ resultProps = {}, ...otherProps }, ref) => {
    const { domainBoundNavigateBack } = useDomainBoundNavigateBack();
    const navigate = useNavigate();

    const refreshPage = () => {
      navigate(0);
    };

    const goPrevPage = () => {
      domainBoundNavigateBack({ basePath: BASE_PATH });
    };

    return (
      <ErrorBase
        ref={ref}
        status="error"
        title="Error"
        subTitle="An error occurred while fetching the data."
        extra={[
          <Buttons key="buttons">
            <RefreshButton
              // key="refresh"
              onClick={refreshPage}
            >
              Refresh
            </RefreshButton>
            <GoBackButton
              //  key="go-back"
              onClick={goPrevPage}
            >
              Go Back
            </GoBackButton>
          </Buttons>,
        ]}
        {...resultProps}
        {...otherProps}
      />
    );
  },
});
