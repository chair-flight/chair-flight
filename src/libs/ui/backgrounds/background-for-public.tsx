import { GraphicPropeller } from "../outlines/graphic-propeller";
import { GraphicTurbofan } from "../outlines/graphic-turbofan";
import { GraphicWing } from "../outlines/graphic-wing";
import { GraphicYoke } from "../outlines/graphic-yoke";
import { cn } from "../utils/cn";
import type { FC } from "react";

export const BackgroundForPublic: FC = () => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-10 bottom-0 -z-1",
        "overflow-hidden text-accent opacity-[0.48] max-sm:opacity-[0.38]",
        "mask-[radial-gradient(ellipse_at_50%_48%,transparent_13%,rgb(0_0_0/0.18)_30%,#000_58%)]",
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 960"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
        className="absolute inset-0 size-full"
      >
        <g opacity="0.35" strokeWidth="0.7">
          {Array.from({ length: 37 }, (_, index) => (
            <path key={`v${index}`} d={`M${index * 40} 0v960`} />
          ))}
          {Array.from({ length: 25 }, (_, index) => (
            <path key={`h${index}`} d={`M0 ${index * 40}h1440`} />
          ))}
        </g>
        <g
          className="max-sm:transform-[translate(535px,120px)_scale(0.65)]"
          transform="translate(175 210)"
        >
          <GraphicTurbofan x={-300} y={-300} width={600} height={600} />
        </g>
        <g
          className="max-sm:transform-[translate(940px,140px)_rotate(28deg)_scale(0.65)]"
          transform="translate(1190 185) rotate(28)"
        >
          <GraphicPropeller x={-265} y={-265} width={530} height={530} />
        </g>
        <g
          className="max-sm:transform-[translate(430px,810px)_rotate(-18deg)_scale(0.6)]"
          transform="translate(60 740) rotate(-18)"
        >
          <GraphicWing x={-30} y={-240} width={606} height={430} />
        </g>
        <g
          className="max-sm:transform-[translate(890px,810px)_rotate(-12deg)_scale(0.7)]"
          transform="translate(1170 745) rotate(-12)"
        >
          <GraphicYoke x={-245} y={-245} width={490} height={490} />
        </g>
        <g opacity="0.55" strokeWidth="0.8">
          <path
            d="M490 0v235h260M950 960V730H720M0 580h260M1440 495h-245"
            strokeDasharray="8 7"
          />
          <circle cx="490" cy="235" r="5" />
          <circle cx="950" cy="730" r="5" />
          <path d="M695 110h50m-25-25v50M695 850h50m-25-25v50" />
          <path d="M530 150Q720 45 915 150M540 800Q720 910 900 800" />
        </g>
      </svg>
    </div>
  );
};
