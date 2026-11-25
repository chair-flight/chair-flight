import { AirplaneAirbus320 } from "../outlines/airplane-airbus-320";
import { cn } from "../utils/cn";
import type { FC } from "react";

export const BackgroundForAirbus320QuestionBank: FC<{
  className?: string;
}> = ({ className }) => (
  <div
    aria-hidden="true"
    className={cn("pointer-events-none absolute inset-0 -z-1", className)}
  >
    <div
      className={cn(
        "absolute inset-0 text-accent opacity-80",
        "mask-[radial-gradient(ellipse_at_50%_48%,transparent_20%,#000_85%)]",
        "bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-size-[80px_80px] bg-position-[40px_40px]",
      )}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        fill="none"
      >
        <g stroke="currentColor" strokeWidth="1">
          <circle cx="100" cy="40" r="200" />
          <circle cx="100" cy="40" r="280" />
          <circle cx="100" cy="40" r="360" />
          <path d="M0 40h500M100 0v440" strokeDasharray="3 9" />
          <circle cx="1160" cy="820" r="240" />
          <circle cx="1160" cy="820" r="320" />
          <circle cx="1160" cy="820" r="400" />
          <path
            d="M-80 410C210 410 300 110 620 110S960 430 1280 430"
            strokeDasharray="5 10"
          />
          <path d="m610 110 10-10 10 10-10 10Z" />
        </g>
      </svg>
    </div>
    <AirplaneAirbus320
      className={cn(
        "absolute bottom-[7%] left-[4%] text-accent",
        "aspect-326/118 w-[92%]",
      )}
    />
  </div>
);
