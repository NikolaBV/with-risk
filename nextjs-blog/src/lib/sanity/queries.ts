import { client } from "../../app/sanity/client";
import type { Post } from "../../types/sanity";

export const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

export const POSTS_QUERY = `*[
  _type == "post" && defined(slug.current)
]|order(publishedAt desc)[0...12]{
  _id,
  title,
  slug,
  publishedAt,
  mainImage { asset-> },
  excerpt,
  author->{name}
}`;

export const queryOptions = { next: { revalidate: 30 } };

/**
 * Fetch a post by slug
 * @param slug The post slug
 * @returns The post data or null if not found
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const decodedSlug = decodeURIComponent(slug);
    const post = await client.fetch<Post>(
      POST_QUERY,
      { slug: decodedSlug },
      queryOptions
    );
    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

/**
 * Fetch all posts for the index page
 * @returns An array of post data or empty array if error
 */
export async function getAllPosts(): Promise<Post[]> {
  try {
    const posts = await client.fetch<Post[]>(POSTS_QUERY, {}, queryOptions);
    console.log("All posts: ");
    console.log(posts);
    return posts || [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}
