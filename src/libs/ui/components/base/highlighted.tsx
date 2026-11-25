import type { FC } from "react";

export const Highlighted: FC<{
  text: string;
  words: string[];
}> = ({ text, words }) => {
  const terms = Array.from(
    new Set(
      words.flatMap((word) => {
        const stem =
          word.length > 4 ? word.replace(/(ing|ed|es|s)$/, "") : word;
        return [word, stem];
      }),
    ),
  )
    .filter((term) => term.length > 1)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (terms.length === 0) return text;
  const parts = text.split(new RegExp(`\\b(${terms.join("|")})`, "gi"));
  return parts.map((part, index) => {
    const key = `${index}-${part}`;
    if (index % 2 === 0) return <span key={key}>{part}</span>;
    return (
      <mark key={key} className="bg-accent/25 text-inherit">
        {part}
      </mark>
    );
  });
};
