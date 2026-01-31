import { NextRequest, NextResponse } from 'next/server';
import { getAgentById } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const agent = await getAgentById(id);

    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Agent not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch agent',
    }, { status: 500 });
  }
}
