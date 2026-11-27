import { SubjectAtplAirLaw } from "./subject-atpl-air-law";
import { SubjectAtplAircraftGeneralKnowledge } from "./subject-atpl-aircraft-general-knowledge";
import { SubjectAtplCommunications } from "./subject-atpl-communications";
import { SubjectAtplFlightPlanningAndMonitoring } from "./subject-atpl-flight-planning-and-monitoring";
import { SubjectAtplGeneralNavigation } from "./subject-atpl-general-navigation";
import { SubjectAtplHumanPerformanceAndLimitations } from "./subject-atpl-human-performance-and-limitations";
import { SubjectAtplInstruments } from "./subject-atpl-instruments";
import { SubjectAtplMassAndBalance } from "./subject-atpl-mass-and-balance";
import { SubjectAtplMeteorology } from "./subject-atpl-meteorology";
import { SubjectAtplOperationalProcedures } from "./subject-atpl-operational-procedures";
import { SubjectAtplPerformance } from "./subject-atpl-performance";
import { SubjectAtplPrinciplesOfFlight } from "./subject-atpl-principles-of-flight";
import { SubjectAtplRadioNavigation } from "./subject-atpl-radio-navigation";
import type { FC, SVGProps } from "react";

export const ATPL_SUBJECT_OUTLINES = new Map<
  string,
  {
    name: string;
    Icon: FC<SVGProps<SVGSVGElement>>;
  }
>([
  ["010", { name: "Air Law", Icon: SubjectAtplAirLaw }],
  [
    "021",
    {
      name: "Aircraft General Knowledge",
      Icon: SubjectAtplAircraftGeneralKnowledge,
    },
  ],
  ["022", { name: "Instruments", Icon: SubjectAtplInstruments }],
  ["031", { name: "Mass and Balance", Icon: SubjectAtplMassAndBalance }],
  ["032", { name: "Performance", Icon: SubjectAtplPerformance }],
  [
    "033",
    {
      name: "Flight Planning and Monitoring",
      Icon: SubjectAtplFlightPlanningAndMonitoring,
    },
  ],
  [
    "040",
    {
      name: "Human Performance and Limitations",
      Icon: SubjectAtplHumanPerformanceAndLimitations,
    },
  ],
  ["050", { name: "Meteorology", Icon: SubjectAtplMeteorology }],
  ["061", { name: "General Navigation", Icon: SubjectAtplGeneralNavigation }],
  ["062", { name: "Radio Navigation", Icon: SubjectAtplRadioNavigation }],
  [
    "070",
    { name: "Operational Procedures", Icon: SubjectAtplOperationalProcedures },
  ],
  [
    "081",
    { name: "Principles of Flight", Icon: SubjectAtplPrinciplesOfFlight },
  ],
  ["090", { name: "Communications", Icon: SubjectAtplCommunications }],
]);
