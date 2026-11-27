import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const PlayIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props} filled>
      <path d="M2.5 2.15a0.82 0.82 0 0 1 1.24 -0.71l9.07 5.28a1.4 1.4 0 0 1 0 2.42l-9.07 5.28A0.82 0.82 0 0 1 2.5 14.35z" />
    </SvgIcon>
  );
};
