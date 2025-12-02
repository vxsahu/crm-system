import { NextResponse } from 'next/server';
import { getCurrentUser, sanitizeUser, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse('Not authenticated');
    }

    return NextResponse.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
