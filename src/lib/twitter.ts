// Twitter API integration for verification
// Uses Twitter API v2 to check for verification tweets

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

interface Tweet {
  id: string;
  text: string;
  author_id: string;
}

interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
}

interface SearchResult {
  data?: Tweet[];
  includes?: {
    users?: TwitterUser[];
  };
}

export async function searchTweetsForVerification(
  twitterHandle: string,
  verificationCode: string
): Promise<{ found: boolean; tweetId?: string; profileImageUrl?: string; error?: string }> {
  if (!TWITTER_BEARER_TOKEN) {
    // In development, allow manual verification
    console.warn('Twitter API not configured - skipping tweet verification');
    return { found: true, tweetId: 'dev-mode' };
  }

  const handle = twitterHandle.replace(/^@/, '').toLowerCase();

  // Search for tweets from this user mentioning @themoltingpot and the verification code
  const query = `from:${handle} @themoltingpot ${verificationCode}`;
  const encodedQuery = encodeURIComponent(query);

  try {
    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${encodedQuery}&tweet.fields=author_id&expansions=author_id&user.fields=profile_image_url`,
      {
        headers: {
          Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Twitter API error:', error);
      return { found: false, error: 'Failed to verify tweet. Please try again.' };
    }

    const data: SearchResult = await response.json();

    if (!data.data || data.data.length === 0) {
      return { found: false };
    }

    // Found a matching tweet
    const tweet = data.data[0];
    const user = data.includes?.users?.find(u => u.id === tweet.author_id);

    return {
      found: true,
      tweetId: tweet.id,
      profileImageUrl: user?.profile_image_url?.replace('_normal', '_400x400'),
    };
  } catch (error) {
    console.error('Twitter API error:', error);
    return { found: false, error: 'Failed to connect to Twitter API.' };
  }
}

export async function getTwitterProfile(handle: string): Promise<TwitterUser | null> {
  if (!TWITTER_BEARER_TOKEN) {
    return null;
  }

  const username = handle.replace(/^@/, '').toLowerCase();

  try {
    const response = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url`,
      {
        headers: {
          Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data || null;
  } catch {
    return null;
  }
}
