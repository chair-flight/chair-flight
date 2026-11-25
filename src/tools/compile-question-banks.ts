import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as YAML from "yaml";
import { QUESTION_BANK_NAMES } from "../libs/core/content/question-bank-name.ts";
import { questionBankRawLearningObjectiveSchema } from "../libs/core/content/question-bank-raw-learning-objective.ts";
import { questionBankRawMetadataSchema } from "../libs/core/content/question-bank-raw-metadata.ts";
import { questionBankRawQuestionSchema } from "../libs/core/content/question-bank-raw-question.ts";
import { ANNEX_REFERENCE } from "../libs/core/question-bank/resolve-question-templates.ts";
import type { QuestionBankFile } from "../libs/core/content/question-bank-file.ts";

export const compileQuestionBanks = async () => {
  await Promise.all(
    QUESTION_BANK_NAMES.map(async (questionBank) => {
      const sourceFolder = path.join(
        "content",
        `question-bank-${questionBank}`,
      );
      const questionsFolder = path.join(sourceFolder, "questions");
      const outputFolder = path.join(
        "generated",
        "question-banks",
        questionBank,
      );

      const metadataText = await fs.readFile(
        path.join(sourceFolder, "metadata.yaml"),
        "utf-8",
      );
      const metadata = questionBankRawMetadataSchema.parse(
        YAML.parse(metadataText),
      );
      const { courses, subjects, chapters } = metadata;
      if (metadata.id !== questionBank) {
        throw new Error(`${questionBank} metadata has id ${metadata.id}.`);
      }

      const annexes = metadata.annexes;
      const annexIds = new Set(annexes.map(({ id }) => id));

      const learningObjectivesFolder = path.join(
        sourceFolder,
        "learning-objectives",
      );
      const unsortedLearningObjectiveFiles = await fs
        .readdir(learningObjectivesFolder)
        .catch(() => []);
      const latestLearningObjectivesFile = unsortedLearningObjectiveFiles
        .filter((file) => /^v\d+\.yaml$/.test(file))
        .toSorted((a, b) => Number(b.slice(1, -5)) - Number(a.slice(1, -5)))[0];

      const learningObjectivesText = latestLearningObjectivesFile
        ? await fs.readFile(
            path.join(learningObjectivesFolder, latestLearningObjectivesFile),
            "utf-8",
          )
        : "";

      const learningObjectiveRevisions = questionBankRawLearningObjectiveSchema
        .array()
        .parse(YAML.parse(learningObjectivesText) ?? []);

      const currentVersion = latestLearningObjectivesFile?.slice(0, -5);
      const learningObjectives = learningObjectiveRevisions.filter(
        (revision) => revision.version === currentVersion,
      );

      const unsortedQuestionFiles = await fs
        .readdir(questionsFolder, { recursive: true })
        .catch(() => []);

      const questionFiles = unsortedQuestionFiles
        .filter((file) => file.endsWith(".yaml"))
        .toSorted();

      const entriesPerFile = await Promise.all(
        questionFiles.map(async (file) => {
          const fileText = await fs.readFile(
            path.join(questionsFolder, file),
            "utf-8",
          );
          const fileQuestions = questionBankRawQuestionSchema
            .array()
            .parse(YAML.parse(fileText) ?? []);
          return fileQuestions.map((question) => ({ question }));
        }),
      );
      const entries = entriesPerFile.flat();

      const questionIds = new Set<string>();
      const learningObjectiveIds = new Set(
        learningObjectives.map(({ id }) => id),
      );
      const errors: string[] = [];
      for (const { question } of entries) {
        if (questionIds.has(question.id)) {
          errors.push(`Duplicate question ${question.id}.`);
        }
        questionIds.add(question.id);
      }
      const subjectIds = new Set(subjects.map(({ id }) => id));
      const chapterIds = new Set<string>();
      for (const chapter of chapters) {
        if (chapterIds.has(chapter.id)) {
          errors.push(`Duplicate chapter ${chapter.id}.`);
        }
        chapterIds.add(chapter.id);
        if (!subjectIds.has(chapter.subject)) {
          errors.push(
            `Chapter ${chapter.id} uses missing subject ${chapter.subject}.`,
          );
        }
      }
      for (const { question } of entries) {
        const chapter = chapters.find(({ id }) => id === question.chapterId);
        if (!subjectIds.has(question.subjectId)) {
          errors.push(
            `${question.id} uses missing subject ${question.subjectId}.`,
          );
        } else if (!chapter) {
          errors.push(
            `${question.id} uses missing chapter ${question.chapterId}.`,
          );
        } else if (chapter.subject !== question.subjectId) {
          errors.push(
            `${question.id} uses chapter ${chapter.id} outside subject ${question.subjectId}.`,
          );
        }
        for (const id of question.relatedQuestionIds) {
          if (!questionIds.has(id)) {
            errors.push(`${question.id} relates to missing question ${id}.`);
          }
        }
        for (const id of question.learningObjectiveIds) {
          if (!learningObjectiveIds.has(id)) {
            errors.push(
              `${question.id} uses missing learning objective ${id}.`,
            );
          }
        }
        const annexEntryIds = new Set<string>();
        const plainAnnexIds = new Set<string>();
        const localAnnexNames = new Set<string>();
        for (const annex of question.annexes) {
          const baseId = "base" in annex ? annex.base : annex.id;
          if (annexEntryIds.has(annex.id)) {
            errors.push(`${question.id} lists annex ${annex.id} twice.`);
          }
          annexEntryIds.add(annex.id);
          if (!annexIds.has(baseId)) {
            errors.push(`${question.id} lists missing annex ${baseId}.`);
          }
          ("base" in annex ? localAnnexNames : plainAnnexIds).add(annex.id);
        }
        const annexIdsUsedInTemplates = new Set<string>();
        for (const template of question.templates) {
          if (template.type !== "definition") continue;
          if (!template.question.includes("annex:{{term}}")) continue;
          for (const option of template.options) {
            if (!annexIds.has(option.term)) {
              errors.push(`${question.id} uses missing annex ${option.term}.`);
            }
            annexIdsUsedInTemplates.add(option.term);
          }
        }
        JSON.stringify(question.templates, (key, value) => {
          if (typeof value !== "string" || key === "explanation") return value;
          if (key === "annex" && value) annexIdsUsedInTemplates.add(value);
          for (const [, , id] of value.matchAll(ANNEX_REFERENCE)) {
            if (!localAnnexNames.has(id)) annexIdsUsedInTemplates.add(id);
          }
          return value;
        });
        for (const id of annexIdsUsedInTemplates) {
          if (!plainAnnexIds.has(id)) {
            errors.push(
              `${question.id} uses annex ${id} missing from annexes.`,
            );
          }
        }
      }
      if (errors.length > 0) {
        throw new Error(
          `Invalid ${questionBank} content:\n${errors.join("\n")}`,
        );
      }

      const questions = entries.map(({ question }) => question);

      const index: QuestionBankFile = {
        id: questionBank,
        title: metadata.title,
        subtitle: metadata.subtitle,
        shortTitle: metadata.shortTitle,
        description: metadata.description,
        annexes,
        courses,
        subjects,
        chapters,
        learningObjectives,
        questions,
      };

      const target = path.join(outputFolder, "index.json");
      const text = JSON.stringify(index);
      const current = await fs.readFile(target, "utf-8").catch(() => "");
      if (current === text) return;
      await fs.mkdir(outputFolder, { recursive: true });
      await fs.writeFile(target, text);
    }),
  );
};
