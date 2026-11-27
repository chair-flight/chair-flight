import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const GithubIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M6.37 12.37c-2.61 0.98 -2.61 -1.3 -3.91 -1.63m7.82 3.26v-2.28c0 -0.65 0.07 -0.91 -0.33 -1.3 1.82 -0.2 3.58 -0.91 3.58 -3.91a3 3 0 0 0 -0.85 -2.09 2.74 2.74 0 0 0 -0.07 -2.09s-0.72 -0.2 -2.28 0.85a7.82 7.82 0 0 0 -4.04 0C4.74 1.81 4.02 2.01 4.02 2.01a2.74 2.74 0 0 0 -0.07 2.09A3 3 0 0 0 3.11 6.18c0 3 1.76 3.71 3.58 3.91 -0.39 0.39 -0.39 0.78 -0.33 1.3V13.67" />
    </SvgIcon>
  );
};
