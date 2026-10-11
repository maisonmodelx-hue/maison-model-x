"use client";
import { useState } from "react";
import { films } from "../data";

export default function FilmFilter() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Fashion", "Jewellery", "Concept"];
  const list = filter === "All" ? films : films.filter(f => f.category === filter);

  return (
    <>
      <div className="filter-bar" role="group" aria-label="Filter films">
        {filters.map(f => (
          <button onClick={() => setFilter(f)} className={filter === f ? "active" : ""} key={f}>{f}</button>
        ))}
      </div>
      <div className="work-masonry">
        {list.map((film, i) => (
          <article className="work-card" key={`${filter}-${film.slug}`}>
            <div className="project-media">
              <video
                className="work-image"
                poster={film.poster}
                controls
                preload="none"
                playsInline
              >
                <source src={film.video} type="video/mp4" />
              </video>
            </div>
            <p className="label">{film.category}</p>
            <h2>{film.title}</h2>
            <p>{film.summary}</p>
          </article>
        ))}
      </div>
    </>
  );
}