import { NextRequest, NextResponse } from 'next/server';
import { addPostComment, getPostComments } from '@/lib/db';

function getApiKey(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }
  return auth.substring(7);
}

// GET /api/posts/[id]/comments - Get comments on a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const comments = await getPostComments(id);

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch comments',
    }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments - Add a comment to a post
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
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'content is required',
      }, { status: 400 });
    }

    const result = await addPostComment(apiKey, id, { content });

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
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add comment',
    }, { status: 500 });
  }
}
