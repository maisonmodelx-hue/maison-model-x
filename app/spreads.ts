export type SpreadKind = "feature" | "pair" | "trio" | "offset";
export type Spread<T> = { kind: SpreadKind; items: T[]; flip: boolean; cols: number };

// The page's rhythm. Each turn asks for a kind of spread, then the next photos' shapes
// decide whether it fits, so the layout stays composed for any filtered list.
const CADENCE: SpreadKind[] = ["pair", "feature", "pair", "offset", "trio", "feature", "pair", "offset"];
const SIZE: Record<SpreadKind, number> = { feature: 1, offset: 1, pair: 2, trio: 3 };

const isWide = (ratio: number) => ratio >= 1.2;
const isUpright = (ratio: number) => ratio <= 1.05;

function fit(want: SpreadKind, next: number[], last?: SpreadKind): SpreadKind {
  if (want === "feature" && isWide(next[0])) return "feature";
  if (want === "offset") return "offset";
  if (last !== "trio" && next.length >= 3 && next.slice(0, 3).every(isUpright)) return "trio";
  return next.length >= 2 ? "pair" : "offset";
}

// How many of the 12 grid columns a spread fills. Every row lands on the grid, and narrower
// rows keep tall photos from growing past what fits on screen.
function columnsFor(kind: SpreadKind, ratios: number[]) {
  if (kind === "offset") return 12;
  if (kind === "feature") return ratios[0] >= 1.6 ? 12 : 9;
  const total = ratios.reduce((sum, ratio) => sum + ratio, 0);
  if (total >= 1.5) return 12;
  return total >= 1.2 ? 10 : 8;
}

export function buildSpreads<T>(items: T[], ratioOf: (item: T) => number): Spread<T>[] {
  const spreads: Spread<T>[] = [];
  const seen: Partial<Record<SpreadKind, number>> = {};
  for (let i = 0, turn = 0; i < items.length; turn++) {
    const kind = fit(CADENCE[turn % CADENCE.length], items.slice(i, i + 3).map(ratioOf), spreads.at(-1)?.kind);
    const group = items.slice(i, i + SIZE[kind]);
    const count = seen[kind] ?? 0;
    seen[kind] = count + 1;
    spreads.push({ kind, items: group, flip: count % 2 === 1, cols: columnsFor(kind, group.map(ratioOf)) });
    i += group.length;
  }
  return spreads;
}
