import { BackgroundForPplQuestionBank } from "../../../libs/ui/components/backgrounds/background-for-ppl-question-bank";
import type { FC } from "react";

export const BackgroundsPpl: FC = () => (
  <div className="pointer-events-none fixed inset-0 z-0">
    <BackgroundForPplQuestionBank className="opacity-30" />
  </div>
);
