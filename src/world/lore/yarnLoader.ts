/**
 * Yarn → our dialogue data. Authors write reaction lines in Yarn Spinner
 * (try.yarnspinner.dev) — one node per reaction kind, one line per variant — and
 * export the `.yarn` source. We don't run the full Yarn runtime (no in-game
 * branching is needed); this pure loader extracts the authored lines into our
 * deterministic, no-repeat pools. See docs/art/authoring-contract.md.
 *
 * `.yarn` shape: nodes separated by lines that are exactly `===`; each node has a
 * header (`title: X` … ) then `---` then the body. Body lines that are commands
 * (`<<…>>`), options (`-> …`), comments (`//…`) or whole-line tags are skipped;
 * trailing `#hashtags` are stripped from content lines.
 */
import type { ReactionKind } from './cast';

/** node title → ordered authored lines. */
export type YarnNodes = Record<string, string[]>;

const TRAILING_TAGS = /(?:\s+#[^\s#]+)+\s*$/;

function cleanLine(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith('//')) return null;   // comment
  if (t.startsWith('<<')) return null;   // whole-line command
  if (t.startsWith('->')) return null;   // option
  if (t.startsWith('#')) return null;    // whole-line tag/metadata
  const cleaned = t
    .replace(/<<[^>]*>>/g, '')           // inline commands
    .replace(TRAILING_TAGS, '')          // trailing #hashtags
    .trim();
  return cleaned || null;
}

/** Parse `.yarn` source into { nodeTitle: lines[] }. Tolerant of CRLF + blank headers. */
export function parseYarn(text: string): YarnNodes {
  const out: YarnNodes = {};
  const blocks = text.replace(/\r\n/g, '\n').split(/^===\s*$/m);
  for (const block of blocks) {
    const sep = block.indexOf('\n---');
    if (sep === -1) continue; // not a node
    const header = block.slice(0, sep);
    const body = block.slice(sep + 4); // past '\n---'
    const titleMatch = header.match(/(?:^|\n)\s*title:\s*(.+?)\s*(?:\n|$)/i);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();
    const lines: string[] = [];
    for (const raw of body.split('\n')) {
      const line = cleanLine(raw);
      if (line) lines.push(line);
    }
    if (lines.length) out[title] = (out[title] ?? []).concat(lines);
  }
  return out;
}

const KIND_BY_TITLE: Record<string, ReactionKind> = {
  intro: 'intro', teach: 'teach', correct: 'correct', wrong: 'wrong', clear: 'clear', win: 'win',
};

export interface YarnContent {
  reactions: Partial<Record<ReactionKind, string[]>>;
  fragments: Record<string, string[]>; // soundId → memory line(s)
}

/** Map parsed nodes onto our reaction pools + per-sound story fragments. */
export function yarnToContent(nodes: YarnNodes): YarnContent {
  const reactions: Partial<Record<ReactionKind, string[]>> = {};
  const fragments: Record<string, string[]> = {};
  for (const [title, lines] of Object.entries(nodes)) {
    const kind = KIND_BY_TITLE[title.toLowerCase()];
    if (kind) { reactions[kind] = lines; continue; }
    const frag = title.match(/^Fragment[_-](.+)$/i);
    if (frag) fragments[frag[1].toLowerCase()] = lines;
  }
  return { reactions, fragments };
}

/** Convenience: text → content in one call. */
export function loadYarn(text: string): YarnContent {
  return yarnToContent(parseYarn(text));
}
