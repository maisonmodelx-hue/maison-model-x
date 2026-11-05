import type { ReactNode } from "react";
import FilmFrame from "./components/FilmFrame";
import Photo from "./components/Photo";
import { films, projects } from "./data";
import { photoRatio } from "./photo";

export type Piece = {
  id: string;
  src: string;
  category: string;
  code: string;
  title: string;
  meta: string;
  summary: string;
  credits: string;
  ratio: number;
  renderMedia: (sizes: string, isFeature: boolean) => ReactNode;
};

const FILM_RATIO = 16 / 9;

// Numbered by position in the full archive, so a piece keeps its number when the list is filtered.
export const photoPieces: Piece[] = projects.map((p, i) => ({
  id: p.slug,
  src: p.img,
  category: p.category,
  code: `MMX / ${String(i + 1).padStart(3, "0")}`,
  title: p.name,
  meta: `${p.category} / ${p.year}`,
  summary: p.summary,
  credits: p.tags.filter((tag) => tag !== p.category).join(", "),
  ratio: photoRatio(p.img),
  renderMedia: (sizes) => <Photo src={p.img} alt={`${p.name}. ${p.summary}`} sizes={sizes} />,
}));

export const filmPieces: Piece[] = films.map((f, i) => ({
  id: f.slug,
  src: f.poster,
  category: f.category,
  code: `Film / ${String(i + 1).padStart(2, "0")}`,
  title: f.title,
  meta: f.category,
  summary: f.summary,
  credits: f.tags.filter((tag) => tag !== f.category && tag !== "Film").join(", "),
  ratio: FILM_RATIO,
  renderMedia: (_sizes, isFeature) => <FilmFrame title={f.title} video={f.video} poster={f.poster} isFeature={isFeature} />,
}));
