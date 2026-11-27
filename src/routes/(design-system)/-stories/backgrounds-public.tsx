import { BackgroundForPublic } from "../../../libs/ui/components/backgrounds/background-for-public";
import type { FC } from "react";

export const BackgroundsPublic: FC = () => (
  <div className="pointer-events-none fixed inset-0 z-0">
    <BackgroundForPublic />
  </div>
);
