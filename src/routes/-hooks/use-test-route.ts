import { createContext, useContext } from "react";
import type { Test } from "../../libs/core/tests/test";

export const TestRouteContext = createContext<{
  test: Test;
  saveTest: (test: Test) => void;
} | null>(null);

export const useTestRoute = () => {
  const context = useContext(TestRouteContext);
  if (!context) throw new Error("Test route context is missing.");
  return context;
};
