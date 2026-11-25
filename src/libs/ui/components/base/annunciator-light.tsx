import type { FC } from "react";

const COLOURS = {
  amber: "#f5a300",
  white: "#f2f2f2",
  red: "#ff3b30",
  green: "#2fd65a",
  blue: "#4f9dff",
};

export const AnnunciatorLight: FC<{
  label: string;
  colour: keyof typeof COLOURS;
}> = ({ label, colour }) => {
  const lines = label.split("/");
  const longestLine = Math.max(...lines.map((line) => line.length));
  const fontSize = longestLine >= 8 ? 15 : 18;
  const ink = COLOURS[colour];
  return (
    <svg
      role="img"
      aria-label={lines.join(" ")}
      viewBox="0 0 100 46"
      className="block h-auto w-[16mm]"
    >
      <rect
        x="1.5"
        y="1.5"
        width="97"
        height="43"
        fill="#000"
        stroke={ink}
        strokeWidth="3"
      />
      {lines.map((line, index) => (
        <text
          key={line}
          x="50"
          y={
            23 +
            (index - (lines.length - 1) / 2) * (fontSize + 3) +
            fontSize * 0.36
          }
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={fontSize}
          fontWeight="400"
          fill={ink}
        >
          {line}
        </text>
      ))}
    </svg>
  );
};
