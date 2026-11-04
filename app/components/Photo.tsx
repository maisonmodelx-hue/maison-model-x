import { photoSrc, photoSrcSet } from "../photo";

type PhotoProps = {
  src: string;
  sizes: string;
  alt?: string;
  className?: string;
  priority?: boolean;
};

export default function Photo({ src, sizes, alt = "", className = "photo-fill", priority = false }: PhotoProps) {
  // src stays last: React sets attributes in order, and Safari starts fetching as soon as src is set.
  return <img loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" className={className} alt={alt} sizes={sizes} srcSet={photoSrcSet(src)} src={photoSrc(src)} />;
}
