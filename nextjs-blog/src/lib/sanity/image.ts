import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import { client } from "../../app/sanity/client";
import type { SanityImageValue } from "../../types/sanity";

const { projectId, dataset } = client.config();

export function urlFor(source: SanityImageSource): ImageUrlBuilder | null {
  if (projectId && dataset && source) {
    const imageBuilder = imageUrlBuilder({ projectId, dataset });
    return imageBuilder.image(source);
  }
  return null;
}

export function getPostImageUrl(
  post: { [key: string]: unknown },
  options: { width?: number; height?: number } = {}
): string | null {
  const width = options.width || 800;
  const height = options.height || 450;

  const possibleImageFields = [
    "mainImage",
    "image",
    "coverImage",
    "thumbnail",
    "featuredImage",
  ];

  // Find the first available image field
  const imageField = possibleImageFields.reduce<
    SanityImageValue | string | null
  >((found, fieldName) => {
    if (found) return found;
    const fieldValue = post[fieldName];
    if (
      typeof fieldValue === "string" ||
      (fieldValue && typeof fieldValue === "object")
    ) {
      return fieldValue as SanityImageValue | string;
    }
    return null;
  }, null);

  if (!imageField) return null;

  try {
    if (typeof imageField === "string") {
      return imageField.startsWith("http") ? imageField : null;
    }

    const imageBuilder = urlFor(imageField);
    return imageBuilder?.width(width).height(height).url() || null;
  } catch (error) {
    console.error("Error generating image URL:", error);
    return null;
  }
}
