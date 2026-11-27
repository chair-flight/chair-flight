import type { FC, SVGProps } from "react";

export const GraphicLostFlightChart: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 440 540"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <defs>
        <pattern
          id="lost-flight-grid"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path d="M24 0H0V24" opacity=".2" />
        </pattern>
        <radialGradient id="lost-flight-grid-fade">
          <stop offset=".28" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="lost-flight-chart-mask">
          <rect
            width="440"
            height="540"
            fill="url(#lost-flight-grid-fade)"
            stroke="none"
          />
        </mask>
      </defs>

      <g mask="url(#lost-flight-chart-mask)">
        <rect
          width="440"
          height="540"
          fill="url(#lost-flight-grid)"
          stroke="none"
        />
        <g opacity=".42">
          <path d="m368 453 7 7-7 7-7-7zM96 118l7 7-7 7-7-7zM359 83l7 7-7 7-7-7z" />
          <path d="M32 290h80m-40-40v80M337 351h64m-32-32v64" />
          <path
            d="M72 290Q109 403 208 448T368 460M96 125Q177 91 238 110T359 90"
            strokeDasharray="2 7"
          />
        </g>
      </g>

      <g opacity=".32">
        <circle cx="259" cy="226" r="44" strokeDasharray="2 6" />
        <circle cx="259" cy="226" r="75" strokeDasharray="4 7" />
        <circle cx="259" cy="226" r="106" strokeDasharray="1 9" />
      </g>
      <path
        d="M91 483C79 433 118 406 181 407S304 383 287 335C276 304 214 329 207 289C202 264 230 246 259 226"
        strokeWidth="2.5"
        strokeDasharray="6 7"
      />
      <circle
        cx="91"
        cy="483"
        r="5"
        className="fill-canvas"
        strokeWidth="1.5"
      />

      <g strokeWidth="1.5" strokeDasharray="3 7">
        <path d="M259 226C249 170 216 132 160 103" opacity=".48" />
        <path d="M259 226C271 173 271 114 252 63" opacity=".65" />
        <path d="M259 226C288 202 337 186 388 187" opacity=".48" />
      </g>
      <g opacity=".68">
        <circle cx="160" cy="103" r="3" />
        <circle cx="252" cy="63" r="5" strokeDasharray="2 3" />
        <circle cx="388" cy="187" r="3" />
      </g>
      <path
        d="M0-22C3-22 4-16 4-10v6L21 6v4L4 5l-1 10 6 4v3l-9-2-9 2v-3l6-4-1-10-17 5V6L-4-4v-6c0-6 1-12 4-12Z"
        transform="translate(259 226) rotate(55)"
        fill="currentColor"
        className="stroke-canvas"
        strokeWidth="2.5"
        paintOrder="stroke"
      />
    </svg>
  );
};
