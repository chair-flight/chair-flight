import { BackgroundForAtplQuestionBank } from "../../../libs/ui/components/backgrounds/background-for-atpl-question-bank";
import type { FC } from "react";

export const BackgroundsAtpl: FC = () => (
  <div className="pointer-events-none fixed inset-0 z-0">
    <BackgroundForAtplQuestionBank className="opacity-30" />
  </div>
);
