import { AirplaneTecnamP2006t } from "../outlines/airplane-tecnam-p2006t";
import { cn } from "../utils/cn";
import type { FC } from "react";

export const BackgroundForAtplQuestionBank: FC<{
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
          <g transform="translate(1040 620)">
            <circle r="150" />
            <circle r="104" strokeDasharray="3 9" />
            <circle r="30" />
            <path d="M0.0 -150.0L0.0 -168.0M26.0 -147.7L27.1 -153.6M51.3 -141.0L53.4 -146.6M75.0 -129.9L81.0 -140.3M96.4 -114.9L100.3 -119.5M114.9 -96.4L119.5 -100.3M129.9 -75.0L140.3 -81.0M141.0 -51.3L146.6 -53.4M147.7 -26.0L153.6 -27.1M150.0 -0.0L168.0 -0.0M147.7 26.0L153.6 27.1M141.0 51.3L146.6 53.4M129.9 75.0L140.3 81.0M114.9 96.4L119.5 100.3M96.4 114.9L100.3 119.5M75.0 129.9L81.0 140.3M51.3 141.0L53.4 146.6M26.0 147.7L27.1 153.6M0.0 150.0L0.0 168.0M-26.0 147.7L-27.1 153.6M-51.3 141.0L-53.4 146.6M-75.0 129.9L-81.0 140.3M-96.4 114.9L-100.3 119.5M-114.9 96.4L-119.5 100.3M-129.9 75.0L-140.3 81.0M-141.0 51.3L-146.6 53.4M-147.7 26.0L-153.6 27.1M-150.0 0.0L-168.0 0.0M-147.7 -26.0L-153.6 -27.1M-141.0 -51.3L-146.6 -53.4M-129.9 -75.0L-140.3 -81.0M-114.9 -96.4L-119.5 -100.3M-96.4 -114.9L-100.3 -119.5M-75.0 -129.9L-81.0 -140.3M-51.3 -141.0L-53.4 -146.6M-26.0 -147.7L-27.1 -153.6" />
            <path d="M-190 0h380M0 -190v380" strokeDasharray="3 9" />
            <path d="m0 -60 14 30h-28Z" />
          </g>
          <rect
            x="90"
            y="90"
            width="460"
            height="190"
            rx="95"
            strokeDasharray="5 10"
          />
          <path d="M170 185h300" />
          <path d="M170 165h300v40H170Z" />
          <path d="M190 185h260" strokeDasharray="14 10" />
          <path d="m300 94 14-6v12Zm0 183-14-6v12Z" />
          <path
            d="M-80 520C160 520 220 420 420 460S720 640 900 560"
            strokeDasharray="2 8"
          />
          <path d="m890 566 12-14 8 16Z" />
          <circle cx="150" cy="700" r="60" />
          <circle cx="150" cy="700" r="100" strokeDasharray="3 9" />
          <path d="M30 700h240M150 580v240" strokeDasharray="3 9" />
        </g>
      </svg>
    </div>
    <AirplaneTecnamP2006t
      className={cn(
        "absolute bottom-[7%] left-[4%] text-accent",
        "aspect-326/118 w-[92%]",
      )}
    />
  </div>
);
