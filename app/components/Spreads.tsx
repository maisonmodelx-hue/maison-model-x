import type { Piece } from "../pieces";
import { buildSpreads, type Spread } from "../spreads";
import Reveal from "./Reveal";

const SHELL_MAX_WIDTH = 1440;
const SHELL_VW = 89;

// The share of the shell a piece fills on desktop, so the browser picks the right image size.
function shareOfShell(piece: Piece, spread: Spread<Piece>) {
  if (spread.kind === "offset") return piece.ratio > 1.05 ? 0.58 : 0.42;
  const totalRatio = spread.items.reduce((total, item) => total + item.ratio, 0);
  return (spread.cols / 12) * (piece.ratio / totalRatio);
}

function imageSizes(piece: Piece, spread: Spread<Piece>) {
  const share = shareOfShell(piece, spread);
  const mobile = piece.ratio > 1.05 ? "85vw" : "70vw";
  return `(max-width: 900px) ${mobile}, min(${Math.round(share * SHELL_VW)}vw, ${Math.round(share * SHELL_MAX_WIDTH)}px)`;
}

export default function Spreads({ pieces }: { pieces: Piece[] }) {
  const spreads = buildSpreads(pieces, (piece) => piece.ratio);

  return (
    <div className="spreads shell">
      {spreads.map((spread) => {
        const isLarge = spread.kind === "feature" || spread.kind === "offset";
        return (
          <section
            key={spread.items[0].id}
            className={`spread spread-${spread.kind} ${spread.flip ? "spread-flip" : ""}`}
            style={{ "--cols": spread.cols } as React.CSSProperties}
          >
            {spread.items.map((piece, i) => (
              <div className="spread-item" key={piece.id} style={{ "--ratio": piece.ratio } as React.CSSProperties}>
                <Reveal delay={i * 120}>
                  <article className={`piece ${piece.ratio > 1.05 ? "piece-wide" : "piece-upright"}`}>
                    <div className="frame">{piece.renderMedia(imageSizes(piece, spread), spread.kind === "feature")}</div>
                    <div className="work-caption">
                      <p className="label caption-meta"><span>{piece.code}</span><span>{piece.meta}</span></p>
                      <h2>{piece.title}</h2>
                      <p className="caption-summary">{piece.summary}</p>
                      {isLarge && piece.credits && <p className="label caption-credits">{piece.credits}</p>}
                    </div>
                  </article>
                </Reveal>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
