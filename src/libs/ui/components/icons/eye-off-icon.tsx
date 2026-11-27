import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const EyeOffIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M2.6 2.6l10.8 10.8" />
      <path d="M7.16 4.46A6.24 6.24 0 0 1 8 4.4c3.9 0 6 3.6 6 3.6a10.56 10.56 0 0 1 -1.92 2.34M4.76 4.82C3.14 5.84 2 8 2 8s2.1 3.6 6 3.6c1.02 0 1.92 -0.3 2.7 -0.72" />
      <path d="M6.74 6.74a1.8 1.8 0 0 0 2.52 2.52" />
    </SvgIcon>
  );
};
