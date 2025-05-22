import type { SanityDocument } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/types";

export interface SanityImageAssetReference {
  _ref: string;
  _type: string;
  [key: string]: unknown; // For any additional properties
}

export interface SanityImageValue {
  _type?: "image";
  asset?: SanityImageAssetReference;
  alt?: string;
  caption?: string;
  [key: string]: unknown; // For any additional properties
}

export interface Slug {
  current: string;
  _type: "slug";
}

export interface Author {
  name: string;
  image?: string;
  [key: string]: unknown; // For any additional properties
}

export interface Post extends SanityDocument {
  id?: string; // Database ID
  title?: string;
  publishedAt?: string;
  body?: PortableTextBlock[];
  mainImage?: SanityImageValue;
  image?: SanityImageValue;
  coverImage?: SanityImageValue;
  thumbnail?: SanityImageValue;
  featuredImage?: SanityImageValue;
  slug?: Slug;
  author?: Author;
}

export interface PostListItem extends SanityDocument {
  _id: string;
  title: string;
  slug: Slug;
  publishedAt?: string;
}
