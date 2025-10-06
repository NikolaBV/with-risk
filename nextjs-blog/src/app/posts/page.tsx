'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import { Card } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Post {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  createdAt: string;
  comments: unknown[];
  likes: unknown[];
  views: unknown[];
}

interface PaginationData {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

export default function PostsPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (params: {
    page?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: params.page?.toString() || '1',
        limit: pagination.limit.toString(),
        ...(params.search && { search: params.search }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
        ...(params.dateFrom && { dateFrom: params.dateFrom }),
        ...(params.dateTo && { dateTo: params.dateTo }),
      });

      const response = await fetch(`/api/posts?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchPosts({ page: 1 });
      } else {
        router.push('/auth/signin');
      }
    };

    checkSession();
  }, []);

  const handleSearch = (params: {
    search: string;
    sortBy: string;
    sortOrder: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    fetchPosts({ ...params, page: 1 });
  };

  const handlePageChange = (page: number) => {
    fetchPosts({ page });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Posts</h1>
      
      <SearchBar onSearch={handleSearch} type="posts" />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 mt-8">
            {posts.map((post) => (
              <Card key={post.id} className="p-6">
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <div className="text-sm text-gray-500 mb-4">
                  Published: {new Date(post.publishedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>{post.comments.length} comments</span>
                  <span>{post.likes.length} likes</span>
                  <span>{post.views.length} views</span>
                </div>
              </Card>
            ))}
          </div>

          {pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
} 