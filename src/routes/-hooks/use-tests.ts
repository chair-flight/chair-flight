import { useLocalStorage } from "../../libs/ui/hooks/use-local-storage";
import type { Test } from "../../libs/core/tests/test";

const MAX_TESTS = 10;
const STORAGE_KEY = "chair-flight-test-history";

export const useTests = () => {
  const { value, update } = useLocalStorage<Test[]>(STORAGE_KEY);

  return {
    tests: value ?? [],
    saveTest: (testToSave: Test) => {
      const nextTest: Test =
        testToSave.mode === "exam" && testToSave.status === "created"
          ? {
              ...testToSave,
              status: "started",
              startedAtEpochMs: testToSave.startedAtEpochMs ?? Date.now(),
            }
          : testToSave;
      let keep = MAX_TESTS;
      while (keep > 0) {
        const saved = update((previous) => {
          const existing = previous ?? [];
          const exists = existing.some((test) => test.id === nextTest.id);
          const next = exists
            ? existing.map((test) =>
                test.id === nextTest.id ? nextTest : test,
              )
            : [...existing, nextTest];
          return next.slice(-keep);
        });
        if (saved) return;
        keep -= 1;
      }
    },
  };
};
