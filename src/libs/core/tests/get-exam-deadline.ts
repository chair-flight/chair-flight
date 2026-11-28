import type { Test } from "./test.ts";

export const getExamDeadline = (
  test: Pick<Test, "createdAtEpochMs" | "startedAtEpochMs" | "durationInMs">,
) => (test.startedAtEpochMs ?? test.createdAtEpochMs) + test.durationInMs;
