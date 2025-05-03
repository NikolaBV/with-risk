import { getPostBySlug } from "../../lib/sanity/queries";
import { logObject } from "../../lib/utils/logging";
import PostNotFound from "../../components/blog/PostNotFound";
import PostContent from "./components/PostContent";

interface PostPageParams {
  params: {
    slug: string;
  };
}

export default async function PostPage({ params }: PostPageParams) {
  const slug = params?.slug || "";
  const post = await getPostBySlug(slug);

  // Logging for debugging purposes
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
