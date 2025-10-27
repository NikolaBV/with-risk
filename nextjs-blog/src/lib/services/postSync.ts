// src/lib/services/postSync.ts
import { prisma } from "@/lib/prisma";
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

    // Process each post without using upsert (avoids pooled prepared statement issues)
    for (const post of sanityPosts) {
      const result = await prisma.$transaction(async (tx) => {
        const existing = await tx.post.findUnique({ where: { sanityId: post._id } });
        if (existing) {
          return tx.post.update({
            where: { sanityId: post._id },
            data: {
              title: post.title || "Untitled Post",
              slug: post.slug.current,
              publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
            },
          });
        }
        return tx.post.create({
          data: {
            sanityId: post._id,
            title: post.title || "Untitled Post",
            slug: post.slug.current,
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
          },
        });
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
    // Normalize draft IDs and fetch either published or draft
    const draftId = sanityId.startsWith('drafts.') ? sanityId : `drafts.${sanityId}`;
    const publishedId = sanityId.replace(/^drafts\./, '');
    
    // Fetch more complete post data from Sanity
    const post = await client.fetch(
      `*[_type == "post" && (_id == $publishedId || _id == $draftId)][0]{
        _id,
        title,
        slug,
        publishedAt,
        mainImage {
          asset-> {
            _id,
            url,
            metadata {
              dimensions,
              lqip
            }
          },
          alt,
          caption
        },
        excerpt,
        body,
        author-> {
          name,
          image {
            asset-> {
              _id,
              url
            }
          }
        },
        categories[]-> {
          title,
          slug
        },
        tags,
        _createdAt,
        _updatedAt
      }`,
      { publishedId, draftId }
    );

    if (!post) {
      console.error(`Post with ID ${sanityId} not found in Sanity`);
      return null;
    }

    // Require slug to index in DB, otherwise skip until slug exists
    if (!post.slug?.current) {
      console.warn(`Post ${post._id} has no slug yet; skipping DB sync.`);
      return null;
    }

    console.log(`Syncing post: ${post.title} (${post._id})`);

    // Avoid upsert: use a transaction with find+update/create
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.post.findUnique({ where: { sanityId: post._id } });
      
      const postData = {
        title: post.title || "Untitled Post",
        slug: post.slug.current,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        // Store additional metadata as JSON for future use
        metadata: {
          excerpt: post.excerpt,
          mainImage: post.mainImage,
          author: post.author,
          categories: post.categories,
          tags: post.tags,
          body: post.body,
          sanityCreatedAt: post._createdAt,
          sanityUpdatedAt: post._updatedAt
        }
      };

      if (existing) {
        console.log(`Updating existing post: ${post._id}`);
        return tx.post.update({
          where: { sanityId: post._id },
          data: postData,
        });
      } else {
        console.log(`Creating new post: ${post._id}`);
        return tx.post.create({
          data: {
            sanityId: post._id,
            ...postData,
          },
        });
      }
    });
  } catch (error) {
    console.error("Error syncing post:", error);
    throw error;
  }
}

// Function to delete a post by Sanity ID in the database
export async function deletePostBySanityId(sanityId: string) {
  try {
    const deleted = await prisma.post.delete({ where: { sanityId } });
    return deleted;
  } catch (error) {
    // If not found, ignore
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return null;
    }
    console.error("Error deleting post:", error);
    throw error;
  }
}
