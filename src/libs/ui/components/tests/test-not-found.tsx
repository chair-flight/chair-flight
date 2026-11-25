import { Link } from "@tanstack/react-router";
import { Button } from "../base/button";
import type { FC } from "react";

export const TestNotFound: FC = () => (
  <div className="grid h-dvh place-items-center bg-canvas p-6 text-ink">
    <div className="flex max-w-sm flex-col items-center gap-4 text-center">
      <h1 className="m-0 text-xl font-semibold">Test not found</h1>
      <p className="m-0 text-sm text-muted">
        This test was abandoned, finished elsewhere, or is stored in another
        browser.
      </p>
      <Link to="/question-banks">
        <Button variant="primary">Back to modules</Button>
      </Link>
    </div>
  </div>
);
