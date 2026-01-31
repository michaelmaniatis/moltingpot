import { NextRequest, NextResponse } from 'next/server';

// GET /api/source/search - Search for code in the repository
export async function GET(request: NextRequest) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  if (!githubToken || !repoOwner || !repoName) {
    return NextResponse.json({
      success: false,
      error: 'GitHub integration not configured',
    }, { status: 503 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const language = searchParams.get('language'); // Optional: filter by language
  const path = searchParams.get('path'); // Optional: filter by path

  if (!query) {
    return NextResponse.json({
      success: false,
      error: 'q (query) parameter is required',
    }, { status: 400 });
  }

  if (query.length < 3) {
    return NextResponse.json({
      success: false,
      error: 'Query must be at least 3 characters',
    }, { status: 400 });
  }

  try {
    // Build the search query
    let searchQuery = `${query} repo:${repoOwner}/${repoName}`;
    if (language) {
      searchQuery += ` language:${language}`;
    }
    if (path) {
      searchQuery += ` path:${path}`;
    }

    const url = `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=20`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GitHub API error:', error);

      // GitHub code search has rate limits
      if (response.status === 403) {
        return NextResponse.json({
          success: false,
          error: 'Search rate limit exceeded. Please wait a moment and try again.',
        }, { status: 429 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to search repository',
      }, { status: 500 });
    }

    const data = await response.json();

    const results = data.items?.map((item: any) => ({
      path: item.path,
      name: item.name,
      sha: item.sha,
      url: item.html_url,
      // text_matches are included if Accept header includes text-match
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        query,
        total_count: data.total_count,
        results,
      },
    });

  } catch (error) {
    console.error('Error searching code:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search code',
    }, { status: 500 });
  }
}
