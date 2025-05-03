import { getPostBySlug } from "../../lib/sanity/queries";
import { logObject } from "../../lib/utils/logging";
import PostNotFound from "../../components/blog/PostNotFound";
import PostContent from "./components/PostContent";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import { client } from "../../app/sanity/client";

const { projectId, dataset } = client.config();

// Define the image field type
interface SanityImageField {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  caption?: string;
}

function urlFor(source: SanityImageSource): ImageUrlBuilder | null {
  if (projectId && dataset && source) {
    const imageBuilder = imageUrlBuilder({ projectId, dataset });
    return imageBuilder.image(source);
  }
  return null;
}

interface Props {
  params: {
    slug: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function PostPage({ params }: Props) {
  const slug = params?.slug || "";
  const post = await getPostBySlug(slug);

  if (post) {
    logObject("Full post data", post);

    if (post.body && Array.isArray(post.body)) {
      logObject("Post body", post.body);
    }
  }

  if (!post) {
    return <PostNotFound />;
  }

  let postImageUrl: string | null = null;
  const possibleImageFields = [
    "mainImage",
    "image",
    "coverImage",
    "thumbnail",
    "featuredImage",
  ];

  // Find the first available image field with proper typing
  const imageField = possibleImageFields.reduce<
    SanityImageField | string | null
  >((found, fieldName) => {
    if (found) return found;
    const fieldValue = post[fieldName];
    if (
      typeof fieldValue === "string" ||
      (fieldValue && typeof fieldValue === "object" && "_type" in fieldValue)
    ) {
      return fieldValue as SanityImageField | string;
    }
    return null;
  }, null);

  if (imageField) {
    try {
      if (typeof imageField === "object" && imageField._type === "image") {
        const imageBuilder = urlFor(imageField);
        postImageUrl = imageBuilder?.width(550).height(310).url() || null;
      } else if (
        typeof imageField === "string" &&
        imageField.startsWith("http")
      ) {
        postImageUrl = imageField;
      }
    } catch (error) {
      console.error("Error generating image URL:", error);
    }
  }

  return <PostContent post={{ ...post, imageUrl: postImageUrl }} />;
}
