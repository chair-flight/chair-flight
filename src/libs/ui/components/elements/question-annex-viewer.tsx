import { useEffect, useRef, useState } from "react";
import { parseAnnotatedAnnexHref } from "../../../core/question-templates/parse-annotated-annex-href";
import { useAnnexDimensions } from "../../hooks/use-annex-dimensions";
import { useKeyboardShortcuts } from "../../hooks/use-keyboard-shortcuts";
import { ArrowDownIcon } from "../../icons/arrow-down-icon";
import { CircleIcon } from "../../icons/circle-icon";
import { CloseIcon } from "../../icons/close-icon";
import { ExternalLinkIcon } from "../../icons/external-link-icon";
import { FitIcon } from "../../icons/fit-icon";
import { HandIcon } from "../../icons/hand-icon";
import { LineIcon } from "../../icons/line-icon";
import { PencilIcon } from "../../icons/pencil-icon";
import { TrashIcon } from "../../icons/trash-icon";
import { UndoIcon } from "../../icons/undo-icon";
import { ZoomInIcon } from "../../icons/zoom-in-icon";
import { ZoomOutIcon } from "../../icons/zoom-out-icon";
import { cn } from "../../utils/cn";
import { AnnexCanvas } from "../base/annex-canvas";
import { ButtonIcon } from "../base/button-icon";
import type { FC } from "react";
import type { QuestionBankRawQuestionAnnexAnnotation as Annotation } from "../../../core/content/question-bank-raw-question-annex-annotation";

type Tool = "hand" | "pencil" | "line" | "circle";

const MAX_SCALE = 12;
const DRAWING_COLORS = [
  { name: "Red", value: "#e11d48" },
  { name: "Green", value: "#16a34a" },
  { name: "Blue", value: "#2563eb" },
] as const;
const DRAWING_WIDTH_IN_PIXELS = 3;
const VIEW_MARGIN_IN_PIXELS = 8;

const TOOLS = [
  { tool: "hand", label: "Move", icon: HandIcon },
  { tool: "pencil", label: "Pencil", icon: PencilIcon },
  { tool: "line", label: "Line", icon: LineIcon },
  { tool: "circle", label: "Circle", icon: CircleIcon },
] as const;

type Point = [number, number];

const snapPoint = (origin: Point, point: Point): Point => {
  const deltaX = point[0] - origin[0];
  const deltaY = point[1] - origin[1];
  const step = Math.PI / 4;
  const angle = Math.round(Math.atan2(deltaY, deltaX) / step) * step;
  const length = Math.hypot(deltaX, deltaY);
  return [
    origin[0] + length * Math.cos(angle),
    origin[1] + length * Math.sin(angle),
  ];
};

const buildDraft = (
  tool: Tool,
  points: Point[],
  width: number,
  color: string,
  straightTo?: Point,
): Annotation | undefined => {
  const first = points[0];
  const last = straightTo ?? points[points.length - 1];
  if (!first || !last || tool === "hand") return undefined;
  if (tool === "line" || (tool === "pencil" && straightTo)) {
    return { type: "line", from: first, to: last, color, width };
  }
  if (tool === "pencil") {
    if (points.length < 2) return undefined;
    return { type: "path", points, color, width };
  }
  return {
    type: "circle",
    x: first[0],
    y: first[1],
    r: Math.hypot(last[0] - first[0], last[1] - first[1]),
    stroke: color,
    width,
  };
};

const saveFile = (url: string, name: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
};

const downloadAnnex = async (
  svg: SVGSVGElement | null | undefined,
  src: string,
  annotated: boolean,
) => {
  const fileName = src.split("/").pop() ?? "annex";
  if (!svg || !annotated) {
    saveFile(src, fileName);
    return;
  }
  const standalone = svg.cloneNode(true) as SVGSVGElement;
  const [, , width, height] = (standalone.getAttribute("viewBox") ?? "")
    .split(" ")
    .map(Number);
  standalone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  standalone.setAttribute("width", String(width));
  standalone.setAttribute("height", String(height));
  standalone.removeAttribute("class");
  const baseResponse = await fetch(src);
  if (!baseResponse.ok) {
    saveFile(src, fileName);
    return;
  }
  const baseBlob = await baseResponse.blob();
  const baseUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(baseBlob);
  });
  standalone.querySelector("image")?.setAttribute("href", baseUrl);
  const markup = new XMLSerializer().serializeToString(standalone);
  const url = URL.createObjectURL(
    new Blob([markup], { type: "image/svg+xml" }),
  );
  saveFile(url, `${fileName.replace(/\.[^.]+$/, "")}-annotated.svg`);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

export const QuestionAnnexViewer: FC<{
  href: string;
  drawings?: Annotation[];
  onDrawingsChange?: (drawings: Annotation[]) => void;
  onClose?: () => void;
}> = ({ href, drawings = [], onDrawingsChange, onClose }) => {
  const [selectedTool, setTool] = useState<Tool>("hand");
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [color, setColor] = useState<string>(DRAWING_COLORS[0].value);
  const [drawing, setDrawing] = useState<{
    points: Point[];
    width: number;
    straightTo?: Point;
  }>();
  const [panning, setPanning] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef({ pointerX: 0, pointerY: 0, x: 0, y: 0 });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{
    distance: number;
    midX: number;
    midY: number;
    view: { scale: number; x: number; y: number };
  }>(undefined);
  const gestureEndedRef = useRef(false);
  const [hrefWithoutFragment, fragment = ""] = href.split("#");
  const editable =
    fragment.split(":").includes("editable") && Boolean(onDrawingsChange);
  const hrefSegments = hrefWithoutFragment.split("?")[0].split("/");
  const annexId = hrefSegments.pop()?.replace(/\.[^.]+$/, "") ?? "";
  const questionBank = hrefSegments.pop() ?? "";
  const query = hrefWithoutFragment.split("?")[1];
  const extractQuery = [query, editable ? "editable=true" : undefined]
    .filter(Boolean)
    .join("&");
  const tool = editable ? selectedTool : "hand";
  const annotated = parseAnnotatedAnnexHref(href);
  const src = annotated?.href ?? href.split("#")[0].split("?")[0];
  const dimensions = useAnnexDimensions(src, {
    width: annotated?.width,
    height: annotated?.height,
  });
  const addDrawing = (drawing: Annotation) =>
    onDrawingsChange?.([...drawings, drawing]);
  const undoDrawing = () => onDrawingsChange?.(drawings.slice(0, -1));
  const clearDrawings = () => onDrawingsChange?.([]);

  useKeyboardShortcuts({ "mod+z": undoDrawing });

  const fitScale = dimensions
    ? Math.min(
        (viewport.width - VIEW_MARGIN_IN_PIXELS * 2) / dimensions.width,
        (viewport.height - VIEW_MARGIN_IN_PIXELS * 2) / dimensions.height,
      )
    : 0;
  const fittedWidth = dimensions ? dimensions.width * fitScale : 0;
  const fittedHeight = dimensions ? dimensions.height * fitScale : 0;
  const baseLeft = (viewport.width - fittedWidth) / 2;
  const baseTop = (viewport.height - fittedHeight) / 2;
  const draft = drawing
    ? buildDraft(tool, drawing.points, drawing.width, color, drawing.straightTo)
    : undefined;

  const zoomAt = (factor: number, pointX: number, pointY: number) =>
    setView((current) => {
      const scale = Math.min(MAX_SCALE, Math.max(1, current.scale * factor));
      if (scale === 1) return { scale, x: 0, y: 0 };
      const localX = pointX - baseLeft;
      const localY = pointY - baseTop;
      const ratio = scale / current.scale;
      return {
        scale,
        x: localX - ratio * (localX - current.x),
        y: localY - ratio * (localY - current.y),
      };
    });

  const zoomAtCenter = (factor: number) =>
    zoomAt(factor, viewport.width / 2, viewport.height / 2);

  const wheelHandlerRef = useRef((_event: WheelEvent) => {});
  wheelHandlerRef.current = (event) => {
    event.preventDefault();
    const bounds = viewportRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const speed = event.ctrlKey ? 0.01 : 0.0015;
    zoomAt(
      Math.exp(-event.deltaY * speed),
      event.clientX - bounds.left,
      event.clientY - bounds.top,
    );
  };

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setViewport({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(element);
    const handleWheel = (event: WheelEvent) => wheelHandlerRef.current(event);
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      observer.disconnect();
      element.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const readImagePoint = (clientX: number, clientY: number) => {
    const bounds = contentRef.current?.getBoundingClientRect();
    if (!bounds || !dimensions) return undefined;
    return {
      point: [
        ((clientX - bounds.left) / bounds.width) * dimensions.width,
        ((clientY - bounds.top) / bounds.height) * dimensions.height,
      ] as Point,
      width: (DRAWING_WIDTH_IN_PIXELS * dimensions.width) / bounds.width,
    };
  };

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col bg-canvas",
        "h-[min(calc(100dvh-1rem),1080px)] max-h-full",
        "w-[min(calc(100vw-1rem),1920px)] max-w-full",
      )}
    >
      <div
        className={cn(
          "flex h-12 flex-none items-center gap-1 overflow-x-auto",
          "border-b border-rule bg-paper px-2",
        )}
      >
        {editable && (
          <>
            {TOOLS.map(({ tool: toolName, label, icon }) => (
              <ButtonIcon
                key={toolName}
                label={label}
                icon={icon}
                active={tool === toolName}
                onClick={() => setTool(toolName)}
              />
            ))}
            <div className="mx-1 h-5 w-px flex-none bg-rule" />
            <div className="flex flex-none items-center gap-3 px-2">
              {DRAWING_COLORS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-label={option.name}
                  title={option.name}
                  aria-pressed={color === option.value}
                  onClick={() => setColor(option.value)}
                  className={cn(
                    "size-5 flex-none cursor-pointer rounded-full border-0",
                    color === option.value &&
                      "ring-2 ring-ink ring-offset-2 ring-offset-paper",
                  )}
                  style={{ backgroundColor: option.value }}
                />
              ))}
            </div>
            <div className="mx-1 h-5 w-px flex-none bg-rule" />
            <ButtonIcon
              label="Undo last drawing"
              icon={UndoIcon}
              disabled={drawings.length === 0}
              onClick={undoDrawing}
            />
            <ButtonIcon
              label="Clear drawings"
              icon={TrashIcon}
              disabled={drawings.length === 0}
              onClick={clearDrawings}
            />
            <div className="mx-1 h-5 w-px flex-none bg-rule" />
          </>
        )}
        <ButtonIcon
          label="Zoom out"
          icon={ZoomOutIcon}
          disabled={view.scale <= 1}
          onClick={() => zoomAtCenter(1 / 1.5)}
        />
        <span className="w-10 flex-none text-center text-xs tabular-nums">
          {Math.round(view.scale * 100)}%
        </span>
        <ButtonIcon
          label="Zoom in"
          icon={ZoomInIcon}
          disabled={view.scale >= MAX_SCALE}
          onClick={() => zoomAtCenter(1.5)}
        />
        <ButtonIcon
          label="Fit to screen"
          icon={FitIcon}
          disabled={view.scale === 1}
          onClick={() => setView({ scale: 1, x: 0, y: 0 })}
        />
        <div className="mx-1 h-5 w-px flex-none bg-rule" />
        <ButtonIcon
          label="Download"
          icon={ArrowDownIcon}
          onClick={() =>
            downloadAnnex(
              contentRef.current?.querySelector("svg"),
              src,
              (annotated?.annotations.length ?? 0) + drawings.length > 0,
            )
          }
        />
        {onClose && (
          <ButtonIcon
            label="Open in new window"
            icon={ExternalLinkIcon}
            onClick={() =>
              window.open(
                `/question-banks/${questionBank}/annex/${annexId}${extractQuery ? `?${extractQuery}` : ""}`,
                "_blank",
              )
            }
          />
        )}
        {onClose && (
          <ButtonIcon
            label="Close"
            icon={CloseIcon}
            className="ml-auto"
            onClick={onClose}
          />
        )}
      </div>
      <div
        ref={viewportRef}
        className={cn(
          "relative min-h-0 flex-1 touch-none select-none overflow-hidden",
          tool === "hand"
            ? panning
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-crosshair",
        )}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          const pointers = pointersRef.current;
          pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
          if (pointers.size >= 2) {
            const [first, second] = [...pointers.values()];
            const bounds = event.currentTarget.getBoundingClientRect();
            pinchRef.current = {
              distance: Math.hypot(first.x - second.x, first.y - second.y) || 1,
              midX: (first.x + second.x) / 2 - bounds.left,
              midY: (first.y + second.y) / 2 - bounds.top,
              view,
            };
            gestureEndedRef.current = true;
            setDrawing(undefined);
            setPanning(false);
            return;
          }
          if (tool === "hand") {
            panStartRef.current = {
              pointerX: event.clientX,
              pointerY: event.clientY,
              x: view.x,
              y: view.y,
            };
            setPanning(true);
            return;
          }
          const start = readImagePoint(event.clientX, event.clientY);
          if (start) setDrawing({ points: [start.point], width: start.width });
        }}
        onPointerMove={(event) => {
          const pointers = pointersRef.current;
          if (pointers.has(event.pointerId))
            pointers.set(event.pointerId, {
              x: event.clientX,
              y: event.clientY,
            });
          const pinch = pinchRef.current;
          if (pinch && pointers.size >= 2) {
            const [first, second] = [...pointers.values()];
            const bounds = event.currentTarget.getBoundingClientRect();
            const midX = (first.x + second.x) / 2 - bounds.left;
            const midY = (first.y + second.y) / 2 - bounds.top;
            const scale = Math.min(
              MAX_SCALE,
              Math.max(
                1,
                (pinch.view.scale *
                  Math.hypot(first.x - second.x, first.y - second.y)) /
                  pinch.distance,
              ),
            );
            const anchorX =
              (pinch.midX - baseLeft - pinch.view.x) / pinch.view.scale;
            const anchorY =
              (pinch.midY - baseTop - pinch.view.y) / pinch.view.scale;
            setView(
              scale === 1
                ? { scale, x: 0, y: 0 }
                : {
                    scale,
                    x: midX - baseLeft - scale * anchorX,
                    y: midY - baseTop - scale * anchorY,
                  },
            );
            return;
          }
          if (gestureEndedRef.current) return;
          if (panning) {
            const start = panStartRef.current;
            setView((current) => ({
              ...current,
              x: start.x + event.clientX - start.pointerX,
              y: start.y + event.clientY - start.pointerY,
            }));
            return;
          }
          if (!drawing) return;
          const next = readImagePoint(event.clientX, event.clientY);
          const origin = drawing.points[0];
          if (!next || !origin) return;
          const straight = event.shiftKey;
          if (tool === "pencil") {
            setDrawing(
              straight
                ? { ...drawing, straightTo: snapPoint(origin, next.point) }
                : {
                    width: drawing.width,
                    points: [...drawing.points, next.point],
                  },
            );
            return;
          }
          setDrawing({
            width: drawing.width,
            points: [
              origin,
              straight && tool === "line"
                ? snapPoint(origin, next.point)
                : next.point,
            ],
          });
        }}
        onPointerUp={(event) => {
          const pointers = pointersRef.current;
          pointers.delete(event.pointerId);
          if (pointers.size < 2) pinchRef.current = undefined;
          if (pointers.size === 0 && gestureEndedRef.current) {
            gestureEndedRef.current = false;
            return;
          }
          if (gestureEndedRef.current) return;
          setPanning(false);
          if (draft) addDrawing(draft);
          setDrawing(undefined);
        }}
        onPointerCancel={(event) => {
          pointersRef.current.delete(event.pointerId);
          pinchRef.current = undefined;
          if (pointersRef.current.size === 0) gestureEndedRef.current = false;
          setPanning(false);
          setDrawing(undefined);
        }}
      >
        {dimensions && viewport.width > 0 && (
          <div
            ref={contentRef}
            className="absolute origin-top-left"
            style={{
              left: baseLeft,
              top: baseTop,
              width: fittedWidth,
              height: fittedHeight,
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            }}
          >
            <AnnexCanvas
              href={href}
              drawings={drawings}
              draft={draft}
              className="pointer-events-none size-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};
