import type { FC, SVGProps } from "react";

export const SubjectAtplGeneralNavigation: FC<SVGProps<SVGSVGElement>> = (
  props,
) => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 160 160"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <g transform="translate(-12 12.15) scale(1.15)">
      <circle cx="80" cy="59" r="40" strokeWidth="1.45" />
      <circle cx="80" cy="59" r="35" strokeWidth="0.72" />
      <path
        d="M40 59h80M80 19v80M45 40q35 15 70 0M45 78q35-15 70 0M80 19c-26 14-26 66 0 80 26-14 26-66 0-80Z"
        strokeWidth="0.76"
      />
      <path d="M48 75q20-33 61-37" strokeWidth="1.65" />
      <circle cx="48" cy="75" r="3" strokeWidth="1.18" />
      <circle cx="109" cy="38" r="3" strokeWidth="1.18" />
      <path d="M77 46l9-1-5 7" strokeWidth="0.91" />
    </g>
  </svg>
);
