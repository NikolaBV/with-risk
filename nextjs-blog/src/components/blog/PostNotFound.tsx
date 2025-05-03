import Link from "next/link";

export default function PostNotFound() {
  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <p className="text-xl">Post not found.</p>
      <Link href="/" className="hover:underline">
        ← Back to posts
      </Link>
    </main>
  );
}
