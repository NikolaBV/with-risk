import type { SanityImageValue } from "../../../types/sanity";
import { urlFor } from "../../../lib/sanity/image";
import Image from "next/image";

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

  const imageUrl = imageBuilder.width(width).auto("format").url();

  return (
    <figure className="my-8">
      <Image
        src={imageUrl}
        alt={value.alt || ""}
        className={className}
        width={width}
        height={Math.round(width * 0.5625)} // 16:9 aspect ratio
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
