import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/types/sanity";
import { getPostImageUrl } from "@/lib/sanity/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

interface PostListItemProps {
  post: Post;
}

export default function PostListItem({ post }: PostListItemProps) {
  const imageUrl = getPostImageUrl(post, { width: 800, height: 450 }); // Increased image size

  console.log("Post data:", {
    title: post.title,
    imageField: post.mainImage || post.image || post.coverImage,
    imageUrl,
  });

  const title = post.title || "Untitled Post";

  console.log("Author: " + post.author?.name);
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <Link
        href={`/${post.slug?.current || "#"}`}
        className="hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 rounded-sm"
      >
        <Card className="h-full flex flex-col group hover:shadow-lg transition-shadow duration-200">
          <CardContent className="flex-grow p-5 pb-4">
            <div className="relative w-full aspect-video mb-5 rounded-md overflow-hidden bg-gray-100">
              {" "}
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <span className="text-gray-500 text-sm">No image</span>
                </div>
              )}
            </div>
            <CardTitle className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
              {title}
            </CardTitle>
            {date && (
              <CardDescription className="text-base mb-2">
                {date}
              </CardDescription>
            )}
            <p className="text-base text-gray-600 line-clamp-3">
              {" "}
              By {post.author?.name}
            </p>
          </CardContent>
        </Card>
      </Link>
    </>
  );
}
