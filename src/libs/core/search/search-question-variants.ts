import { countTemplateVariants } from "../question-templates/count-template-variants.ts";
import { generateQuestion } from "../question-templates/generate-question.ts";
import { getSearchWords } from "./get-search-words.ts";
import type { QuestionBankRawQuestionTemplate } from "../content/question-bank-raw-question-template.ts";

const stemWord = (word: string) => {
  return word.length > 4 ? word.replace(/(ing|ed|es|s)$/, "") : word;
};

const includesWord = (text: string, word: string) => {
  return text.includes(word) || text.includes(stemWord(word));
};

const stripMarkdown = (markdown: string) => {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[>#*`|_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const searchQuestionVariants = ({
  documents,
  query,
  limit,
}: {
  documents: {
    id: string;
    chapterId: string;
    chapterTitle: string;
    templates: QuestionBankRawQuestionTemplate[];
  }[];
  query: string;
  limit: number;
}) => {
  const words = getSearchWords(query).map((word) => word.toLowerCase());
  const phrase = words.join(" ");
  if (words.length === 0) return { words, items: [] };

  const items = documents
    .flatMap((document) => {
      const variantCount = document.templates.reduce(
        (s, t) => s + countTemplateVariants(t),
        0,
      );
      const variants = Array.from({ length: variantCount }, (_, index) => {
        const generated = generateQuestion(
          document.templates,
          index + 1,
          "preview",
        );
        const answer =
          generated.options.find(
            (option) => option.id === generated.correctOptionId,
          )?.text ?? "";
        const text = `${generated.question} ${answer}`.toLowerCase();
        const matchedWords = words.filter((word) => includesWord(text, word));
        return {
          variant: index + 1,
          question: generated.question,
          answer,
          matchedWords: matchedWords.length,
          phraseMatch: text.includes(phrase),
        };
      });
      const explanation = stripMarkdown(
        Array.from(
          new Set(document.templates.map((template) => template.explanation)),
        )
          .filter(Boolean)
          .join(" "),
      );
      const id = document.id.toLowerCase();
      const explanationText = explanation.toLowerCase();
      const chapterText = document.chapterTitle.toLowerCase();
      const found = words.every((word) => {
        return (
          id.includes(word) ||
          chapterText.includes(word) ||
          explanationText.includes(word) ||
          variants.some((variant) => {
            return includesWord(
              `${variant.question} ${variant.answer}`.toLowerCase(),
              word,
            );
          }) ||
          includesWord(explanationText, word)
        );
      });
      if (!found) return [];

      const best = variants.reduce((current, candidate) => {
        const better =
          candidate.matchedWords > current.matchedWords ||
          (candidate.matchedWords === current.matchedWords &&
            candidate.phraseMatch &&
            !current.phraseMatch);
        return better ? candidate : current;
      });
      const explanationHits = words.filter((word) => {
        return includesWord(explanationText, word);
      });
      const snippetStart =
        explanationHits.length > 0 && best.matchedWords < words.length
          ? Math.max(
              0,
              Math.min(
                ...explanationHits.map((word) => {
                  const position = explanationText.indexOf(word);
                  return position >= 0
                    ? position
                    : explanationText.indexOf(stemWord(word));
                }),
              ) - 60,
            )
          : -1;
      const score =
        (id === phrase ? 100 : id.startsWith(phrase) ? 50 : 0) +
        best.matchedWords * 4 +
        (best.phraseMatch ? 6 : 0) +
        explanationHits.length +
        (words.some((word) => chapterText.includes(word)) ? 1 : 0);
      return {
        score,
        id: document.id,
        chapterId: document.chapterId,
        chapterTitle: document.chapterTitle,
        variant: best.variant,
        variantCount,
        question: best.question,
        answer: best.answer,
        explanationSnippet:
          snippetStart >= 0
            ? `${snippetStart > 0 ? "…" : ""}${explanation.slice(snippetStart, snippetStart + 200)}…`
            : undefined,
      };
    })
    .toSorted((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit)
    .map(({ score, ...item }) => item);

  return { words, items };
};
