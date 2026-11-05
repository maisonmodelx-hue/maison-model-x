"use client";
import { useCallback, useState } from "react";
import { filmPieces, photoPieces } from "../pieces";
import FilterBar from "./FilterBar";
import SpiralGallery from "./SpiralGallery";
import Spreads from "./Spreads";

const ALL = "All";
const VIDEOS = "Videos";
const options = [ALL, "Fashion", "Jewellery", "Concept", VIDEOS];

function piecesFor(filter: string) {
  if (filter === VIDEOS) return filmPieces;
  return filter === ALL ? photoPieces : photoPieces.filter((piece) => piece.category === filter);
}

export default function WorkFilter() {
  const [filter, setFilter] = useState(ALL);
  const [spiralUnsupported, setSpiralUnsupported] = useState(false);
  const markUnsupported = useCallback(() => setSpiralUnsupported(true), []);

  const showSpiral = filter === ALL && !spiralUnsupported;

  return (
    <section className={`work-section ${showSpiral ? "work-section-spiral" : ""}`}>
      <FilterBar label="Filter the work" options={options} value={filter} onChange={setFilter} />
      {showSpiral ? <SpiralGallery onUnsupported={markUnsupported} /> : <Spreads key={filter} pieces={piecesFor(filter)} />}
    </section>
  );
}
