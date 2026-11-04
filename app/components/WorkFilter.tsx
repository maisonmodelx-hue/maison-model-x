"use client";
import { useState } from "react";
import { projects, films } from "../data";
import { photoSrc } from "../photo";
import Photo from "./Photo";
import Reveal from "./Reveal";

const WORK_IMAGE_SIZES = "(max-width: 900px) 85vw, 55vw";

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
            <Reveal className="work-card" delay={(i % 3) * 90} key={`videos-${f.slug}`}>
              <article>
                <div className="project-media">
                  <video className="work-image" poster={photoSrc(f.poster, 1024)} controls preload="none" playsInline>
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
          <Reveal className="work-card" delay={(i % 3) * 90} key={`${filter}-${p.slug}`}>
            <article>
              <div className="project-media">
                {p.fit === "cover" ? (
                  <div className="work-image"><Photo src={p.img} alt={p.name} sizes={WORK_IMAGE_SIZES} /></div>
                ) : (
                  <Photo src={p.img} alt={p.name} className="work-image" sizes={WORK_IMAGE_SIZES} />
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