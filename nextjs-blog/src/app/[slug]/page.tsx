import { getPostBySlug } from "../../lib/sanity/queries";
import { logObject } from "../../lib/utils/logging";
import PostNotFound from "../../components/blog/PostNotFound";
import PostContent from "./components/PostContent";

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

  return <PostContent post={post} />;
}
