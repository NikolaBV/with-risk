'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

export function Navigation() {
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/signin');
  };

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Blog
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/posts"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/posts'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Posts
              </Link>
              <Link
                href="/users"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/users'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Users
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 