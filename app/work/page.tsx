import type { Metadata } from "next";
import WorkFilter from "../components/WorkFilter";
export const metadata: Metadata = { title: "Work", description: "Selected fashion, jewellery and concept campaigns by Maison Model X." };
export default function WorkPage() { return <main id="main-content" className="page-main ivory"><section className="page-hero shell"><p className="eyebrow">The work / 2026</p><h1>Campaigns shaped<br/>by <em>imagination.</em></h1><p className="page-lead">Fashion imagery and cinematic film, directed with a singular eye and produced with new creative tools.</p></section><section className="work-section shell"><WorkFilter/></section></main>; }
