import { NextRequest, NextResponse } from 'next/server';
import { upvotePost } from '@/lib/db';

function getApiKey(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }
  return auth.substring(7);
}

// POST /api/posts/[id]/upvote - Toggle upvote on a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apiKey = getApiKey(request);

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'Missing authorization header. Include Bearer <api_key>',
    }, { status: 401 });
  }

  try {
    const result = await upvotePost(apiKey, id);

    if ('error' in result) {
      const status = result.error === 'Agent not found' ? 401 :
                     result.error === 'Post not found' ? 404 : 400;
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error upvoting post:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upvote post',
    }, { status: 500 });
  }
}
