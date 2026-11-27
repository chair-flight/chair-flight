import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "../../utils/cn";
import { CloseIcon } from "../icons/close-icon";
import type { FC } from "react";

type ToastTone = "default" | "error" | "success";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
  leaving: boolean;
};

const MAX_TOASTS = 5;
const TOAST_DURATION_MS = 4000;
const EXIT_DURATION_MS = 300;
const TOAST_GAP_PX = 8;
const TOAST_FALLBACK_HEIGHT_PX = 56;

const TONE_CLASSES: Record<ToastTone, { surface: string; bar: string }> = {
  default: { surface: "bg-paper", bar: "bg-accent" },
  error: { surface: "bg-danger-soft", bar: "bg-danger" },
  success: { surface: "bg-success-soft", bar: "bg-success" },
};

const listeners = new Set<() => void>();
let toastItems: ToastItem[] = [];
let lastToastId = 0;

const notifyListeners = () => {
  for (const listener of listeners) {
    listener();
  }
};

const subscribeToToasts = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getToastItems = () => toastItems;

const removeToasts = (ids: Set<number>) => {
  toastItems = toastItems.filter((item) => !ids.has(item.id));
  notifyListeners();
};

const dismiss = (id?: number) => {
  const ids = new Set(
    toastItems
      .filter((item) => !item.leaving && (id === undefined || item.id === id))
      .map((item) => item.id),
  );
  if (ids.size === 0) return;
  toastItems = toastItems.map((item) =>
    ids.has(item.id) ? { ...item, leaving: true } : item,
  );
  notifyListeners();
  window.setTimeout(() => removeToasts(ids), EXIT_DURATION_MS);
};

const addToast = (message: string, tone: ToastTone) => {
  const active = toastItems.filter((item) => !item.leaving);
  if (active.length >= MAX_TOASTS) dismiss(active[0].id);
  lastToastId += 1;
  const id = lastToastId;
  toastItems = [...toastItems, { id, message, tone, leaving: false }];
  notifyListeners();
  window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
};

const ToastCard: FC<{
  item: ToastItem;
  offset: number;
  onHeight: (id: number, height: number) => void;
}> = ({ item, offset, onHeight }) => {
  const [entered, setEntered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const tone = TONE_CLASSES[item.tone];

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new ResizeObserver(() =>
      onHeight(item.id, card.offsetHeight),
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [item.id, onHeight]);

  return (
    <div
      className="pointer-events-auto absolute right-0 bottom-0 w-75 transition-transform duration-300 ease-out"
      style={{ transform: `translateY(${-offset}px)` }}
    >
      <div
        ref={cardRef}
        className={cn(
          "relative flex min-h-14 flex-col justify-center overflow-hidden rounded-md shadow-lg",
          "transition-[translate,opacity] duration-300 ease-out",
          tone.surface,
          item.leaving && "translate-x-[calc(100%+1rem)] opacity-0",
          !item.leaving &&
            (entered ? "translate-y-0" : "translate-y-[calc(100%+1rem)]"),
        )}
      >
        <p className="m-0 px-2 py-2 pr-7 text-sm leading-5 font-semibold text-ink">
          {item.message}
        </p>
        <button
          type="button"
          aria-label="Close"
          onClick={() => dismiss(item.id)}
          className={cn(
            "absolute top-1 right-1 grid size-6 cursor-pointer place-items-center",
            "rounded-sm border-0 bg-transparent text-ink hover:text-accent",
          )}
        >
          <CloseIcon size={12} />
        </button>
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0 h-0.5 origin-left ease-linear",
            "transition-transform",
            tone.bar,
          )}
          style={{
            transform: entered ? "scaleX(0)" : "scaleX(1)",
            transitionDuration: `${TOAST_DURATION_MS}ms`,
          }}
        />
      </div>
    </div>
  );
};

const ToastList: FC = () => {
  const items = useSyncExternalStore(
    subscribeToToasts,
    getToastItems,
    getToastItems,
  );
  const [heights, setHeights] = useState<Record<number, number>>({});
  const reportHeight = useCallback((id: number, height: number) => {
    setHeights((previous) =>
      previous[id] === height ? previous : { ...previous, [id]: height },
    );
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-50 w-75"
    >
      {items.map((item) => {
        const newer = items.filter(
          (other) => !other.leaving && other.id > item.id,
        );
        const offset = newer.reduce(
          (sum, other) =>
            sum +
            (heights[other.id] ?? TOAST_FALLBACK_HEIGHT_PX) +
            TOAST_GAP_PX,
          0,
        );
        return (
          <ToastCard
            key={item.id}
            item={item}
            offset={offset}
            onHeight={reportHeight}
          />
        );
      })}
    </div>
  );
};

export const Toaster = Object.assign(ToastList, {
  toast: (message: string) => addToast(message, "default"),
  error: (message: string) => addToast(message, "error"),
  success: (message: string) => addToast(message, "success"),
  dismiss,
});
