export const projects = [
  { slug: "noore-ss26", name: "Nooré Fine Jewellery", category: "Jewellery", image: "jewellery", tags: ["Campaign direction", "Jewellery", "Motion"], year: "SS26", summary: "An intimate study of light, skin and sculptural gold." },
  { slug: "atelier-nuit", name: "Atelier Nuit", category: "Fashion", image: "campaign", tags: ["Editorial", "Virtual model", "Stills"], year: "AW26", summary: "A couture story built from fabric swatches and architectural shadow." },
  { slug: "forma-01", name: "Forma 01", category: "Concept", image: "hero", tags: ["Concept campaign", "Art direction", "Film"], year: "2026", summary: "A study in form, motion and impossible elegance." },
];

export const services = [
  { title: "Campaign photography", short: "Editorial and commercial visuals for launches, catalogues, e-commerce and social.", detail: "We build complete campaign worlds around your product—from casting and environment to light, lens and final grade. Every image is directed as part of one visual language." },
  { title: "Fashion films", short: "Collection films, teasers and vertical reels.", detail: "Cinematic motion for launches and always-on content, adapted for widescreen, social and retail display formats." },
  { title: "Sketch & swatch visualisation", short: "Concepts and fabric, rendered before production.", detail: "See a collection on-model before sampling. We translate drawings, technical flats and physical swatches into persuasive, art-directed visuals." },
  { title: "Exclusive virtual models", short: "A brand-owned model identity, consistent across collections and regions.", detail: "We create an original, consent-safe visual identity designed around your audience and preserved with rigorous consistency." },
  { title: "Jewellery visuals", short: "Material, setting and scale, preserved exactly.", detail: "Specialist image-making for metal, stone and fine detail, with careful control of scale, reflection, setting and wear." },
];

export function getProject(slug: string) { return projects.find((p) => p.slug === slug); }
