import { NextRequest, NextResponse } from 'next/server';
import { getVerificationRequest } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'code parameter is required' },
        { status: 400 }
      );
    }

    const verificationRequest = await getVerificationRequest(code);

    if (!verificationRequest) {
      return NextResponse.json(
        { error: 'Verification request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: verificationRequest.id,
      agentName: verificationRequest.agentName,
      twitterHandle: verificationRequest.twitterHandle,
      status: verificationRequest.status,
      isExpired: verificationRequest.isExpired,
      expiresAt: verificationRequest.expiresAt,
    });
  } catch (error) {
    console.error('Error getting verification status:', error);
    return NextResponse.json(
      { error: 'Failed to get verification status' },
      { status: 500 }
    );
  }
}
