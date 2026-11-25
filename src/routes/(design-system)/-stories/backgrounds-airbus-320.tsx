import { BackgroundForAirbus320QuestionBank } from "../../../libs/ui/backgrounds/background-for-airbus-320-question-bank";
import type { FC } from "react";

export const BackgroundsAirbus320: FC = () => (
  <div className="pointer-events-none fixed inset-0 z-0">
    <BackgroundForAirbus320QuestionBank className="opacity-30" />
  </div>
);
