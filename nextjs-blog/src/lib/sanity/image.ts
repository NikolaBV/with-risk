import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import { client } from "../../app/sanity/client";

const { projectId, dataset } = client.config();

/**
 * Create a URL builder for Sanity images
 * @param source The Sanity image source
 * @returns An image URL builder or null if required data is missing
 */
export function urlFor(source: SanityImageSource): ImageUrlBuilder | null {
  if (projectId && dataset && source) {
    const imageBuilder = imageUrlBuilder({ projectId, dataset });
    return imageBuilder.image(source);
  }
  return null;
}

/**
 * Find an image field in a Sanity document and generate a URL
 * @param post The Sanity document
 * @param options Options for image URL generation
 * @returns URL string or null if no image is found
 */
export function getPostImageUrl(
  post: Record<string, any>,
  options: { width?: number; height?: number } = {}
): string | null {
  const width = options.width || 800;
  const height = options.height || 450;

  let imageField = null;
  const possibleImageFields = [
    "mainImage",
    "image",
    "coverImage",
    "thumbnail",
    "featuredImage",
  ];

  // Find the first available image field
  for (const fieldName of possibleImageFields) {
    if (post[fieldName]) {
      imageField = post[fieldName];
      break;
    }
  }

  if (!imageField) return null;

  try {
    if (
      imageField._type === "image" &&
      imageField.asset &&
      imageField.asset._ref
    ) {
      const imageBuilder = urlFor(imageField);
      if (imageBuilder) {
        return imageBuilder.width(width).height(height).url();
      }
    } else if (
      typeof imageField === "string" &&
      imageField.startsWith("http")
    ) {
      return imageField;
    } else {
      const imageBuilder = urlFor(imageField);
      if (imageBuilder) {
        return imageBuilder.width(width).height(height).url();
      }
    }
  } catch (error) {
    console.error("Error generating image URL:", error);
  }

  return null;
}
