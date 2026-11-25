export const formatMillisecondsAsClock = (
  milliseconds: number,
  withHours = true,
) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return (withHours ? [hours, minutes, seconds] : [minutes, seconds])
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

export const formatEpochAsDate = (epochMs: number) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(epochMs);

export const formatIsoDateAsDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(
    new Date(isoDate),
  );

export const formatQuestionPreviewAsMarkdown = (preview?: {
  question: string;
  answer: string;
}) => (preview ? `${preview.question}\n\n✅ ${preview.answer}` : "");
