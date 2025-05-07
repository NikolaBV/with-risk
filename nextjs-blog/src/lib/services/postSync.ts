// src/lib/services/postSync.ts
import { prisma } from "../prisma";
import { client } from "../../app/sanity/client";

// Function to sync all posts from Sanity to the database
export async function syncAllPosts() {
  try {
    // Fetch all posts from Sanity
    const sanityPosts = await client.fetch(
      `*[_type == "post" && defined(slug.current)]{
        _id,
        title,
        slug,
        publishedAt
      }`
    );

    console.log(`Found ${sanityPosts.length} posts in Sanity`);

    const results = [];

    // Process each post
    for (const post of sanityPosts) {
      const result = await prisma.post.upsert({
        where: { sanityId: post._id },
        update: {
          title: post.title || "Untitled Post",
          slug: post.slug.current,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        },
        create: {
          sanityId: post._id,
          title: post.title || "Untitled Post",
          slug: post.slug.current,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        },
      });

      results.push(result);
    }

    return results;
  } catch (error) {
    console.error("Error syncing posts:", error);
    throw error;
  }
}

// Function to sync a single post
export async function syncPostFromSanity(sanityId: string) {
  try {
    // Fetch post from Sanity
    const post = await client.fetch(
      `*[_type == "post" && _id == $sanityId][0]{
        _id,
        title,
        slug,
        publishedAt
      }`,
      { sanityId }
    );

    if (!post) {
      console.error(`Post with ID ${sanityId} not found in Sanity`);
      return null;
    }

    // Upsert the post in the database
    return await prisma.post.upsert({
      where: { sanityId: post._id },
      update: {
        title: post.title || "Untitled Post",
        slug: post.slug.current,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
      },
      create: {
        sanityId: post._id,
        title: post.title || "Untitled Post",
        slug: post.slug.current,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
      },
    });
  } catch (error) {
    console.error("Error syncing post:", error);
    throw error;
  }
}
