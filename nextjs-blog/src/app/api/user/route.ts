import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Prisma, UserRole } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const roleParam = searchParams.get('role');

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      OR: [
        { username: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ],
      ...(roleParam && Object.values(UserRole).includes(roleParam as UserRole) 
        ? { role: roleParam as UserRole } 
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          comments: true,
          likes: true,
          views: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 