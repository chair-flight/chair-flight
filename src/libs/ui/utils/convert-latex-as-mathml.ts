type Parsed = {
  mathml: string;
  next: number;
};

const TOKEN = /\\[a-zA-Z]+|\\.|\d+(?:\.\d+)?|[a-zA-Z]|\s+|./g;
const SYMBOLS: Record<string, string> = {
  times: "×",
  cdot: "·",
  div: "÷",
  pm: "±",
  mp: "∓",
  approx: "≈",
  neq: "≠",
  ne: "≠",
  le: "≤",
  leq: "≤",
  ge: "≥",
  geq: "≥",
  infty: "∞",
  degree: "°",
  circ: "°",
  rightarrow: "→",
  to: "→",
  lfloor: "⌊",
  rfloor: "⌋",
  lceil: "⌈",
  rceil: "⌉",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  Delta: "Δ",
  theta: "θ",
  lambda: "λ",
  mu: "μ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  phi: "φ",
  omega: "ω",
  Omega: "Ω",
};
const SPACES: Record<string, string> = {
  " ": "0.28em",
  ",": "0.17em",
  ":": "0.22em",
  ";": "0.28em",
  quad: "1em",
  qquad: "2em",
};
const UNARY_PREFIXES = [
  "=",
  "(",
  "+",
  "-",
  "&",
  "{",
  "\\\\",
  "\\times",
  "\\cdot",
  "\\div",
  "\\approx",
];
const GREEK = "αβγδΔθλμπρστφωΩ";
const WORD_COMMANDS = ["text", "mathrm", "textrm", "operatorname"];

const escapeText = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const parseSequence = (
  tokens: string[],
  start: number,
  closers: string[],
): Parsed => {
  const token = tokens[start];
  if (token === undefined || closers.includes(token)) {
    return { mathml: "", next: start };
  }
  if (!token.trim()) return parseSequence(tokens, start + 1, closers);
  const previous = tokens
    .slice(0, start)
    .findLast((candidate) => candidate.trim());
  const unaryMinus =
    token === "-" &&
    (previous === undefined || UNARY_PREFIXES.includes(previous));
  const atom = unaryMinus
    ? { mathml: '<mo lspace="0" rspace="0">-</mo>', next: start + 1 }
    : parseScripted(tokens, start);
  const rest = parseSequence(tokens, atom.next, closers);
  return { mathml: atom.mathml + rest.mathml, next: rest.next };
};

const parseOperand = (tokens: string[], start: number): Parsed => {
  const token = tokens[start];
  if (token === undefined) return { mathml: "", next: start };
  if (!token.trim()) return parseOperand(tokens, start + 1);
  return parseAtom(tokens, start);
};

const parseGroup = (tokens: string[], start: number): Parsed => {
  const token = tokens[start];
  if (token === undefined) return { mathml: "<mrow></mrow>", next: start };
  if (!token.trim()) return parseGroup(tokens, start + 1);
  if (token !== "{") return parseAtom(tokens, start);
  const inner = parseSequence(tokens, start + 1, ["}"]);
  return { mathml: `<mrow>${inner.mathml}</mrow>`, next: inner.next + 1 };
};

const findClosingBrace = (
  tokens: string[],
  start: number,
  depth: number,
): number => {
  const token = tokens[start];
  if (token === undefined) return tokens.length;
  if (token === "{") return findClosingBrace(tokens, start + 1, depth + 1);
  if (token !== "}") return findClosingBrace(tokens, start + 1, depth);
  if (depth === 0) return start;
  return findClosingBrace(tokens, start + 1, depth - 1);
};

const readRawGroup = (tokens: string[], start: number): Parsed => {
  const open = tokens.indexOf("{", start);
  const closing = findClosingBrace(tokens, open + 1, 0);
  const text = tokens.slice(open + 1, closing).join("");
  return { mathml: escapeText(text), next: closing + 1 };
};

const parseRow = (
  tokens: string[],
  start: number,
  cells: string[],
): { cells: string[]; next: number } => {
  const cell = parseSequence(tokens, start, ["&", "\\\\", "\\end"]);
  const nextCells = [...cells, cell.mathml];
  if (tokens[cell.next] === "&")
    return parseRow(tokens, cell.next + 1, nextCells);
  if (tokens[cell.next] === "\\\\")
    return { cells: nextCells, next: cell.next + 1 };
  return { cells: nextCells, next: cell.next };
};

const parseRows = (
  tokens: string[],
  start: number,
  rows: string[][],
): { rows: string[][]; next: number } => {
  if (start >= tokens.length || tokens[start] === "\\end") {
    return { rows, next: start };
  }
  const row = parseRow(tokens, start, []);
  const keep = row.cells.some((cell) => cell !== "");
  return parseRows(tokens, row.next, keep ? [...rows, row.cells] : rows);
};

const buildLines = (rows: string[][]) => {
  const columns = Math.max(...rows.map((cells) => cells.length));
  const body = rows
    .map((cells) => {
      return cells
        .map((cell) => `<math class="math-cell" display="block">${cell}</math>`)
        .join("");
    })
    .join("");
  return `<div class="math-lines" data-columns="${columns}">${body}</div>`;
};

const parseCommand = (tokens: string[], start: number): Parsed => {
  const name = tokens[start].slice(1);
  if (name === "frac") {
    const numerator = parseGroup(tokens, start + 1);
    const denominator = parseGroup(tokens, numerator.next);
    return {
      mathml: `<mfrac>${numerator.mathml}${denominator.mathml}</mfrac>`,
      next: denominator.next,
    };
  }
  if (name === "sqrt") {
    const hasIndex = tokens[start + 1] === "[";
    const index = hasIndex
      ? parseSequence(tokens, start + 2, ["]"])
      : { mathml: "", next: start };
    const radicand = parseGroup(tokens, hasIndex ? index.next + 1 : start + 1);
    return {
      mathml: hasIndex
        ? `<mroot>${radicand.mathml}<mrow>${index.mathml}</mrow></mroot>`
        : `<msqrt>${radicand.mathml}</msqrt>`,
      next: radicand.next,
    };
  }
  if (WORD_COMMANDS.includes(name)) {
    const raw = readRawGroup(tokens, start + 1);
    const element = name === "text" ? "mtext" : "mi";
    const attributes = element === "mi" ? ' mathvariant="normal"' : "";
    return {
      mathml: `<${element}${attributes}>${raw.mathml}</${element}>`,
      next: raw.next,
    };
  }
  if (name === "mathbf" || name === "boldsymbol") {
    const group = parseGroup(tokens, start + 1);
    return {
      mathml: `<mrow style="font-weight:bold">${group.mathml}</mrow>`,
      next: group.next,
    };
  }
  if (name === "left") {
    const open = tokens[start + 1] === "." ? "" : tokens[start + 1];
    const inner = parseSequence(tokens, start + 2, ["\\right"]);
    const close = tokens[inner.next + 1] === "." ? "" : tokens[inner.next + 1];
    return {
      mathml: `<mrow><mo>${escapeText(open)}</mo>${inner.mathml}<mo>${escapeText(close ?? "")}</mo></mrow>`,
      next: inner.next + 2,
    };
  }
  if (name in SPACES) {
    return {
      mathml: `<mspace width="${SPACES[name]}"></mspace>`,
      next: start + 1,
    };
  }
  if (name in SYMBOLS) {
    const element = GREEK.includes(SYMBOLS[name]) ? "mi" : "mo";
    return {
      mathml: `<${element}>${SYMBOLS[name]}</${element}>`,
      next: start + 1,
    };
  }
  return { mathml: `<mo>${escapeText(name)}</mo>`, next: start + 1 };
};

const parseAtom = (tokens: string[], start: number): Parsed => {
  const token = tokens[start];
  if (token === "{") return parseGroup(tokens, start);
  if (token.startsWith("\\") && token.length > 2) {
    return parseCommand(tokens, start);
  }
  if (token.startsWith("\\")) {
    const name = token.slice(1);
    const mathml =
      name in SPACES
        ? `<mspace width="${SPACES[name]}"></mspace>`
        : `<mo>${escapeText(name)}</mo>`;
    return { mathml, next: start + 1 };
  }
  if (/^\d/.test(token))
    return { mathml: `<mn>${token}</mn>`, next: start + 1 };
  if (/^[a-zA-Z]$/.test(token)) {
    return { mathml: `<mi>${token}</mi>`, next: start + 1 };
  }
  return { mathml: `<mo>${escapeText(token)}</mo>`, next: start + 1 };
};

const parseScripted = (tokens: string[], start: number): Parsed => {
  const base = parseAtom(tokens, start);
  const first = tokens[base.next];
  if (first !== "^" && first !== "_") return base;
  const firstScript = parseOperand(tokens, base.next + 1);
  const second = tokens[firstScript.next];
  const hasSecond = second === "^" || second === "_";
  if (!hasSecond || second === first) {
    const element = first === "^" ? "msup" : "msub";
    return {
      mathml: `<${element}>${base.mathml}${firstScript.mathml}</${element}>`,
      next: firstScript.next,
    };
  }
  const secondScript = parseOperand(tokens, firstScript.next + 1);
  const subscript = first === "_" ? firstScript : secondScript;
  const superscript = first === "^" ? firstScript : secondScript;
  return {
    mathml: `<msubsup>${base.mathml}${subscript.mathml}${superscript.mathml}</msubsup>`,
    next: secondScript.next,
  };
};

export const convertLatexAsMathml = (
  latex: string,
  display: "inline" | "block",
) => {
  const tokens = latex.match(TOKEN) ?? [];
  const table = parseRows(tokens, 0, []);
  const multiline = table.rows.length > 1 || table.rows[0]?.length > 1;
  if (multiline) return buildLines(table.rows);
  return `<math display="${display}">${table.rows[0]?.[0] ?? ""}</math>`;
};
