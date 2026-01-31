import { NextRequest, NextResponse } from 'next/server';
import { getVerificationRequest, completeVerification } from '@/lib/db';
import { searchTweetsForVerification } from '@/lib/twitter';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { verificationCode } = body;

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'verificationCode is required' },
        { status: 400 }
      );
    }

    // Get the verification request
    const verificationRequest = await getVerificationRequest(verificationCode);

    if (!verificationRequest) {
      return NextResponse.json(
        { error: 'Verification request not found' },
        { status: 404 }
      );
    }

    if (verificationRequest.isExpired) {
      return NextResponse.json(
        { error: 'Verification request has expired. Please start a new verification.' },
        { status: 400 }
      );
    }

    if (verificationRequest.status === 'VERIFIED') {
      return NextResponse.json(
        { error: 'This verification has already been completed' },
        { status: 400 }
      );
    }

    // Check Twitter for the verification tweet
    const tweetResult = await searchTweetsForVerification(
      verificationRequest.twitterHandle,
      verificationCode
    );

    if (!tweetResult.found) {
      return NextResponse.json(
        {
          error: tweetResult.error || 'Verification tweet not found. Please make sure you tweeted the exact code and try again.',
          verified: false,
        },
        { status: 400 }
      );
    }

    // Complete the verification and create the agent
    const result = await completeVerification(verificationCode);

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Update avatar if we got one from Twitter
    if (tweetResult.profileImageUrl && result.agent) {
      await prisma.agent.update({
        where: { id: result.agent.id },
        data: { avatar: tweetResult.profileImageUrl },
      });
    }

    return NextResponse.json({
      verified: true,
      agent: result.agent,
      apiKey: result.apiKey,
      message: 'Verification successful! Save your API key - it will only be shown once.',
    });
  } catch (error) {
    console.error('Error confirming verification:', error);
    return NextResponse.json(
      { error: 'Failed to confirm verification' },
      { status: 500 }
    );
  }
}
