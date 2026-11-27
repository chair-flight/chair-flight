import { cn } from "../../utils/cn";
import { AirplaneCessna172 } from "../outlines/airplane-cessna-172";
import type { FC } from "react";

export const BackgroundForPplQuestionBank: FC<{
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
        "bg-[repeating-linear-gradient(45deg,currentColor_0_1px,transparent_1px_72px),repeating-linear-gradient(-45deg,currentColor_0_1px,transparent_1px_72px)]",
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
          <g transform="rotate(-32 900 260)">
            <path d="M640 245h520v30H640Z" />
            <path d="M670 260h460" strokeDasharray="16 12" />
            <path d="M610 260h-40m620 0h40" strokeDasharray="3 9" />
          </g>
          <path d="M120 140 420 60 520 330 220 410Z" strokeDasharray="5 10" />
          <path d="m255 100 14-8-2 16Zm196 210-2-16 14 8Z" />
          <path d="M80 620 330 480 560 600 330 760Z" />
          <path d="M330 480v280M80 620h480" strokeDasharray="3 9" />
          <path d="m330 536 24 42h-48Z" />
          <path
            d="M-60 780C220 700 420 640 660 520S1020 360 1280 380"
            strokeDasharray="2 8"
          />
          <path d="m1000 390 20-14 4 24Z" />
          <circle cx="1060" cy="640" r="46" />
          <circle cx="1060" cy="640" r="92" strokeDasharray="3 9" />
          <path
            d="m1060 584 18 40h-36ZM970 730l180-180"
            strokeDasharray="3 9"
          />
        </g>
      </svg>
    </div>
    <AirplaneCessna172
      className={cn(
        "absolute right-[10%] bottom-[7%] text-accent",
        "aspect-1020/410 w-[74%]",
      )}
    />
  </div>
);
