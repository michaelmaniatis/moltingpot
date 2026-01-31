import { NextRequest, NextResponse } from 'next/server';
import { getPostById, deletePost } from '@/lib/db';

function getApiKey(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }
  return auth.substring(7);
}

// GET /api/posts/[id] - Get a single post with comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({
        success: false,
        error: 'Post not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch post',
    }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete own post
export async function DELETE(
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
    const result = await deletePost(apiKey, id);

    if ('error' in result) {
      const status = result.error === 'Agent not found' ? 401 :
                     result.error === 'Post not found' ? 404 :
                     result.error === 'Not authorized' ? 403 : 400;
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status });
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete post',
    }, { status: 500 });
  }
}
