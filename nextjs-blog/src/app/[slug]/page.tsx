import { getPostBySlug } from "../../lib/sanity/queries";
import { logObject } from "../../lib/utils/logging";
import PostNotFound from "../../components/blog/PostNotFound";
import PostContent from "./components/PostContent";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // You can implement metadata generation here if needed
  return {
    title: "Post",
  };
}

const PostPage: NextPage<Props> = async ({ params }) => {
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
};
