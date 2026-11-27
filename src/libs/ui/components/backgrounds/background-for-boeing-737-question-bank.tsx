import { cn } from "../../utils/cn";
import { AirplaneBoeing737 } from "../outlines/airplane-boeing-737";
import type { FC } from "react";

export const BackgroundForBoeing737QuestionBank: FC<{
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
        "bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-size-[80px_80px]",
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
          <circle cx="1100" cy="80" r="180" />
          <circle cx="1100" cy="80" r="260" />
          <circle cx="1100" cy="80" r="340" />
          <path d="M720 80h480M1100 0v460" strokeDasharray="3 9" />
          <circle cx="100" cy="800" r="220" />
          <circle cx="100" cy="800" r="300" />
          <circle cx="100" cy="800" r="380" />
          <path
            d="M-80 640C220 640 220 180 620 180S980 420 1280 200"
            strokeDasharray="5 10"
          />
          <path d="m610 180 10-10 10 10-10 10Z" />
        </g>
      </svg>
    </div>
    <AirplaneBoeing737
      className={cn(
        "absolute bottom-[7%] left-[4%] text-accent",
        "aspect-326/118 w-[92%]",
      )}
    />
  </div>
);
