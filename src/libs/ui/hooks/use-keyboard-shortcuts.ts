import { useEffect, useRef } from "react";

const CHAIN_TIMEOUT_MS = 2000;

export const useKeyboardShortcuts = (
  shortcuts: Record<string, (() => void) | undefined>,
) => {
  const shortcutsRef = useRef(shortcuts);
  const pendingStepsRef = useRef<string[]>([]);
  const chainTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  });

  useEffect(() => {
    const resetChain = () => {
      clearTimeout(chainTimeoutRef.current);
      pendingStepsRef.current = [];
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (["Meta", "Control", "Shift", "Alt"].includes(event.key)) return;
      if (event.altKey) return;
      const withModifier = event.metaKey || event.ctrlKey;
      const target = event.target;
      if (
        !withModifier &&
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        resetChain();
        return;
      }

      const step = `${withModifier ? "mod+" : ""}${event.key.toLowerCase()}`;
      const activeShortcuts = Object.entries(shortcutsRef.current).filter(
        ([, handler]) => handler,
      );

      const resolve = (steps: string[]) => {
        const chain = steps.join(" ");
        const match = activeShortcuts.find(([keys]) => keys === chain);
        if (match) return { handler: match[1], steps: [] };
        const isPrefix = activeShortcuts.some(([keys]) =>
          keys.startsWith(`${chain} `),
        );
        return { handler: undefined, steps: isPrefix ? steps : [] };
      };

      const continued = resolve([...pendingStepsRef.current, step]);
      const resolved =
        continued.handler || continued.steps.length > 0
          ? continued
          : resolve([step]);

      resetChain();
      if (!resolved.handler && resolved.steps.length === 0) return;
      event.preventDefault();
      if (resolved.handler) {
        resolved.handler();
        return;
      }
      pendingStepsRef.current = resolved.steps;
      chainTimeoutRef.current = setTimeout(resetChain, CHAIN_TIMEOUT_MS);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      resetChain();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
};
