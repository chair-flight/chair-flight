import { useId } from "react";
import { useAnnexDimensions } from "../../hooks/use-annex-dimensions";
import { cn } from "../../utils/cn";
import type { FC } from "react";
import type { QuestionBankRawQuestionAnnexAnnotation as Annotation } from "../../../core/content/question-bank-raw-question-annex-annotation";

const renderAnnotation = (
  annotation: Annotation,
  index: number,
  markerId: string,
) => {
  if (annotation.type === "text") {
    const { x, y, text, size = 24, rotation, color, weight } = annotation;
    const anchorX = Array.isArray(x) ? x[0] : x;
    return (
      <text
        key={index}
        x={Array.isArray(x) ? x.join(" ") : x}
        y={y}
        dy="0.35em"
        fontSize={size}
        fontWeight={weight}
        fontFamily="Helvetica, Arial, sans-serif"
        textAnchor={annotation.anchor ?? "start"}
        fill={color ?? "#0d33a6"}
        transform={
          rotation ? `rotate(${-rotation} ${anchorX} ${y})` : undefined
        }
      >
        {text}
      </text>
    );
  }
  if (annotation.type === "line") {
    return (
      <line
        key={index}
        x1={annotation.from[0]}
        y1={annotation.from[1]}
        x2={annotation.to[0]}
        y2={annotation.to[1]}
        stroke={annotation.color ?? "#0d33a6"}
        strokeWidth={annotation.width ?? 4}
        strokeDasharray={annotation.dash}
        strokeLinecap="round"
        markerEnd={annotation.arrow ? `url(#${markerId})` : undefined}
      />
    );
  }
  if (annotation.type === "path") {
    return (
      <polyline
        key={index}
        points={annotation.points.map((point) => point.join(",")).join(" ")}
        fill="none"
        stroke={annotation.color ?? "#0d33a6"}
        strokeWidth={annotation.width ?? 4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
  if (annotation.type === "circle") {
    return (
      <circle
        key={index}
        cx={annotation.x}
        cy={annotation.y}
        r={annotation.r}
        stroke={annotation.stroke}
        fill={annotation.fill ?? "none"}
        strokeWidth={annotation.width}
      />
    );
  }
  return (
    <rect
      key={index}
      x={annotation.x}
      y={annotation.y}
      width={annotation.width}
      height={annotation.height}
      rx={annotation.radius}
      stroke={annotation.stroke}
      fill={annotation.fill ?? "none"}
      strokeWidth={annotation.strokeWidth}
    />
  );
};

export const AnnexCanvas: FC<{
  href: string;
  width?: number;
  height?: number;
  annotations?: Annotation[];
  alt?: string;
  crop?: boolean;
  drawings?: Annotation[];
  draft?: Annotation;
  className?: string;
}> = ({
  href,
  width,
  height,
  annotations = [],
  alt = "Annex",
  crop,
  drawings = [],
  draft,
  className,
}) => {
  const markerId = useId();
  const src = href;
  const dimensions = useAnnexDimensions(src, {
    width,
    height,
  });

  if (!dimensions)
    return (
      <img
        src={src}
        alt={alt}
        className={cn("block bg-white object-cover object-top", className)}
      />
    );

  return (
    <svg
      role="img"
      aria-label={alt}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      preserveAspectRatio={crop ? "xMidYMin slice" : "xMidYMid meet"}
      className={cn("block bg-white", className)}
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 2L10 5L0 8z" fill="context-stroke" />
        </marker>
      </defs>
      <image href={src} width={dimensions.width} height={dimensions.height} />
      {[...annotations, ...drawings, ...(draft ? [draft] : [])].map(
        (annotation, index) => renderAnnotation(annotation, index, markerId),
      )}
    </svg>
  );
};
