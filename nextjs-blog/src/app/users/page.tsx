'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import { Card } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  bio: string | null;
  profileImage: string | null;
  role: 'USER' | 'ADMIN';
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

export default function UsersPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (params: {
    page?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: params.page?.toString() || '1',
        limit: pagination.limit.toString(),
        ...(params.search && { search: params.search }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      });

      const response = await fetch(`/api/user?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchUsers({ page: 1 });
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
  }) => {
    fetchUsers({ ...params, page: 1 });
  };

  const handlePageChange = (page: number) => {
    fetchUsers({ page });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Users</h1>
      
      <SearchBar onSearch={handleSearch} type="users" />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 mt-8">
            {users.map((user) => (
              <Card key={user.id} className="p-6">
                <div className="flex items-center gap-4">
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.username}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl text-gray-500">
                        {user.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{user.username}</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.name && <p className="text-sm text-gray-600">{user.name}</p>}
                    {user.bio && <p className="text-sm text-gray-600 mt-2">{user.bio}</p>}
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600 mt-4">
                  <span>{user.comments.length} comments</span>
                  <span>{user.likes.length} likes</span>
                  <span>{user.views.length} views</span>
                  <span className="capitalize">{user.role.toLowerCase()}</span>
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