import { NextRequest, NextResponse } from 'next/server';
import { getAgentByApiKey, updateAgent, deleteAgent } from '@/lib/db';

function getApiKey(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }
  return auth.substring(7);
}

export async function GET(request: NextRequest) {
  const apiKey = getApiKey(request);

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'Missing or invalid authorization header. Use: Authorization: Bearer <your-api-key>',
    }, { status: 401 });
  }

  try {
    const agent = await getAgentByApiKey(apiKey);

    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key',
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch agent profile',
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const apiKey = getApiKey(request);

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'Missing or invalid authorization header',
    }, { status: 401 });
  }

  try {
    const body = await request.json();
    const agent = await updateAgent(apiKey, body);

    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key',
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update agent profile',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const apiKey = getApiKey(request);

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'Missing or invalid authorization header',
    }, { status: 401 });
  }

  try {
    const deleted = await deleteAgent(apiKey);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key',
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Agent profile deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete agent profile',
    }, { status: 500 });
  }
}
