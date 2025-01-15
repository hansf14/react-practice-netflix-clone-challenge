import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import {
  Error as ErrorComponent,
  ErrorProps as ErrorComponentProps,
} from "@/components/Error";

export const Error404 = withMemoAndRef<
  "div",
  HTMLDivElement,
  ErrorComponentProps
>({
  displayName: "Error404",
  Component: (props, ref) => {
    return (
      <ErrorComponent
        ref={ref}
        resultProps={{
          title: "Error 404",
          subTitle: "The page is not found.",
        }}
        {...props}
      />
    );
  },
});
