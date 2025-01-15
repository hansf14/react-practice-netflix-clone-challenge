import { withMemoAndRef } from "@/hocs/withMemoAndRef";
import {
  Error as ErrorComponent,
  ErrorProps as ErrorComponentProps,
} from "@/components/Error";

export const Error400 = withMemoAndRef<
  "div",
  HTMLDivElement,
  ErrorComponentProps
>({
  displayName: "Error400",
  Component: (props, ref) => {
    return (
      <ErrorComponent
        ref={ref}
        resultProps={{
          title: "Error 400",
          subTitle: "Bad request",
        }}
        {...props}
      />
    );
  },
});
