"use client";
import Link from "next/link";
import { useState } from "react";
import { projects } from "../data";
import Reveal from "./Reveal";
export default function WorkFilter() { const [filter, setFilter] = useState("All"); const filters = ["All", "Fashion", "Jewellery", "Concept"]; const list = filter === "All" ? projects : projects.filter(p => p.category === filter);
  return <><div className="filter-bar" role="group" aria-label="Filter projects">{filters.map(f => <button onClick={() => setFilter(f)} className={filter === f ? "active" : ""} key={f}>{f}</button>)}</div><div className="work-masonry">{list.map((p, i) => <Reveal className={`work-card work-card-${i+1}`} delay={i * 90} key={`${filter}-${p.slug}`}><article><Link href={`/work/${p.slug}`}><div className="project-media" data-cursor="View"><div className={`work-image project-image-${p.image}`} /><div className="project-overlay"><span className="label">Case study</span><span aria-hidden="true">↗</span></div></div><p className="label">{p.year} / {p.category}</p><h2>{p.name}</h2><p>{p.summary}</p></Link></article></Reveal>)}</div></>;
}
