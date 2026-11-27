import { BackgroundForBoeing737QuestionBank } from "../../../libs/ui/components/backgrounds/background-for-boeing-737-question-bank";
import type { FC } from "react";

export const BackgroundsBoeing737: FC = () => (
  <div className="pointer-events-none fixed inset-0 z-0">
    <BackgroundForBoeing737QuestionBank className="opacity-30" />
  </div>
);
