import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { parse } from "yaml";

const externalDir = ".external/data";
const dbPath = `${externalDir}/question-search.sqlite`;
const externalBankDir = `${externalDir}/other-banks/question-bank-atpl`;
const seenWindowStart = "2025-11-22";
const oldBanks = ["atpl", "a320", "b737"];
const contentBanks = ["atpl_a", "ppl_a", "a320", "b737"];

const stopWords = new Set(
  "the a an of in on at to is are was were be been by for from with as and or not no that this these those it its which what when where who whom how than then there their they them can may must shall will would should could does do did has have had into onto over under about between during after before above below up down out off if any all each both more most other some such only own same so too very also its their".split(
    " ",
  ),
);

type Row = {
  src: string;
  bank: string;
  id: string;
  chapter: string;
  los: string;
  stem: string;
  correct: string;
  body: string;
  externalIds: string;
  related: string;
  seen: number;
  members: number;
};

type QueryRow = Row & {
  rowid: number;
  kind?: string;
  score?: number;
};

type AnswerText = {
  text: unknown;
};

type QuestionTemplate = {
  question?: unknown;
  presets?: {
    correctAnswers?: AnswerText[];
  }[];
  correctAnswers?: AnswerText[];
  pairs?: {
    right: unknown;
  }[];
  definitions?: unknown[];
};

type YamlQuestion = {
  id: string;
  templates?: QuestionTemplate[];
  learningObjectives?: string[];
  externalIds?: string[];
  relatedQuestions?: string[];
};

type ExternalQuestion = {
  isDeleted?: boolean;
  questionUid: string;
  questionText: string;
  explanationText?: string;
  subjectInfo: {
    topicCode: string | number;
  };
  answers: {
    isCorrect: boolean;
    answerText: string;
  }[];
  seenInExamExternal?: {
    datesSeen: {
      rows: {
        date: string;
        count: number;
      }[];
    }[];
  }[];
};

type YamlLearningObjective = {
  id: string;
  text: string;
  source?: string;
};

const decodeEntities = (text: string) =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, " ");

const cleanText = (text: unknown) =>
  decodeEntities(String(text ?? ""))
    .replace(/\s+/g, " ")
    .trim();

const normaliseStem = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const collectStrings = (value: unknown): string[] =>
  typeof value === "string"
    ? [value]
    : Array.isArray(value)
      ? value.flatMap(collectStrings)
      : value && typeof value === "object"
        ? Object.values(value).flatMap(collectStrings)
        : [];

const collectCorrect = (template: QuestionTemplate): string[] => [
  ...(template.presets ?? []).flatMap((preset) =>
    (preset.correctAnswers ?? []).flatMap((answer) =>
      collectStrings(answer.text),
    ),
  ),
  ...(template.correctAnswers ?? []).flatMap((answer) =>
    collectStrings(answer.text),
  ),
  ...(template.pairs ?? []).flatMap((pair) => collectStrings(pair.right)),
  ...(template.definitions ?? []).flatMap((item) => collectStrings(item)),
];

const chapterOf = (id: string) => id.split(".").slice(0, 2).join(".");

const loadYamlQuestions = (src: string, bank: string, dir: string): Row[] =>
  !existsSync(`${dir}/questions`)
    ? []
    : readdirSync(`${dir}/questions`)
        .filter((file) => file.endsWith(".yaml"))
        .flatMap((file) => {
          const questions: unknown = parse(
            readFileSync(`${dir}/questions/${file}`, "utf8"),
          );
          return !Array.isArray(questions)
            ? []
            : (questions as YamlQuestion[]).map((question): Row => {
                const templates = question.templates ?? [];
                const los: string[] = question.learningObjectives ?? [];
                const stems = templates
                  .map((template) => cleanText(template.question ?? ""))
                  .filter(Boolean);
                return {
                  src,
                  bank,
                  id: question.id,
                  chapter: file.replace(".yaml", "") || chapterOf(los[0] ?? ""),
                  los: los.join(" "),
                  stem: stems.join(" || "),
                  correct: templates
                    .flatMap(collectCorrect)
                    .map(cleanText)
                    .join(" | "),
                  body: cleanText(collectStrings(templates).join(" ")),
                  externalIds: (question.externalIds ?? []).join(" "),
                  related: (question.relatedQuestions ?? []).join(" "),
                  seen: 0,
                  members: 1,
                };
              });
        });

const loadExternalQuestions = (): Row[] =>
  readdirSync(externalBankDir)
    .filter((file) => file.endsWith(".json"))
    .flatMap((file) => {
      const raw: ExternalQuestion[] = JSON.parse(
        readFileSync(`${externalBankDir}/${file}`, "utf8"),
      );
      const groups = raw
        .filter((question) => !question.isDeleted)
        .reduce((accumulated, question) => {
          const key = `${question.subjectInfo.topicCode}|${normaliseStem(cleanText(question.questionText))}`;
          accumulated.set(key, [...(accumulated.get(key) ?? []), question]);
          return accumulated;
        }, new Map<string, ExternalQuestion[]>());
      return [...groups.values()].map((members): Row => {
        const best =
          members.find((member) =>
            member.answers.some((answer) => answer.isCorrect),
          ) ?? members[0];
        const topic = String(best.subjectInfo.topicCode);
        const correct = best.answers
          .filter((answer) => answer.isCorrect)
          .map((answer) => cleanText(answer.answerText));
        const wrong = best.answers
          .filter((answer) => !answer.isCorrect)
          .map((answer) => cleanText(answer.answerText));
        const explanation = cleanText(
          members.find((member) => member.explanationText)?.explanationText,
        );
        return {
          src: "ext",
          bank: "atpl",
          id: members.map((member) => member.questionUid).join(" "),
          chapter: `${topic.slice(0, 3)}.${topic.slice(3)}`,
          los: "",
          stem: cleanText(best.questionText),
          correct: correct.join(" | "),
          body: cleanText(`${wrong.join(" ")} ${explanation}`),
          externalIds: "",
          related: "",
          seen: Math.max(
            ...members.map((member) =>
              (member.seenInExamExternal ?? []).reduce(
                (total, entry) =>
                  total +
                  entry.datesSeen.reduce(
                    (yearTotal, year) =>
                      yearTotal +
                      year.rows
                        .filter((row) => row.date >= seenWindowStart)
                        .reduce((sum, row) => sum + row.count, 0),
                    0,
                  ),
                0,
              ),
            ),
          ),
          members: members.length,
        };
      });
    });

const loadLearningObjectives = (): Row[] => {
  const dir = "content/question-bank-atpl_a/learning-objectives";
  const latest = readdirSync(dir)
    .filter((file) => /^v\d+\.yaml$/.test(file))
    .sort(
      (a, b) =>
        Number.parseInt(b.slice(1), 10) - Number.parseInt(a.slice(1), 10),
    )[0];
  const learningObjectives: YamlLearningObjective[] = parse(
    readFileSync(`${dir}/${latest}`, "utf8"),
  );
  return learningObjectives.map(
    (item): Row => ({
      src: "lo",
      bank: "atpl_a",
      id: item.id,
      chapter: chapterOf(item.id),
      los: item.id,
      stem: cleanText(item.text),
      correct: "",
      body: cleanText(item.source ?? ""),
      externalIds: "",
      related: "",
      seen: 0,
      members: 1,
    }),
  );
};

const build = () => {
  rmSync(dbPath, { force: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE entries (
      rowid INTEGER PRIMARY KEY, src TEXT, bank TEXT, id TEXT, chapter TEXT,
      los TEXT, stem TEXT, correct TEXT, body TEXT, external_ids TEXT,
      related TEXT, seen INTEGER, members INTEGER
    );
    CREATE TABLE links (a INTEGER, b INTEGER, kind TEXT);
    CREATE TABLE uid_index (uid TEXT, rowid INTEGER);
    CREATE INDEX entries_chapter ON entries (chapter);
    CREATE INDEX entries_id ON entries (id);
    CREATE INDEX uid_index_uid ON uid_index (uid);
    CREATE VIRTUAL TABLE fts USING fts5(
      stem, correct, body, content='entries', content_rowid='rowid',
      tokenize='porter unicode61'
    );
  `);
  const rows: Row[] = [
    ...contentBanks.flatMap((bank) =>
      loadYamlQuestions("cf", bank, `content/question-bank-${bank}`),
    ),
    ...oldBanks.flatMap((bank) =>
      loadYamlQuestions(
        "old",
        bank,
        `${externalDir}/old-content/question-bank-${bank}`,
      ),
    ),
    ...loadExternalQuestions(),
    ...loadLearningObjectives(),
  ];
  const insert = db.prepare(
    "INSERT INTO entries VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
  );
  const insertUid = db.prepare("INSERT INTO uid_index VALUES (?,?)");
  db.exec("BEGIN");
  rows.forEach((row, index) => {
    const rowid = index + 1;
    insert.run(
      rowid,
      row.src,
      row.bank,
      row.id,
      row.chapter,
      row.los,
      row.stem,
      row.correct,
      row.body,
      row.externalIds,
      row.related,
      row.seen,
      row.members,
    );
    const uids = row.src === "ext" ? row.id.split(" ") : [row.id];
    for (const uid of uids) insertUid.run(uid, rowid);
  });
  db.exec(
    "INSERT INTO fts(rowid, stem, correct, body) SELECT rowid, stem, correct, body FROM entries",
  );
  const insertLink = db.prepare("INSERT INTO links VALUES (?,?,?)");
  const findUid = db.prepare(
    "SELECT rowid FROM uid_index WHERE uid = ? AND rowid != ?",
  );
  const linkKeys = new Set<string>();
  const addLink = (a: number, b: number, kind: string) =>
    [`${a}|${b}|${kind}`, `${b}|${a}|${kind}`].forEach((key, index) => {
      if (linkKeys.has(key)) return;
      linkKeys.add(key);
      if (index === 0) insertLink.run(a, b, kind);
      else insertLink.run(b, a, kind);
    });
  rows.forEach((row, index) => {
    const rowid = index + 1;
    const targets = (uids: string, kind: string) => {
      for (const uid of uids.split(" ").filter(Boolean)) {
        const found = findUid.all(uid, rowid) as { rowid: number }[];
        for (const target of found) addLink(rowid, target.rowid, kind);
      }
    };
    targets(row.externalIds, "externalId");
    targets(row.related, "related");
    if (row.src !== "ext" && row.src !== "lo") targets(row.id, "sameId");
  });
  db.exec(`
    UPDATE entries SET los = (
      SELECT group_concat(DISTINCT c.los) FROM links l
      JOIN entries c ON c.rowid = l.a
      WHERE l.b = entries.rowid AND l.kind = 'externalId' AND c.src != 'ext'
    ) WHERE src = 'ext';
    UPDATE entries SET los = coalesce(los, '');
  `);
  const chapterOfLos = (value: string) => {
    const votes = value
      .split(/[ ,]/)
      .filter(Boolean)
      .reduce((accumulated, id) => {
        const chapter = chapterOf(id);
        accumulated.set(chapter, (accumulated.get(chapter) ?? 0) + 1);
        return accumulated;
      }, new Map<string, number>());
    return [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  };
  const setChapter = db.prepare(
    "UPDATE entries SET chapter = ? WHERE rowid = ?",
  );
  const externalRows = db
    .prepare("SELECT rowid, los FROM entries WHERE src = 'ext' AND los != ''")
    .all() as { rowid: number; los: string }[];
  for (const row of externalRows) {
    const chapter = chapterOfLos(row.los);
    if (chapter) setChapter.run(chapter, row.rowid);
  }
  db.exec("COMMIT");
  const counts = db
    .prepare("SELECT src, bank, count(*) n FROM entries GROUP BY src, bank")
    .all() as { src: string; bank: string; n: number }[];
  const linkCount = db.prepare("SELECT count(*) n FROM links").get() as {
    n: number;
  };
  console.log(
    counts.map((row) => `${row.src}/${row.bank}: ${row.n}`).join("\n"),
  );
  console.log(`links: ${linkCount.n}`);
};

const tokenise = (text: string) => [
  ...new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(
        (token) =>
          token &&
          !stopWords.has(token) &&
          (token.length > 2 || /\d/.test(token)),
      ),
  ),
];

const buildFtsQuery = (text: string, maxTokens = 24) =>
  tokenise(text)
    .slice(0, maxTokens)
    .map((token) => `"${token}"`)
    .join(" OR ");

const parseFlags = (args: string[]) => {
  const flags = new Map<string, string>();
  const positional: string[] = [];
  for (let index = 0; index < args.length; index++) {
    if (args[index].startsWith("--"))
      flags.set(args[index].slice(2), args[++index]);
    else positional.push(args[index]);
  }
  return { flags, positional };
};

const formatRow = (row: QueryRow, reason = "") => {
  const tag = `${row.src}/${row.bank}`.padEnd(8);
  const seen = row.src === "ext" ? ` seen=${row.seen} x${row.members}` : "";
  const ids =
    row.src === "ext" ? row.id.split(" ").slice(0, 3).join(",") : row.id;
  const los = row.los
    ? ` LO:${row.los.split(/[ ,]/).filter(Boolean).slice(0, 2).join(",")}`
    : "";
  const answer = row.correct ? `\n      A: ${row.correct.slice(0, 140)}` : "";
  return `${tag} ${row.chapter.padEnd(6)} ${ids}${seen}${los}${reason ? `  [${reason}]` : ""}\n      Q: ${row.stem.slice(0, 200)}${answer}`;
};

const openDb = () => {
  if (!existsSync(dbPath))
    throw new Error("run: node src/slop/question-search.ts build");
  return new DatabaseSync(dbPath, { readOnly: true });
};

const sourceFilter = (flags: Map<string, string>) => {
  const sources = (flags.get("src") ?? "cf,old,ext").split(",");
  return `e.src IN (${sources.map((source) => `'${source}'`).join(",")})`;
};

const keywordSearch = (
  db: DatabaseSync,
  text: string,
  flags: Map<string, string>,
  exclude: number[] = [],
) => {
  const query = buildFtsQuery(text);
  if (!query) return [];
  const chapter = flags.get("chapter");
  const lo = flags.get("lo");
  return db
    .prepare(
      `SELECT e.*, bm25(fts, 6.0, 3.0, 1.0) AS score FROM fts
       JOIN entries e ON e.rowid = fts.rowid
       WHERE fts MATCH ? AND ${sourceFilter(flags)}
       ${chapter ? `AND e.chapter LIKE '${chapter}%'` : ""}
       ${lo ? `AND e.los LIKE '%${lo}%'` : ""}
       ${exclude.length ? `AND e.rowid NOT IN (${exclude.join(",")})` : ""}
       ORDER BY score LIMIT ?`,
    )
    .all(query, Number(flags.get("limit") ?? 15)) as QueryRow[];
};

const search = (args: string[]) => {
  const { flags, positional } = parseFlags(args);
  const db = openDb();
  for (const row of keywordSearch(db, positional.join(" "), flags))
    console.log(formatRow(row));
};

const chapterList = (args: string[]) => {
  const { flags, positional } = parseFlags(args);
  const db = openDb();
  const limit = Number(flags.get("limit") ?? 40);
  const chapterRows = db
    .prepare(
      `SELECT e.* FROM entries e
       WHERE e.chapter LIKE ? AND e.src != 'lo' AND ${sourceFilter(flags)}
       ORDER BY e.seen DESC, e.members DESC LIMIT ?`,
    )
    .all(`${positional[0]}%`, limit) as QueryRow[];
  for (const row of chapterRows) console.log(formatRow(row));
};

const related = (args: string[]) => {
  const { flags, positional } = parseFlags(args);
  const db = openDb();
  const anchors = db
    .prepare(
      `SELECT e.* FROM uid_index u JOIN entries e ON e.rowid = u.rowid
       WHERE u.uid = ?`,
    )
    .all(positional[0]) as QueryRow[];
  if (!anchors.length) throw new Error(`no entry with id ${positional[0]}`);
  const anchor = anchors[0];
  console.log("ANCHOR");
  console.log(formatRow(anchor));
  const seenRowids = new Set<number>([anchor.rowid]);
  const show = (
    title: string,
    rows: QueryRow[],
    reason: (row: QueryRow) => string,
  ) => {
    const fresh = rows.filter((row) => !seenRowids.has(row.rowid));
    if (!fresh.length) return;
    console.log(`\n${title} (${fresh.length})`);
    for (const row of fresh) {
      seenRowids.add(row.rowid);
      console.log(formatRow(row, reason(row)));
    }
  };
  show(
    "LINKED (shared externalIds / relatedQuestions)",
    db
      .prepare(
        `SELECT e.*, l.kind FROM links l JOIN entries e ON e.rowid = l.b
         WHERE l.a = ? AND e.src != 'lo' AND ${sourceFilter(flags)}
         ORDER BY e.src, e.seen DESC`,
      )
      .all(anchor.rowid) as QueryRow[],
    (row) => row.kind ?? "",
  );
  const linkedOnce = [...seenRowids];
  const reachableLos = [
    ...new Set(
      [
        anchor,
        ...(db
          .prepare(
            `SELECT e.* FROM entries e WHERE e.rowid IN (${linkedOnce.join(",")})`,
          )
          .all() as QueryRow[]),
      ]
        .flatMap((row) => row.los.split(/[ ,]/))
        .filter(Boolean),
    ),
  ];
  show(
    "SECOND HOP (linked to the linked, same externalId cluster)",
    db
      .prepare(
        `SELECT DISTINCT e.* FROM links l1 JOIN links l2 ON l2.a = l1.b
         JOIN entries e ON e.rowid = l2.b
         WHERE l1.a = ? AND e.src != 'lo' AND ${sourceFilter(flags)}`,
      )
      .all(anchor.rowid) as QueryRow[],
    () => "2-hop",
  );
  for (const lo of reachableLos) {
    show(
      `SAME LO ${lo}`,
      db
        .prepare(
          `SELECT e.* FROM entries e
           WHERE e.src != 'lo' AND (e.los LIKE ? ) AND ${sourceFilter(flags)}
           ORDER BY e.src, e.seen DESC LIMIT ?`,
        )
        .all(`%${lo}%`, Number(flags.get("lo-limit") ?? 12)) as QueryRow[],
      () => "LO",
    );
  }
  const keywordText = `${anchor.stem} ${anchor.correct}`;
  const keywordHits = keywordSearch(db, keywordText, flags, [...seenRowids]);
  show(
    "KEYWORD (bm25 over stem + correct answers, any chapter)",
    keywordHits,
    (row) => `kw ${(row.score ?? 0).toFixed(1)}`,
  );
  show(
    `SAME CHAPTER ${anchor.chapter} (top seen, not yet shown)`,
    db
      .prepare(
        `SELECT e.* FROM entries e WHERE e.chapter = ? AND e.src != 'lo'
         AND ${sourceFilter(flags)} ORDER BY e.seen DESC, e.src LIMIT ?`,
      )
      .all(
        anchor.chapter,
        Number(flags.get("chapter-limit") ?? 10),
      ) as QueryRow[],
    () => "chapter",
  );
};

const topClusters = (args: string[]) => {
  const { flags, positional } = parseFlags(args);
  const db = openDb();
  const rows = db
    .prepare(
      `SELECT * FROM entries WHERE src = 'ext' AND chapter = ?
       ORDER BY seen DESC, members DESC`,
    )
    .all(positional[0]) as QueryRow[];
  const parents = rows.map((_, index) => index);
  const find = (index: number): number => {
    if (parents[index] === index) return index;
    parents[index] = find(parents[index]);
    return parents[index];
  };
  const tokenSets = rows.map(
    (row) => new Set(tokenise(`${row.stem} ${row.correct}`)),
  );
  const linkedIds = rows.map((row) => {
    const links = db
      .prepare(
        `SELECT DISTINCT e.id FROM links l JOIN entries e ON e.rowid = l.b
         WHERE l.a = ? AND l.kind = 'externalId' AND e.src != 'ext'`,
      )
      .all(row.rowid) as { id: string }[];
    return links.map((link) => link.id);
  });
  for (const left of rows.keys()) {
    for (const right of rows.keys()) {
      if (right <= left) continue;
      const shared = [...tokenSets[left]].filter((token) =>
        tokenSets[right].has(token),
      ).length;
      const dice =
        (2 * shared) / (tokenSets[left].size + tokenSets[right].size || 1);
      if (dice >= 0.6) parents[find(right)] = find(left);
    }
  }
  const clusters = rows.reduce((accumulated, _row, index) => {
    const root = find(index);
    accumulated.set(root, [...(accumulated.get(root) ?? []), index]);
    return accumulated;
  }, new Map<number, number[]>());
  const ranked = [...clusters.values()]
    .map((members) => ({
      members,
      seen: Math.max(...members.map((index) => rows[index].seen)),
    }))
    .sort((a, b) => b.seen - a.seen)
    .slice(0, Number(flags.get("limit") ?? 8));
  const allowedUid = (uid: string) => /^(AVEXAM|ATPLQ|BGS)-/.test(uid);
  if (flags.has("json")) {
    console.log(
      JSON.stringify(
        ranked.map((cluster) => ({
          seen: cluster.seen,
          linked: [
            ...new Set(cluster.members.flatMap((index) => linkedIds[index])),
          ],
          rows: cluster.members.map((index) => ({
            seen: rows[index].seen,
            uids: rows[index].id.split(" ").filter(allowedUid),
            los: rows[index].los,
            stem: rows[index].stem,
            correct: rows[index].correct,
          })),
        })),
      ),
    );
    return;
  }
  ranked.forEach((cluster, position) => {
    const linked = [
      ...new Set(cluster.members.flatMap((index) => linkedIds[index])),
    ];
    console.log(
      `\n#${position + 1} seen=${cluster.seen} rows=${cluster.members.length} linked=${linked.join(",") || "none"}`,
    );
    cluster.members
      .slice(0, Number(flags.get("rows") ?? 6))
      .forEach((index) => {
        const row = rows[index];
        console.log(
          `  [${row.seen}] ${row.id.split(" ").filter(allowedUid).join(",")} LO:${row.los || "-"}\n     Q: ${row.stem.slice(0, 170)}\n     A: ${row.correct.slice(0, 120)}`,
        );
      });
  });
};

const [command, ...rest] = process.argv.slice(2);
const commands: Record<string, (args: string[]) => void> = {
  build,
  search,
  chapter: chapterList,
  related,
  top: topClusters,
};
if (!commands[command])
  console.log(
    "usage: node src/slop/question-search.ts build | search <text> [--chapter 050.03] [--lo 050.03.01] [--src cf,old,ext] [--limit N] | chapter <050.03> [--src ext] | related <QID|externalUid>",
  );
else commands[command](rest);
