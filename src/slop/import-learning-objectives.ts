import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as zlib from "node:zlib";
import * as YAML from "yaml";

const CENTRAL_DIRECTORY_ENTRY = 0x02014b50;
const EXTERNAL_FOLDER = process.argv[2] ?? ".external";
const OUTPUT_FOLDER = "content/question-bank-atpl_a/learning-objectives";

const COURSE_COLUMNS = {
  "ATPL(A)": "ATPL_A",
  "CPL(A)": "CPL_A",
  IR: "IR",
  "CBIR(A)": "CBIR_A",
};

const COURSE_IDS_V2 = ["ATPL_A", "CPL_A", "IR", "CBIR_A"];

const SYLLABUS_2020_COLUMNS = {
  reference: "2020 syllabus reference",
  text: "2020 syllabus text",
  courses: COURSE_COLUMNS,
};

const VERSIONS = [
  {
    id: "v1",
    name: "2016 · v1",
    description:
      "The syllabus and learning objectives published in 2016, read from the old columns of TK Syllabus Comparison Document v2.",
    file: "originals/easa/tk-syllabus-comparison-v2.xlsx",
    columns: {
      reference: "Old syllabus reference",
      text: /^Old syllabus (text|details)$/,
      linkedReferences: "New syllabus reference",
    },
    matching: "direct" as const,
  },
  {
    id: "v2",
    name: "2018-19 · v2",
    description:
      "The syllabus and learning objectives published in 2018 and 2019, as listed in TK Syllabus Comparison Document v2.",
    file: "originals/easa/tk-syllabus-comparison-v2.xlsx",
    columns: {
      reference: "New syllabus reference",
      text: /^New syllabus (text|details)$/,
      linkedReferences: "Old syllabus reference",
      coursesAfter: {
        header: /^Reworded, intent modified$/,
        courseIds: COURSE_IDS_V2,
      },
    },
    matching: "direct" as const,
  },
  {
    id: "v3",
    name: "2020 · v3",
    description:
      "The 2020 syllabus and learning objectives as listed in TK Syllabus Comparison Document v3, which added the Basic Instrument Rating.",
    file: "originals/easa/tk-syllabus-comparison-v3.xlsx",
    columns: {
      ...SYLLABUS_2020_COLUMNS,
      linkedReferences: "2018-2019 syllabus reference",
      source: /^Source \/ Comment/,
    },
    matching: "direct" as const,
  },
  {
    id: "v4",
    name: "2020 · v4",
    description:
      "The 2020 syllabus and learning objectives as listed in TK Syllabus Comparison Document v4, with provisions for ECQB 2022 amendment 4.",
    file: "originals/easa/tk-syllabus-comparison-v4.xlsx",
    columns: {
      ...SYLLABUS_2020_COLUMNS,
      linkedReferences: "2020 syllabus reference",
      source: /am(d\.|endment) 4/,
    },
    matching: "direct" as const,
  },
  {
    id: "v5",
    name: "2020 · v5",
    description:
      "The 2020 syllabus and learning objectives as listed in TK Syllabus Comparison Document v5, with provisions for ECQB 2024.",
    file: "originals/easa/tk-syllabus-comparison-v5.xlsx",
    columns: {
      ...SYLLABUS_2020_COLUMNS,
      linkedReferences: "2020 syllabus reference",
      source: /^Source \/ Comment/,
    },
    matching: "direct" as const,
  },
  {
    id: "v6",
    name: "2020 · v6",
    description:
      "The 2020 syllabus and learning objectives as listed in TK Syllabus Comparison Document v6, with provisions for ECQB 2026.",
    file: "originals/easa/tk-syllabus-comparison-v6.xlsx",
    columns: {
      ...SYLLABUS_2020_COLUMNS,
      linkedReferences: "2020 syllabus reference",
      source: /^Source \/ Comment/,
    },
    matching: "direct" as const,
  },
];

const EDITORIAL_NOTE_MATCH =
  /^\d+ entr(y|ies) (is |are )?(added|amended|deleted)\b/i;

const cleanLearningObjectiveSource = (rawSource: string) => {
  const lines = rawSource
    .replace(/[ \t]/g, " ")
    .split(/\r?\n|\r/)
    .map((line) =>
      line
        .replace(/ {2,}/g, " ")
        .replace(/[;\s]+$/, "")
        .trim(),
    )
    .filter((line) => line && !EDITORIAL_NOTE_MATCH.test(line));
  return lines.join("\n");
};

const REFERENCE_MATCH = /\b\d{3}(?:[ .]\d{2}){0,4}\b/g;

const findLearningObjectiveReferences = (text: string) =>
  Array.from(text.matchAll(REFERENCE_MATCH), (match) =>
    match[0].replaceAll(" ", ".").replace(/(\.00)+$/, ""),
  );

const LIST_LEAD_IN_MATCH = /following|including|specifically|except/i;
const SOURCE_SUFFIX_MATCH = /\s*\bSource:\s*([\s\S]*)$/;
const TITLE_SOURCE_SUFFIX_MATCH =
  /\s+-\s+ICAO Doc 7300\/9\s+-\s+Convention on the High Seas.*$/;
const HEADING_REMARK_MATCH = /\s*\bRemark:[\s\S]*$/;
const SENTENCE_BREAK_MATCH = /[a-z)]\.\s+[A-Z]/;
const MAX_COMMA_ITEM_LENGTH = 80;

const splitAtTopLevel = (text: string, separator: string) => {
  const depthsAfter = text.split("").reduce<number[]>((depths, character) => {
    const depth = depths.at(-1) ?? 0;
    const change = character === "(" ? 1 : character === ")" ? -1 : 0;
    depths.push(Math.max(0, depth + change));
    return depths;
  }, []);
  const cuts = [
    -1,
    ...text
      .split("")
      .flatMap((character, index) =>
        character === separator && (depthsAfter[index - 1] ?? 0) === 0
          ? [index]
          : [],
      ),
    text.length,
  ];
  return cuts.slice(1).map((cut, index) => text.slice(cuts[index] + 1, cut));
};

const findTopLevelColon = (text: string) => {
  const colonIndex = splitAtTopLevel(text, ":")[0].length;
  return colonIndex < text.length ? colonIndex : -1;
};

const normaliseWhitespace = (text: string) =>
  text
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .replace(/[   \t]/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/ +([,;:.)])/g, "$1")
    .replace(/\( +/g, "(")
    .trim();

const cleanListItem = (item: string) =>
  item
    .trim()
    .replace(/^(and|or)\s+/i, "")
    .replace(/[.;,\s]+$/, "");

const toBulletList = (lead: string, items: string[]) =>
  `${lead}\n\n${items.map((item) => `- ${item}`).join("\n")}`;

const bulletiseText = (text: string) => {
  if (text.includes("\n")) return text;
  const colonIndex = findTopLevelColon(text);
  if (colonIndex < 0) return text;
  const lead = text.slice(0, colonIndex + 1);
  const rest = text.slice(colonIndex + 1).trim();
  const semicolonItems = splitAtTopLevel(rest, ";")
    .map(cleanListItem)
    .filter(Boolean);
  const itemsContainSentences = semicolonItems.some((item) =>
    SENTENCE_BREAK_MATCH.test(item),
  );
  if (semicolonItems.length >= 2 && itemsContainSentences) return text;
  if (semicolonItems.length >= 2) {
    const itemsWithColon = semicolonItems.filter((item) =>
      item.includes(":"),
    ).length;
    const nestedList =
      itemsWithColon > 0 && itemsWithColon < semicolonItems.length;
    return nestedList ? text : toBulletList(lead, semicolonItems);
  }
  if (!LIST_LEAD_IN_MATCH.test(lead) || rest.includes(":")) return text;
  const commaItems = splitAtTopLevel(rest, ",")
    .map(cleanListItem)
    .filter(Boolean);
  const itemsAreShort = commaItems.every(
    (item) => item.length <= MAX_COMMA_ITEM_LENGTH,
  );
  return commaItems.length >= 3 && itemsAreShort
    ? toBulletList(lead, commaItems)
    : text;
};

const cleanLearningObjectiveText = (
  rawText: string,
  options: { heading: boolean },
) => {
  const sourceMatch = SOURCE_SUFFIX_MATCH.exec(rawText);
  const withoutSource = sourceMatch
    ? rawText.slice(0, sourceMatch.index)
    : rawText;
  const text = normaliseWhitespace(withoutSource).replace(
    TITLE_SOURCE_SUFFIX_MATCH,
    "",
  );
  return {
    text: options.heading
      ? text.replace(HEADING_REMARK_MATCH, "").replace(/\.$/, "")
      : bulletiseText(text),
    inlineSource: sourceMatch ? normaliseWhitespace(sourceMatch[1]) : "",
  };
};

const MAX_LEVEL_OF_HEADINGS = 4;
const BLANK_TEXT_MATCH = /^intentionally left blank\.?$/i;

const parseLearningObjectiveSheet = (
  rows: string[][],
  columns: {
    subject: string;
    reference: string | RegExp;
    text: string | RegExp;
    linkedReferences: string | RegExp;
    source?: RegExp;
    courses?: Record<string, string>;
    coursesAfter?: { header: string | RegExp; courseIds: string[] };
  },
) => {
  const headerIndex = rows.findIndex((row) => row[0]?.trim() === "Index");
  if (headerIndex < 0) throw new Error(`No header row in ${columns.subject}.`);
  const headers = rows[headerIndex].map((header) => header.trim());
  const findColumn = (matcher: string | RegExp) => {
    const index = headers.findIndex((header) =>
      typeof matcher === "string" ? header === matcher : matcher.test(header),
    );
    if (index < 0) throw new Error(`Missing column ${matcher} in sheet.`);
    return index;
  };
  const referenceColumn = findColumn(columns.reference);
  const textColumn = findColumn(columns.text);
  const linkedColumn = findColumn(columns.linkedReferences);
  const sourceColumn = columns.source ? findColumn(columns.source) : -1;
  const courseColumns = columns.coursesAfter
    ? columns.coursesAfter.courseIds.map((courseId, offset) => ({
        courseId,
        index: findColumn(columns.coursesAfter?.header ?? "") + 1 + offset,
      }))
    : Object.entries(columns.courses ?? {}).map(([header, courseId]) => ({
        courseId,
        index: findColumn(header),
      }));
  const skipped = { withoutReference: 0, withoutText: 0 };
  const entries = rows.slice(headerIndex + 1).flatMap((row) => {
    const [id] = findLearningObjectiveReferences(row[referenceColumn] ?? "");
    const originalText = row[textColumn] ?? "";
    if (!id) {
      if (originalText.trim()) skipped.withoutReference++;
      return [];
    }
    if (!originalText.trim() || BLANK_TEXT_MATCH.test(originalText.trim())) {
      skipped.withoutText++;
      return [];
    }
    const level = id.split(".").length;
    const { text, inlineSource } = cleanLearningObjectiveText(originalText, {
      heading: level <= MAX_LEVEL_OF_HEADINGS,
    });
    const source = cleanLearningObjectiveSource(
      sourceColumn >= 0 ? (row[sourceColumn] ?? "") : inlineSource,
    );
    return [
      {
        id,
        subject: columns.subject,
        level,
        text,
        originalText,
        source,
        courses: courseColumns
          .filter(({ index }) => row[index]?.trim())
          .map(({ courseId }) => courseId),
        linkedReferences: findLearningObjectiveReferences(
          row[linkedColumn] ?? "",
        ),
      },
    ];
  });
  return { entries, skipped };
};

const getComparableText = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const classifyLearningObjectiveChange = (
  entry: { id: string; text: string },
  linked: { id: string; text: string }[],
) => {
  if (linked.length === 0) return "unlinked" as const;
  const [only] = linked;
  const sameText =
    linked.length === 1 &&
    getComparableText(only.text) === getComparableText(entry.text);
  if (!sameText) return "reworded" as const;
  return only.id === entry.id
    ? ("unchanged" as const)
    : ("renumbered" as const);
};

type ParsedEntry = {
  id: string;
  subject: string;
  level: number;
  text: string;
  originalText: string;
  source: string;
  courses: string[];
  linkedReferences: string[];
};

const mergeDuplicateEntries = (entries: ParsedEntry[]) =>
  Array.from(
    entries
      .reduce((byId, entry) => {
        const existing = byId.get(entry.id);
        byId.set(
          entry.id,
          existing
            ? {
                ...existing,
                courses: [...new Set([...existing.courses, ...entry.courses])],
                linkedReferences: [
                  ...new Set([
                    ...existing.linkedReferences,
                    ...entry.linkedReferences,
                  ]),
                ],
              }
            : entry,
        );
        return byId;
      }, new Map<string, ParsedEntry>())
      .values(),
  ).sort((a, b) => a.id.localeCompare(b.id));

const findParentId = (id: string, subject: string, ids: Set<string>) => {
  const segments = id.split(".");
  for (let length = segments.length - 1; length >= 1; length--) {
    const candidate = segments
      .slice(0, length)
      .join(".")
      .replace(/(\.00)+$/, "");
    if (candidate !== id && ids.has(candidate)) return candidate;
  }
  return id !== subject && ids.has(subject) ? subject : null;
};

const linkLearningObjectiveVersions = (input: {
  matching: "bridge" | "direct";
  previous: { version: string; entries: ParsedEntry[] };
  current: { version: string; entries: ParsedEntry[] };
}) => {
  const previousEntries = mergeDuplicateEntries(input.previous.entries);
  const currentEntries = mergeDuplicateEntries(input.current.entries);
  const previousIds = new Set(previousEntries.map((entry) => entry.id));
  const currentIds = new Set(currentEntries.map((entry) => entry.id));
  const previousIdsByBridge = previousEntries.reduce((result, entry) => {
    for (const bridge of entry.linkedReferences) {
      result.set(bridge, [...(result.get(bridge) ?? []), entry.id]);
    }
    return result;
  }, new Map<string, string[]>());
  const previousIdsByCurrentId = new Map(
    currentEntries.map((entry) => [
      entry.id,
      input.matching === "direct"
        ? [
            ...new Set(
              entry.linkedReferences.filter((id) => previousIds.has(id)),
            ),
          ].sort()
        : [
            ...new Set(
              entry.linkedReferences.flatMap(
                (bridge) => previousIdsByBridge.get(bridge) ?? [],
              ),
            ),
          ].sort(),
    ]),
  );
  const nextIdsByPreviousId = new Map<string, string[]>();
  for (const [currentId, ids] of previousIdsByCurrentId) {
    for (const id of ids) {
      nextIdsByPreviousId.set(id, [
        ...(nextIdsByPreviousId.get(id) ?? []),
        currentId,
      ]);
    }
  }
  const previousEntriesById = new Map(
    previousEntries.map((entry) => [entry.id, [entry]]),
  );
  const toRow = (
    version: string,
    ids: Set<string>,
    entry: ParsedEntry,
    links: { previousIds: string[]; nextIds: string[] },
    change: "new" | "unchanged" | "renumbered" | "reworded" | null,
  ) => ({
    version,
    id: entry.id,
    parentId: findParentId(entry.id, entry.subject, ids),
    subject: entry.subject,
    level: entry.level,
    text: entry.text,
    originalText: entry.originalText,
    source: entry.source,
    courses: entry.courses,
    previousIds: links.previousIds,
    nextIds: links.nextIds,
    change,
  });
  const getChange = (entry: ParsedEntry, ids: string[]) => {
    const change = classifyLearningObjectiveChange(
      entry,
      ids.flatMap((id) => previousEntriesById.get(id) ?? []),
    );
    return change === "unlinked" ? ("new" as const) : change;
  };
  return {
    previous: previousEntries.map((entry) =>
      toRow(
        input.previous.version,
        previousIds,
        entry,
        { previousIds: [], nextIds: nextIdsByPreviousId.get(entry.id) ?? [] },
        null,
      ),
    ),
    current: currentEntries.map((entry) => {
      const ids = previousIdsByCurrentId.get(entry.id) ?? [];
      return toRow(
        input.current.version,
        currentIds,
        entry,
        { previousIds: ids, nextIds: [] },
        getChange(entry, ids),
      );
    }),
  };
};

const bubbleLearningObjectiveCourses = <
  T extends { id: string; parentId: string | null; courses: string[] },
>(
  entries: T[],
) => {
  const childrenByParentId = new Map<string, T[]>();
  for (const entry of entries) {
    if (entry.parentId) {
      childrenByParentId.set(entry.parentId, [
        ...(childrenByParentId.get(entry.parentId) ?? []),
        entry,
      ]);
    }
  }
  const coursesById = new Map<string, string[]>();
  const resolveCourses = (entry: T): string[] => {
    const known = coursesById.get(entry.id);
    if (known) return known;
    const courses = [
      ...new Set([
        ...entry.courses,
        ...(childrenByParentId.get(entry.id) ?? []).flatMap(resolveCourses),
      ]),
    ].sort();
    coursesById.set(entry.id, courses);
    return courses;
  };
  return entries.map((entry) => ({ ...entry, courses: resolveCourses(entry) }));
};

const pushDownLearningObjectiveSources = <
  T extends { id: string; parentId: string | null; source: string },
>(
  entries: T[],
) => {
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));
  const parentIds = new Set(entries.map((entry) => entry.parentId));
  const inheritedSourcesById = new Map<string, string>();
  const resolveSource = (entry: T): string => {
    const known = inheritedSourcesById.get(entry.id);
    if (known !== undefined) return known;
    const parent = entry.parentId ? entriesById.get(entry.parentId) : undefined;
    const source = entry.source || (parent ? resolveSource(parent) : "");
    inheritedSourcesById.set(entry.id, source);
    return source;
  };
  return entries.map((entry) => ({
    ...entry,
    source: parentIds.has(entry.id) ? "" : resolveSource(entry),
  }));
};

const BULLET_LINE_MATCH = /^- /;

const splitLearningObjectiveText = (markdown: string) => {
  const [lead, ...rest] = markdown.split("\n\n");
  const bulletLines = rest.join("\n").split("\n");
  const hasBullets =
    rest.length > 0 &&
    bulletLines.every((line) => BULLET_LINE_MATCH.test(line));
  if (hasBullets) {
    return {
      text: lead.replaceAll("\n", " "),
      items: bulletLines.map((line) => line.replace(BULLET_LINE_MATCH, "")),
    };
  }
  return { text: markdown.replace(/\s*\n+\s*/g, " "), items: [] as string[] };
};

const readZipEntries = (buffer: Buffer) => {
  const endOffset = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (endOffset < 0) throw new Error("Not a valid zip file.");
  const entryCount = buffer.readUInt16LE(endOffset + 10);
  const directoryOffset = buffer.readUInt32LE(endOffset + 16);
  const entries = new Map<string, Buffer>();
  let cursor = directoryOffset;
  for (let index = 0; index < entryCount; index++) {
    if (buffer.readUInt32LE(cursor) !== CENTRAL_DIRECTORY_ENTRY) {
      throw new Error("Corrupt zip central directory.");
    }
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.toString("utf8", cursor + 46, cursor + 46 + nameLength);
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const data = buffer.subarray(dataStart, dataStart + compressedSize);
    entries.set(name, method === 0 ? data : zlib.inflateRawSync(data));
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
};

const decodeXml = (value: string) =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/_x([0-9a-f]{4})_/gi, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    )
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");

const readTextRuns = (xml: string) =>
  Array.from(
    xml
      .replace(/<rPh[\s\S]*?<\/rPh>/g, "")
      .matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>|<t\s*\/>/g),
    (match) => decodeXml(match[1] ?? ""),
  ).join("");

const readSharedStrings = (xml: string) =>
  Array.from(xml.matchAll(/<si>([\s\S]*?)<\/si>|<si\s*\/>/g), (match) =>
    readTextRuns(match[1] ?? ""),
  );

const columnIndexOf = (reference: string) =>
  Array.from(reference.replace(/\d+/g, "")).reduce(
    (total, letter) => total * 26 + letter.charCodeAt(0) - 64,
    0,
  ) - 1;

const readSheetRows = (xml: string, sharedStrings: string[]) =>
  Array.from(xml.matchAll(/<row\s[^>]*?>([\s\S]*?)<\/row>/g), (rowMatch) => {
    const cells: string[] = [];
    for (const cellMatch of rowMatch[1].matchAll(
      /<c\s([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g,
    )) {
      const attributes = cellMatch[1];
      const body = cellMatch[2] ?? "";
      const reference = /\br="([A-Z]+\d+)"/.exec(attributes)?.[1];
      if (!reference) continue;
      const type = /\bt="(\w+)"/.exec(attributes)?.[1];
      const rawValue = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1] ?? "";
      const value =
        type === "s"
          ? (sharedStrings[Number(rawValue)] ?? "")
          : type === "inlineStr"
            ? readTextRuns(body)
            : decodeXml(rawValue);
      cells[columnIndexOf(reference)] = value;
    }
    return Array.from(cells, (cell) => cell ?? "");
  });

const readXlsxWorkbook = async (filePath: string) => {
  const entries = readZipEntries(await fs.readFile(filePath));
  const readEntry = (name: string) => {
    const entry = entries.get(name);
    if (!entry) throw new Error(`Missing ${name} in ${filePath}.`);
    return entry.toString("utf8");
  };
  const sharedStrings = readSharedStrings(readEntry("xl/sharedStrings.xml"));
  const relationshipTargets = new Map(
    Array.from(
      readEntry("xl/_rels/workbook.xml.rels").matchAll(
        /<Relationship\s[^>]*>/g,
      ),
      (match) => [
        /\bId="([^"]*)"/.exec(match[0])?.[1] ?? "",
        /\bTarget="([^"]*)"/.exec(match[0])?.[1] ?? "",
      ],
    ),
  );
  return Array.from(
    readEntry("xl/workbook.xml").matchAll(/<sheet\s[^>]*\/>/g),
    (match) => {
      const name = decodeXml(/\bname="([^"]*)"/.exec(match[0])?.[1] ?? "");
      const relationshipId = /\br:id="([^"]*)"/.exec(match[0])?.[1] ?? "";
      const target = (relationshipTargets.get(relationshipId) ?? "").replace(
        /^\/?(xl\/)?/,
        "",
      );
      const rows = readSheetRows(readEntry(`xl/${target}`), sharedStrings);
      const width = Math.max(0, ...rows.map((row) => row.length));
      return {
        name,
        rows: rows.map((row) =>
          Array.from({ length: width }, (_, index) => row[index] ?? ""),
        ),
      };
    },
  );
};

const EXCLUDED_SUBJECTS = ["034"];

const readVersion = async (version: (typeof VERSIONS)[number]) => {
  const workbook = await readXlsxWorkbook(
    path.join(EXTERNAL_FOLDER, version.file),
  );
  const releaseRow = workbook
    .find((sheet) => sheet.name === "Reader Instructions")
    ?.rows.find((row) => row[1] === "For ECQB release:");
  const results = workbook
    .filter((sheet) => /^\d{3}/.test(sheet.name))
    .filter((sheet) => !EXCLUDED_SUBJECTS.includes(sheet.name.slice(0, 3)))
    .map((sheet) =>
      parseLearningObjectiveSheet(sheet.rows, {
        ...version.columns,
        subject: sheet.name.slice(0, 3),
      }),
    );
  return {
    ...version,
    ecqbRelease: releaseRow?.[2] || null,
    entries: results.flatMap((result) => result.entries),
    skipped: results.reduce(
      (total, result) =>
        total + result.skipped.withoutReference + result.skipped.withoutText,
      0,
    ),
  };
};

const writeYaml = (file: string, value: unknown) =>
  fs.writeFile(path.join(OUTPUT_FOLDER, file), YAML.stringify(value));

const versions = await Promise.all(VERSIONS.map(readVersion));
const links = versions.slice(1).map((version, index) =>
  linkLearningObjectiveVersions({
    matching: version.matching,
    previous: { version: versions[index].id, entries: versions[index].entries },
    current: { version: version.id, entries: version.entries },
  }),
);
const rowsByVersion = versions.map((_version, index) => {
  const base = index === 0 ? links[0].previous : links[index - 1].current;
  const nextIdsById = new Map(
    (links[index]?.previous ?? []).map((row) => [row.id, row.nextIds]),
  );
  return pushDownLearningObjectiveSources(
    bubbleLearningObjectiveCourses(base),
  ).map((row) => ({
    ...row,
    ...splitLearningObjectiveText(row.text),
    nextIds: index === 0 ? row.nextIds : (nextIdsById.get(row.id) ?? []),
  }));
});

await fs.mkdir(OUTPUT_FOLDER, { recursive: true });
const subjectConfigFile = "content/question-bank-atpl_a/metadata.yaml";
const subjectConfig = YAML.parse(
  await fs.readFile(subjectConfigFile, "utf-8").catch(() => "{}"),
) as object;
await fs.writeFile(
  subjectConfigFile,
  YAML.stringify({
    ...subjectConfig,
    learningObjectivesVersions: versions.map((version, index) => ({
      id: version.id,
      position: index + 1,
      name: version.name,
      description: version.description,
      ecqbRelease: version.ecqbRelease,
      sourceFile: version.file,
      numberOfLearningObjectives: rowsByVersion[index].length,
    })),
  }),
);
for (const [index, version] of versions.entries()) {
  await writeYaml(`${version.id}.yaml`, rowsByVersion[index]);
  const changes = ["new", "unchanged", "renumbered", "reworded"].map(
    (change) =>
      `${rowsByVersion[index].filter((row) => row.change === change).length} ${change}`,
  );
  console.info(
    `${version.id}: ${rowsByVersion[index].length} entries (${changes.join(", ")}; ${rowsByVersion[index].filter((row) => row.nextIds.length === 0).length} without next; ${version.skipped} rows skipped)`,
  );
}
