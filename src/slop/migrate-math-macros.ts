import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isMap, isScalar, isSeq, parseDocument } from "yaml";
import type { Scalar, YAMLMap } from "yaml";

type MathNode = {
  name: string;
  attributes: string;
  children: MathNode[];
  text: string;
};

type Edit = {
  start: number;
  end: number;
  text: string;
};

const writeMode = process.argv.includes("--write");
const onlyFile = process.argv.find((argument) => argument.endsWith(".yaml"));
const questionsDirectory = "content/question-bank-atpl_a/questions";
const NUMBER = /((?:(?<![\w.)}])-)?\d+(?:\.\d+)?)/;
const MACRO_REFERENCE = /\{\{(macro\d*)\}\}/g;
const BOLD_ANSWER = "\\*\\*\\{\\{(\\w+)\\}\\}(?: ?([^*{}]+?))?\\*\\*";
const MACRO = "\\{\\{(macro\\d*)\\}\\}";
const PLAIN =
  "[^\\s=*()]*\\((?:[^()=*]|\\([^()]*\\))*\\)[^\\s=*.,;:]*|(?=[^\\s=*]*[\\d{])[^\\s=*]*[^\\s=*.,;:]";
const CHAIN = new RegExp(
  `${MACRO}(?: = (?:${MACRO}|${BOLD_ANSWER}|${PLAIN}))*`,
  "g",
);
const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  deg: "°",
  plusmn: "±",
  ge: "≥",
  le: "≤",
  alpha: "α",
  Delta: "Δ",
  middot: "·",
  rsquo: "’",
  bull: "•",
  hellip: "…",
  acute: "´",
  nbsp: " ",
};
const OPERATORS: Record<string, string> = {
  "×": "\\times ",
  "−": "-",
  "÷": "\\div ",
  "±": "\\pm ",
  "≥": "\\ge ",
  "≤": "\\le ",
  "·": "\\cdot ",
  "⁡": "",
  " ": "\\ ",
  "%": "\\%",
  α: "\\alpha ",
  Δ: "\\Delta ",
};
const statistics = {
  templates: 0,
  macros: 0,
  skipped: new Map<string, number>(),
  newVariables: 0,
  mismatches: 0,
};

const countSkip = (reason: string) => {
  statistics.skipped.set(reason, (statistics.skipped.get(reason) ?? 0) + 1);
};

const decodeEntities = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
    if (name[0] !== "#") return ENTITIES[name] ?? entity;
    const code =
      name[1] === "x"
        ? Number.parseInt(name.slice(2), 16)
        : Number(name.slice(1));
    return String.fromCodePoint(code);
  });

const parseMathml = (html: string): MathNode => {
  const root: MathNode = {
    name: "root",
    attributes: "",
    children: [],
    text: "",
  };
  const stack = [root];
  for (const match of html.matchAll(/<(\/?)([a-z]+)([^>]*)>|([^<]+)/g)) {
    const [, closing, name, attributes, text] = match;
    const current = stack[stack.length - 1];
    if (text !== undefined) {
      current.children.push({
        name: "#text",
        attributes: "",
        children: [],
        text: decodeEntities(text),
      });
    } else if (closing) {
      stack.pop();
    } else {
      const node = { name, attributes, children: [], text: "" };
      current.children.push(node);
      stack.push(node);
    }
  }
  return root;
};

const readNodeText = (node: MathNode): string =>
  node.name === "#text"
    ? node.text
    : node.children.map((child) => readNodeText(child)).join("");

const wrapBase = (latex: string) =>
  /^[\w.]+$/.test(latex) ? latex : `{${latex}}`;

const convertNode = (node: MathNode): string => {
  const children = node.children.map((child) => convertNode(child));
  const text = readNodeText(node);
  if (node.name === "#text") return node.text;
  if (node.name === "mn") return text;
  if (node.name === "mo") return OPERATORS[text] ?? text;
  if (node.name === "mi") {
    if (text.length > 1 || node.attributes.includes("normal")) {
      return text.length > 1 ? `\\text{${text}}` : text;
    }
    return text;
  }
  if (node.name === "mfrac") return `\\frac{${children[0]}}{${children[1]}}`;
  if (node.name === "msqrt") return `\\sqrt{${children.join("")}}`;
  if (node.name === "msup") return `${wrapBase(children[0])}^{${children[1]}}`;
  return children.join("");
};

const convertMathmlAsLatex = (html: string) => {
  const tree = parseMathml(html.trim());
  return convertNode(tree)
    .replace(/\s+/g, " ")
    .replace(/ ([)}^])/g, "$1")
    .trim();
};

const fixBraces = (latex: string) =>
  latex.replaceAll("{{{", "{ {{").replaceAll("}}}", "}} }");

const alignMacro = (
  latexByPreset: string[],
  variablesByPreset: Record<string, unknown>[],
  created: Map<string, string[]>,
) => {
  if (latexByPreset.every((latex) => latex === latexByPreset[0])) {
    return latexByPreset[0];
  }
  const split = latexByPreset.map((latex) => latex.split(NUMBER));
  const shapeLength = split[0].length;
  const compatible = split.every(
    (parts) =>
      parts.length === shapeLength &&
      parts.every((part, index) => index % 2 === 1 || part === split[0][index]),
  );
  if (!compatible) return null;
  const pieces = split[0].map((part, index) => {
    if (index % 2 === 0) return part;
    const values = split.map((parts) => parts[index]);
    if (values.every((value) => value === values[0])) return part;
    const name = Object.keys(variablesByPreset[0]).find(
      (candidate) =>
        !candidate.startsWith("macro") &&
        variablesByPreset.every(
          (variables, presetIndex) =>
            String(variables[candidate]) === values[presetIndex],
        ),
    );
    const reused = [...created].find(
      ([, existing]) => existing.join("|") === values.join("|"),
    )?.[0];
    const createdName = name ?? reused ?? `step${created.size + 1}`;
    if (!name && !reused) created.set(createdName, values);
    const preceding = split[0][index - 1];
    const needsParentheses =
      values.some((value) => value.startsWith("-")) &&
      /[+\-\s]$/.test(preceding);
    return needsParentheses ? `({{${createdName}}})` : `{{${createdName}}}`;
  });
  const latex = pieces
    .map((piece, index) => (index % 2 === 0 ? split[0][index] : piece))
    .join("");
  return fixBraces(latex);
};

const buildAnswerLatex = (name: string, unit: string | undefined) => {
  const trimmed = unit?.trim();
  const suffix = trimmed ? `\\ \\text{${trimmed}}` : "";
  return `\\mathbf{ {{${name}}}${suffix} }`;
};

const buildChainLatex = (chain: string, latexByMacro: Map<string, string>) => {
  const pieces = chain.split(" = ");
  const converted = pieces.map((piece) => {
    const macro = /^\{\{(macro\d*)\}\}$/.exec(piece);
    if (macro) return latexByMacro.get(macro[1]);
    const answer = new RegExp(`^${BOLD_ANSWER}$`).exec(piece);
    if (answer) return buildAnswerLatex(answer[1], answer[2]);
    return piece
      .split(/(\{\{\w+\}\})/)
      .map((part) =>
        part.startsWith("{{")
          ? part
          : part.replace(/[A-Za-z]{2,}/g, "\\text{$&}"),
      )
      .join("");
  });
  if (converted.some((latex) => latex === undefined)) return null;
  return converted as string[];
};

const splitFirstEquals = (latex: string) => {
  const index = latex.indexOf(" = ");
  if (index === -1) return `& ${latex}`;
  return `${latex.slice(0, index)} &= ${latex.slice(index + 3)}`;
};

const transformExplanation = (
  explanation: string,
  latexByMacro: Map<string, string>,
) => {
  const lines = explanation.split("\n");
  const rows = lines.map((line) => {
    const bullet = /^(\s*(?:[-*+]|\d+[.)])\s+)?/.exec(line)?.[0] ?? "";
    const body = line.slice(bullet.length);
    let mathLine: string[] | null = null;
    const replaced = body.replace(CHAIN, (chain) => {
      const pieces = buildChainLatex(chain, latexByMacro);
      if (!pieces) return chain;
      if (!bullet && body === chain && !/^\s/.test(line)) {
        mathLine = pieces;
        return chain;
      }
      return `$$${pieces.join(" = ")}$$`;
    });
    if (mathLine) return { kind: "math" as const, pieces: mathLine };
    const inline = replaced.replace(MACRO_REFERENCE, (reference, name) => {
      const latex = latexByMacro.get(name);
      return latex === undefined ? reference : `$$${latex}$$`;
    });
    return { kind: "text" as const, text: bullet + inline };
  });
  const output: string[] = [];
  let index = 0;
  while (index < rows.length) {
    const row = rows[index];
    if (row.kind === "text") {
      output.push(row.text);
      index += 1;
    } else {
      const group: string[][] = [];
      while (index < rows.length) {
        const next = rows[index];
        if (next.kind !== "math") break;
        group.push(next.pieces);
        index += 1;
      }
      const body =
        group.length === 1
          ? group[0].join(" = ")
          : `\\begin{aligned}\n${group
              .map((pieces) => splitFirstEquals(pieces.join(" = ")))
              .join(" \\\\\n")}\n\\end{aligned}`;
      output.push("", "$$", body, "$$", "");
    }
  }
  return output
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+|\n+$/g, "");
};

const readScalarText = (value: unknown) =>
  isScalar(value) ? (value as Scalar).value : undefined;

const lineStartOf = (source: string, offset: number) =>
  source.lastIndexOf("\n", offset - 1) + 1;

const lineEndOf = (source: string, offset: number) => {
  const found = source.indexOf("\n", offset);
  return found === -1 ? source.length : found + 1;
};

const formatVariableValue = (value: string) =>
  String(Number(value)) === value ? value : JSON.stringify(value);

const migrateFile = async (file: string) => {
  const source = await readFile(file, "utf8");
  const document = parseDocument(source);
  const edits: Edit[] = [];
  const questions = document.contents;
  if (!isSeq(questions)) return;
  for (const question of questions.items) {
    if (!isMap(question)) continue;
    const templates = question.get("templates", true);
    if (!isSeq(templates)) continue;
    for (const template of templates.items) {
      if (!isMap(template)) continue;
      const explanationNode = template.get("explanation", true);
      const presetsNode = template.get("presets", true);
      if (!isScalar(explanationNode) || !isSeq(presetsNode)) continue;
      const explanation = String(readScalarText(explanationNode));
      const usedMacros = [
        ...new Set(
          [...explanation.matchAll(MACRO_REFERENCE)].map((match) => match[1]),
        ),
      ];
      const presetMaps = presetsNode.items.filter((node): node is YAMLMap =>
        isMap(node),
      );
      const variableMaps = presetMaps
        .map((preset) => preset.get("variables", true) as unknown)
        .filter((node): node is YAMLMap => isMap(node));
      if (variableMaps.length === 0) continue;
      const variableValues = variableMaps.map(
        (variables) =>
          (variables as YAMLMap).toJS(document) as Record<string, unknown>,
      );
      const allMacros = Object.keys(variableValues[0]).filter((name) =>
        /^macro\d*$/.test(name),
      );
      const mathmlMacros = allMacros.filter((name) =>
        variableValues.every((variables) =>
          String(variables[name]).trim().startsWith("<math"),
        ),
      );
      if (mathmlMacros.length === 0) continue;
      statistics.templates += 1;
      const explanationRange = explanationNode.range as number[];
      const outsideText =
        source.slice((template.range as number[])[0], explanationRange[0]) +
        source.slice(explanationRange[1], (template.range as number[])[1]);
      const latexByMacro = new Map<string, string>();
      const created = new Map<string, string[]>();
      const pendingChecks: { macro: string; aligned: string }[] = [];
      for (const macro of mathmlMacros) {
        if (!usedMacros.includes(macro)) {
          latexByMacro.set(macro, "");
          continue;
        }
        if (outsideText.includes(`{{${macro}}}`)) {
          countSkip("used outside explanation");
          continue;
        }
        const aligned = alignMacro(
          variableValues.map((variables) =>
            convertMathmlAsLatex(String(variables[macro])),
          ),
          variableValues,
          created,
        );
        if (aligned === null) {
          countSkip("macro shape differs between presets");
          if (process.env.DEBUG_SHAPE) {
            console.log(file, macro);
            for (const variables of variableValues) {
              console.log(
                "   ",
                convertMathmlAsLatex(String(variables[macro])),
              );
            }
          }
          continue;
        }
        latexByMacro.set(macro, aligned);
        pendingChecks.push({ macro, aligned });
        statistics.macros += 1;
      }
      if (latexByMacro.size === 0) continue;
      for (const { macro, aligned } of pendingChecks) {
        variableValues.forEach((variables, presetIndex) => {
          const rebuilt = aligned.replace(/\{\{(\w+)\}\}/g, (_, name) =>
            String(
              created.has(name)
                ? (created.get(name) as string[])[presetIndex]
                : variables[name],
            ),
          );
          const expected = convertMathmlAsLatex(String(variables[macro]));
          const normalise = (text: string) => text.replace(/[\s()]/g, "");
          if (normalise(rebuilt) !== normalise(expected)) {
            console.log(
              "MISMATCH",
              file,
              macro,
              presetIndex,
              rebuilt,
              expected,
            );
            statistics.mismatches += 1;
          }
        });
      }
      const transformed = transformExplanation(
        explanation,
        new Map([...latexByMacro].filter(([, latex]) => latex !== "")),
      );
      const explanationKey = template.items.find(
        (pair) => (pair.key as Scalar).value === "explanation",
      );
      const keyStart = (
        (explanationKey as { key: Scalar }).key.range as number[]
      )[0];
      const indent = keyStart - lineStartOf(source, keyStart) + 2;
      const prefix = " ".repeat(indent);
      const literal = `|-\n${transformed
        .split("\n")
        .map((line) => (line ? prefix + line : ""))
        .join("\n")}${source[explanationRange[1] - 1] === "\n" ? "\n" : ""}`;
      if (explanationNode.type !== "BLOCK_LITERAL") {
        countSkip("explanation is not a literal block");
        continue;
      }
      edits.push({
        start: explanationRange[0],
        end: explanationRange[1],
        text: literal,
      });
      variableMaps.forEach((variables, presetIndex) => {
        const map = variables as YAMLMap;
        for (const pair of map.items) {
          const name = (pair.key as Scalar).value as string;
          if (!latexByMacro.has(name)) continue;
          const keyRange = (pair.key as Scalar).range as number[];
          const valueRange = (pair.value as Scalar).range as number[];
          edits.push({
            start: lineStartOf(source, keyRange[0]),
            end: lineEndOf(source, valueRange[1] - 1),
            text: "",
          });
        }
        if (created.size === 0) return;
        const lastPair = map.items.at(-1);
        const lastValue = (lastPair as { value: Scalar }).value
          .range as number[];
        const firstKey = (map.items[0].key as Scalar).range as number[];
        const variableIndent = firstKey[0] - lineStartOf(source, firstKey[0]);
        const insertion = [...created]
          .map(
            ([name, values]) =>
              `${" ".repeat(variableIndent)}${name}: ${formatVariableValue(values[presetIndex])}\n`,
          )
          .join("");
        edits.push({
          start: lineEndOf(source, lastValue[1] - 1),
          end: lineEndOf(source, lastValue[1] - 1),
          text: insertion,
        });
      });
      statistics.newVariables += created.size;
    }
  }
  const sorted = edits.toSorted((a, b) => b.start - a.start || b.end - a.end);
  const result = sorted.reduce(
    (text, edit) =>
      text.slice(0, edit.start) + edit.text + text.slice(edit.end),
    source,
  );
  if (writeMode && result !== source) await writeFile(file, result);
  if (!writeMode && result !== source) {
    await writeFile(`.workdir/migrated-${path.basename(file)}`, result);
  }
};

const files = (await readdir(questionsDirectory))
  .filter((file) => file.endsWith(".yaml"))
  .filter((file) => !onlyFile || onlyFile.endsWith(file));
for (const file of files) {
  await migrateFile(path.join(questionsDirectory, file));
}
console.log(statistics);
