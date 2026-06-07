/**
 * Twine (Twee 3) → our arc data. Authors map a character's journey in Twine and
 * export `.twee`; this pure loader turns the passages into the transformation
 * stages + per-sound story fragments. See docs/art/authoring-contract.md.
 *
 * Twee 3 passage header: `:: Name [tag1 tag2] {json-metadata}` then the body until
 * the next `::` header. We key on passage NAMES (`Stage0..Stage3`, `Fragment_<sound>`)
 * and ignore Twine's automatic `StoryData` / `StoryTitle` passages.
 */
export interface TweePassage {
  name: string;
  tags: string[];
  body: string;
}

const HEADER = /^::\s+([^[\]{]+?)\s*(?:\[([^\]]*)\])?\s*(?:\{[^}]*\})?\s*$/;

/** Parse `.twee` text into passages (name, tags, trimmed body). Tolerant of CRLF. */
export function parseTwee(text: string): TweePassage[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const passages: TweePassage[] = [];
  let cur: TweePassage | null = null;
  const bodyLines: string[] = [];
  const flush = () => {
    if (cur) { cur.body = bodyLines.join('\n').trim(); passages.push(cur); }
    bodyLines.length = 0;
  };
  for (const line of lines) {
    const m = line.match(HEADER);
    if (m) {
      flush();
      cur = { name: m[1].trim(), tags: m[2] ? m[2].split(/\s+/).filter(Boolean) : [], body: '' };
    } else if (cur) {
      bodyLines.push(line);
    }
  }
  flush();
  return passages;
}

const IGNORE = new Set(['StoryData', 'StoryTitle']);

export interface TweeArc {
  stages: string[];                    // index 0..3 → the beat at that heal stage
  fragments: Record<string, string[]>; // soundId → memory line(s), blank-line split
}

/** Map passages onto the transformation stages + per-sound fragments. */
export function tweeToArc(passages: TweePassage[]): TweeArc {
  const stages: string[] = [];
  const fragments: Record<string, string[]> = {};
  for (const p of passages) {
    if (IGNORE.has(p.name)) continue;
    const stage = p.name.match(/^Stage\s*([0-9])$/i);
    if (stage) { stages[Number(stage[1])] = p.body; continue; }
    const frag = p.name.match(/^Fragment[_-](.+)$/i);
    if (frag) {
      fragments[frag[1].toLowerCase()] = p.body.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    }
  }
  // compact stages to a dense array (drop holes), preserving order
  return { stages: stages.filter((s) => s != null), fragments };
}

export function loadTwee(text: string): TweeArc {
  return tweeToArc(parseTwee(text));
}
