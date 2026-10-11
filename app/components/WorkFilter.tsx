"use client";
import { useState } from "react";
import { projects, films } from "../data";
import Reveal from "./Reveal";

export default function WorkFilter() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Fashion", "Jewellery", "Concept", "Videos"];

  if (filter === "Videos") {
    return (
      <>
        <div className="filter-bar" role="group" aria-label="Filter projects">
          {filters.map(f => (
            <button onClick={() => setFilter(f)} className={filter === f ? "active" : ""} key={f}>{f}</button>
          ))}
        </div>
        <div className="work-masonry">
          {films.map((f, i) => (
            <Reveal className="work-card" delay={i * 90} key={`videos-${f.slug}`}>
              <article>
                <div className="project-media">
                  <video className="work-image" poster={f.poster} controls preload="none" playsInline>
                    <source src={f.video} type="video/mp4" />
                  </video>
                </div>
                <p className="label">{f.category}</p>
                <h2>{f.title}</h2>
                <p>{f.summary}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </>
    );
  }

  const list = filter === "All" ? projects : projects.filter(p => p.category === filter);

  return (
    <>
      <div className="filter-bar" role="group" aria-label="Filter projects">
        {filters.map(f => (
          <button onClick={() => setFilter(f)} className={filter === f ? "active" : ""} key={f}>{f}</button>
        ))}
      </div>
      <div className="work-masonry">
        {list.map((p, i) => (
          <Reveal className="work-card" delay={i * 90} key={`${filter}-${p.slug}`}>
            <article>
              <div className="project-media">
                {p.img ? (
                  <img src={p.img} alt={p.name} className="work-image" />
                ) : (
                  <div className={`work-image project-image-${p.image}`} />
                )}
              </div>
              <p className="label">{p.year} / {p.category}</p>
              <h2>{p.name}</h2>
              <p>{p.summary}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </>
  );
}