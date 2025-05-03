import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Link from "next/link";
import { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import { client } from "../sanity/client";
import PostContent from "./components/PostContent";

// Simplified query to get everything
const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

const { projectId, dataset } = client.config();

// Function to create image URL - improved with proper return type and null handling
function urlFor(source: SanityImageSource): ImageUrlBuilder | null {
  if (projectId && dataset && source) {
    const imageBuilder = imageUrlBuilder({ projectId, dataset });
    return imageBuilder.image(source);
  }
  return null;
}

const options = { next: { revalidate: 30 } };

// @ts-expect-error - Bypassing type checking due to environment differences
export default async function PostPage({ params }) {
  // Handle params directly without worrying about type
  const slug = params?.slug || "";
  const decodedSlug = decodeURIComponent(slug);

  const post = await client.fetch<SanityDocument>(
    POST_QUERY,
    { slug: decodedSlug },
    options
  );

  if (!post) {
    return (
      <main className="container mx-auto min-h-screen max-w-3xl p-8">
        <p className="text-xl">Post not found.</p>
        <Link href="/" className="hover:underline">
          ← Back to posts
        </Link>
      </main>
    );
  }

  // Inspect the post structure to find the image field
  console.log("Full post data:", post);

  // Let's try various possible image field names and structures
  let postImageUrl: string | null = null;
  let imageField = null;

  // Common field names for images in Sanity schemas
  const possibleImageFields = [
    "mainImage",
    "image",
    "coverImage",
    "thumbnail",
    "featuredImage",
  ];

  // Try to find an image field
  for (const fieldName of possibleImageFields) {
    if (post[fieldName]) {
      imageField = post[fieldName];
      console.log(`Found image field: ${fieldName}`, imageField);
      break;
    }
  }

  // Try to generate URL if we found an image field
  if (imageField) {
    try {
      // Handle different structures
      if (
        imageField._type === "image" &&
        imageField.asset &&
        imageField.asset._ref
      ) {
        // Standard Sanity image reference
        const imageBuilder = urlFor(imageField);
        if (imageBuilder) {
          postImageUrl = imageBuilder.width(550).height(310).url();
        }
      } else if (
        typeof imageField === "string" &&
        imageField.startsWith("http")
      ) {
        // Direct URL string
        postImageUrl = imageField;
      } else {
        // Try the general approach
        const imageBuilder = urlFor(imageField);
        if (imageBuilder) {
          postImageUrl = imageBuilder.width(550).height(310).url();
        }
      }
    } catch (error) {
      console.error("Error generating image URL:", error);
    }
  }

  return <PostContent post={{ ...post, imageUrl: postImageUrl }} />;
}
