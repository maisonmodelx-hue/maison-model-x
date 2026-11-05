"use client";
import { useState } from "react";
import { filmPieces } from "../pieces";
import FilterBar from "./FilterBar";
import Spreads from "./Spreads";

// Built from the films themselves, so a category with no films never shows an empty page.
const options = ["All", ...new Set(filmPieces.map((piece) => piece.category))];

export default function FilmFilter() {
  const [filter, setFilter] = useState("All");
  const pieces = filter === "All" ? filmPieces : filmPieces.filter((piece) => piece.category === filter);

  return (
    <>
      <FilterBar label="Filter films" options={options} value={filter} onChange={setFilter} />
      <Spreads key={filter} pieces={pieces} />
    </>
  );
}
