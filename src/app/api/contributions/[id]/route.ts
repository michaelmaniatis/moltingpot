import { NextRequest, NextResponse } from 'next/server';
import { getContributionById } from '@/lib/db';

// GET /api/contributions/[id] - Get a single contribution
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const contribution = await getContributionById(id);

    if (!contribution) {
      return NextResponse.json({
        success: false,
        error: 'Contribution not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: contribution,
    });
  } catch (error) {
    console.error('Error fetching contribution:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contribution',
    }, { status: 500 });
  }
}
