import type { SanityImageValue } from "../../../types/sanity";
import { urlFor } from "../../../lib/sanity/image";

interface SanityImageProps {
  value: SanityImageValue;
  width?: number;
  className?: string;
}

export default function SanityImage({
  value,
  width = 800,
  className = "rounded-lg",
}: SanityImageProps) {
  if (!value?.asset?._ref) {
    return null;
  }

  const imageBuilder = urlFor(value);

  if (!imageBuilder) {
    return null;
  }

  return (
    <figure className="my-8">
      <img
        src={imageBuilder.width(width).auto("format").url()}
        alt={value.alt || ""}
        className={className}
        loading="lazy"
      />
      {value.caption && (
        <figcaption className="text-sm text-gray-600 mt-2 text-center">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}
