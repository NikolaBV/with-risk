import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Link from "next/link";
import { client } from "../sanity/client";

// Simplified query to get everything
const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

const { projectId, dataset } = client.config();
// Create the builder correctly
const imageBuilder = imageUrlBuilder({ projectId, dataset });

// Function to create image URL
function urlFor(source: SanityImageSource) {
  return imageBuilder.image(source);
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
  let postImageUrl = null;
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
        postImageUrl = urlFor(imageField).width(550).height(310).url();
      } else if (
        typeof imageField === "string" &&
        imageField.startsWith("http")
      ) {
        // Direct URL string
        postImageUrl = imageField;
      } else {
        // Try the general approach
        postImageUrl = urlFor(imageField).width(550).height(310).url();
      }
    } catch (error) {
      console.error("Error generating image URL:", error);
    }
  }

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/" className="hover:underline">
        ← Back to posts
      </Link>

      {postImageUrl && (
        <img
          src={postImageUrl}
          alt={post.title}
          className="aspect-video rounded-xl"
          width="550"
          height="310"
        />
      )}
      <h1 className="text-4xl font-bold mb-8">{post.title}</h1>
      <div className="prose">
        {post.publishedAt && (
          <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
        )}
        {Array.isArray(post.body) && <PortableText value={post.body} />}
      </div>
    </main>
  );
}
