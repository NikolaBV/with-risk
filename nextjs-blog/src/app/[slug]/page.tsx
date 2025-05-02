import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Link from "next/link";
import { client } from "../sanity/client";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

const { projectId, dataset } = client.config();
const imageBuilder = imageUrlBuilder({ projectId, dataset });

function urlFor(source: SanityImageSource) {
  return imageBuilder.image(source);
}

const options = { next: { revalidate: 30 } };

export default async function PostPage({ params }) {
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

  console.log("Full post data:", post);

  let postImageUrl = null;
  let imageField = null;

  const possibleImageFields = [
    "mainImage",
    "image",
    "coverImage",
    "thumbnail",
    "featuredImage",
  ];

  for (const fieldName of possibleImageFields) {
    if (post[fieldName]) {
      imageField = post[fieldName];
      console.log(`Found image field: ${fieldName}`, imageField);
      break;
    }
  }

  if (imageField) {
    try {
      if (
        imageField._type === "image" &&
        imageField.asset &&
        imageField.asset._ref
      ) {
        postImageUrl = urlFor(imageField).width(550).height(310).url();
      } else if (
        typeof imageField === "string" &&
        imageField.startsWith("http")
      ) {
        postImageUrl = imageField;
      } else {
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
