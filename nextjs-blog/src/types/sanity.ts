import type { SanityDocument } from "next-sanity";

export interface SanityImageValue {
  _type?: string;
  asset?: {
    _ref: string;
    [key: string]: any;
  };
  alt?: string;
  caption?: string;
  [key: string]: any;
}

export interface Post extends SanityDocument {
  title?: string;
  publishedAt?: string;
  body?: any[];
  mainImage?: SanityImageValue;
  image?: SanityImageValue;
  coverImage?: SanityImageValue;
  thumbnail?: SanityImageValue;
  featuredImage?: SanityImageValue;
  slug?: {
    current: string;
  };
  [key: string]: any;
}

export interface PostListItem extends SanityDocument {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt?: string;
}
