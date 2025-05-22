import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Link from "next/link";
import { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import { client } from "../sanity/client";
import PostContent from "./components/PostContent";
import { syncPostFromSanity } from "@/lib/services/postSync";

// Simplified query to get everything
const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  publishedAt,
  body,
  mainImage,
  author->{
    name,
    image
  }
}`;

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

  // Sync the post with our database to get the correct ID
  const syncedPost = await syncPostFromSanity(post._id);
  if (!syncedPost) {
    return (
      <main className="container mx-auto min-h-screen max-w-3xl p-8">
        <p className="text-xl">Error syncing post.</p>
        <Link href="/" className="hover:underline">
          ← Back to posts
        </Link>
      </main>
    );
  }

  // Generate image URL if mainImage exists
  let postImageUrl: string | undefined = undefined;
  if (post.mainImage) {
    const imageBuilder = urlFor(post.mainImage);
    if (imageBuilder) {
      postImageUrl = imageBuilder.width(1200).height(630).url();
    }
  }

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <PostContent post={{ ...post, id: syncedPost.id }} imageUrl={postImageUrl} />
    </main>
  );
}
