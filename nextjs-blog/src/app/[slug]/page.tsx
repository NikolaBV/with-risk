import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Link from "next/link";
import { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import { client } from "../sanity/client";
import * as util from "util";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

const { projectId, dataset } = client.config();

function urlFor(source: SanityImageSource): ImageUrlBuilder | null {
  if (projectId && dataset && source) {
    const imageBuilder = imageUrlBuilder({ projectId, dataset });
    return imageBuilder.image(source);
  }
  return null;
}

const logObject = (label: string, obj: any): void => {
  console.log(
    `${label}:`,
    util.inspect(obj, {
      depth: null,
      colors: true,
      maxArrayLength: 50,
      maxStringLength: 500,
    })
  );
};

interface SanityImageValue {
  _type?: string;
  asset?: {
    _ref: string;
    [key: string]: any;
  };
  alt?: string;
  caption?: string;
  [key: string]: any;
}

const SanityImage = ({ value }: { value: SanityImageValue }) => {
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
        src={imageBuilder.width(800).auto("format").url()}
        alt={value.alt || ""}
        className="rounded-lg"
        loading="lazy"
      />
      {value.caption && (
        <figcaption className="text-sm text-gray-600 mt-2 text-center">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
};

const options = { next: { revalidate: 30 } };

interface PostPageParams {
  params: {
    slug: string;
  };
}

export default async function PostPage({ params }: PostPageParams) {
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

  logObject("Full post data", post);

  if (post.body && Array.isArray(post.body)) {
    logObject("Post body", post.body);
  }

  let postImageUrl: string | null = null;
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
        const imageBuilder = urlFor(imageField);
        if (imageBuilder) {
          postImageUrl = imageBuilder.width(550).height(310).url();
        }
      } else if (
        typeof imageField === "string" &&
        imageField.startsWith("http")
      ) {
        postImageUrl = imageField;
      } else {
        const imageBuilder = urlFor(imageField);
        if (imageBuilder) {
          postImageUrl = imageBuilder.width(550).height(310).url();
        }
      }
    } catch (error) {
      console.error("Error generating image URL:", error);
    }
  }

  const portableTextComponents = {
    types: {
      image: SanityImage,
    },
  };

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/" className="hover:underline">
        ← Back to posts
      </Link>

      {postImageUrl && (
        <img
          src={postImageUrl}
          alt={post.title || "Post image"}
          className="aspect-video rounded-xl"
          width="550"
          height="310"
        />
      )}
      <h1 className="text-4xl font-bold mb-8">{post.title}</h1>
      <div className="prose max-w-none">
        {post.publishedAt && (
          <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
        )}
        {Array.isArray(post.body) && (
          <PortableText value={post.body} components={portableTextComponents} />
        )}
      </div>
    </main>
  );
}
