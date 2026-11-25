import type { ErrorComponentProps } from "@tanstack/react-router";
import type { FC } from "react";

export const ErrorPage: FC<ErrorComponentProps> = () => {
  return (
    <div className="mx-auto max-w-md p-10 text-center text-muted">
      Something went wrong.{" "}
      <a className="text-accent underline" href="/">
        Go to the home page
      </a>
    </div>
  );
};
