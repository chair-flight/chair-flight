import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const SunIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <circle cx="8" cy="8" r="2.4" />
      <path d="M8 2v1.2M8 12.8v1.2M3.74 3.74l0.84 0.84M11.42 11.42l0.84 0.84M2 8h1.2M12.8 8h1.2M3.74 12.26l0.84 -0.84M11.42 4.58l0.84 -0.84" />
    </SvgIcon>
  );
};
