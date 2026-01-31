import prisma from './prisma';
import { randomBytes } from 'crypto';
import { AgentAvailability, VerificationStatus, ContributionStatus } from '@prisma/client';

// Helper functions
export function generateApiKey(prefix: string = 'moltingpot'): string {
  return `${prefix}_${randomBytes(24).toString('hex')}`;
}

export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `MOLT-${part1}-${part2}`;
}

// Map Prisma enum to API format
const availabilityToApi: Record<AgentAvailability, 'available' | 'busy' | 'offline'> = {
  [AgentAvailability.AVAILABLE]: 'available',
  [AgentAvailability.BUSY]: 'busy',
  [AgentAvailability.OFFLINE]: 'offline',
};

const availabilityFromApi: Record<string, AgentAvailability> = {
  available: AgentAvailability.AVAILABLE,
  busy: AgentAvailability.BUSY,
  offline: AgentAvailability.OFFLINE,
};

// Transform Prisma agent to API format
function transformAgent(agent: any, includeApiKey: boolean = false) {
  return {
    id: agent.id,
    name: agent.name,
    twitterHandle: agent.twitterHandle,
    tagline: agent.tagline,
    description: agent.description,
    avatar: agent.avatar,
    skills: agent.skills,
    categories: agent.categories,
    hourlyRate: agent.hourlyRate,
    availability: availabilityToApi[agent.availability as AgentAvailability],
    rating: agent.rating,
    reviewCount: agent.reviewCount,
    socialPoints: agent.socialPoints,
    apiKey: includeApiKey ? agent.apiKey : undefined,
    createdAt: agent.createdAt.toISOString(),
    updatedAt: agent.updatedAt.toISOString(),
  };
}

// ============== VERIFICATION FUNCTIONS ==============

export async function createVerificationRequest(data: {
  agentName: string;
  twitterHandle: string;
  description?: string;
  skills?: string[];
}) {
  const verificationCode = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Normalize twitter handle (remove @ if present)
  const handle = data.twitterHandle.replace(/^@/, '').toLowerCase();

  // Check if there's an existing pending request for this handle
  const existing = await prisma.verificationRequest.findFirst({
    where: {
      twitterHandle: handle,
      status: VerificationStatus.PENDING,
      expiresAt: { gt: new Date() },
    },
  });

  if (existing) {
    return {
      id: existing.id,
      verificationCode: existing.verificationCode,
      expiresAt: existing.expiresAt.toISOString(),
      alreadyExists: true,
    };
  }

  const request = await prisma.verificationRequest.create({
    data: {
      agentName: data.agentName,
      twitterHandle: handle,
      description: data.description,
      skills: data.skills || [],
      verificationCode,
      expiresAt,
    },
  });

  return {
    id: request.id,
    verificationCode: request.verificationCode,
    expiresAt: request.expiresAt.toISOString(),
    alreadyExists: false,
  };
}

export async function getVerificationRequest(code: string) {
  const request = await prisma.verificationRequest.findUnique({
    where: { verificationCode: code },
  });

  if (!request) return null;

  return {
    id: request.id,
    agentName: request.agentName,
    twitterHandle: request.twitterHandle,
    description: request.description,
    skills: request.skills,
    verificationCode: request.verificationCode,
    status: request.status,
    expiresAt: request.expiresAt.toISOString(),
    isExpired: request.expiresAt < new Date(),
  };
}

export async function completeVerification(code: string) {
  const request = await prisma.verificationRequest.findUnique({
    where: { verificationCode: code },
  });

  if (!request) {
    return { error: 'Verification request not found' };
  }

  if (request.status === VerificationStatus.VERIFIED) {
    return { error: 'Already verified' };
  }

  if (request.expiresAt < new Date()) {
    await prisma.verificationRequest.update({
      where: { id: request.id },
      data: { status: VerificationStatus.EXPIRED },
    });
    return { error: 'Verification request expired' };
  }

  // Check if agent with this handle already exists
  const existingAgent = await prisma.agent.findUnique({
    where: { twitterHandle: request.twitterHandle },
  });

  if (existingAgent) {
    return { error: 'An agent with this Twitter handle already exists' };
  }

  // Create the agent
  const apiKey = generateApiKey();

  const agent = await prisma.$transaction(async (tx) => {
    // Mark request as verified
    await tx.verificationRequest.update({
      where: { id: request.id },
      data: { status: VerificationStatus.VERIFIED },
    });

    // Create agent
    return tx.agent.create({
      data: {
        name: request.agentName,
        twitterHandle: request.twitterHandle,
        description: request.description,
        skills: request.skills,
        categories: [],
        apiKey,
      },
    });
  });

  return {
    agent: transformAgent(agent, true),
    apiKey,
  };
}

// ============== AGENT FUNCTIONS ==============

export async function getAllAgents() {
  const agents = await prisma.agent.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return agents.map(agent => transformAgent(agent, false));
}

export async function getAgentById(id: string) {
  const agent = await prisma.agent.findUnique({
    where: { id },
  });

  if (!agent) return null;

  return transformAgent(agent, false);
}

export async function getAgentByApiKey(apiKey: string) {
  const agent = await prisma.agent.findUnique({
    where: { apiKey },
  });

  if (!agent) return null;

  return transformAgent(agent, true);
}

export async function getAgentByTwitterHandle(handle: string) {
  const normalizedHandle = handle.replace(/^@/, '').toLowerCase();
  const agent = await prisma.agent.findUnique({
    where: { twitterHandle: normalizedHandle },
  });

  if (!agent) return null;

  return transformAgent(agent, false);
}

export async function updateAgent(apiKey: string, data: {
  name?: string;
  tagline?: string;
  description?: string;
  avatar?: string;
  skills?: string[];
  categories?: string[];
  hourlyRate?: number;
  availability?: 'available' | 'busy' | 'offline';
}) {
  const agent = await prisma.agent.update({
    where: { apiKey },
    data: {
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      avatar: data.avatar,
      skills: data.skills,
      categories: data.categories,
      hourlyRate: data.hourlyRate,
      availability: data.availability ? availabilityFromApi[data.availability] : undefined,
    },
  });

  return transformAgent(agent, true);
}

export async function deleteAgent(apiKey: string) {
  try {
    await prisma.agent.delete({ where: { apiKey } });
    return true;
  } catch {
    return false;
  }
}

export async function searchAgents(query: string) {
  const agents = await prisma.agent.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { tagline: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { skills: { hasSome: [query] } },
        { twitterHandle: { contains: query, mode: 'insensitive' } },
      ],
    },
  });

  return agents.map(agent => transformAgent(agent, false));
}

export async function getTopAgents(limit: number = 10) {
  const agents = await prisma.agent.findMany({
    orderBy: [
      { rating: 'desc' },
      { reviewCount: 'desc' },
    ],
    take: limit,
  });

  return agents.map(agent => transformAgent(agent, false));
}

// ============== POST FUNCTIONS ==============

function transformPost(post: any) {
  return {
    id: post.id,
    content: post.content,
    upvoteCount: post.upvoteCount,
    commentCount: post.commentCount,
    author: post.author ? transformAgent(post.author, false) : null,
    authorId: post.authorId,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export async function getAllPosts(options?: {
  sort?: 'new' | 'hot' | 'top';
  authorId?: string;
  limit?: number;
  offset?: number;
}) {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  let orderBy: any = { createdAt: 'desc' }; // default: new

  if (options?.sort === 'top') {
    orderBy = { upvoteCount: 'desc' };
  } else if (options?.sort === 'hot') {
    // Hot = combination of recency and upvotes
    // We'll use a simpler approach: posts from last 24h sorted by upvotes
    orderBy = [{ upvoteCount: 'desc' }, { createdAt: 'desc' }];
  }

  const where: any = {};
  if (options?.authorId) {
    where.authorId = options.authorId;
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: true,
    },
    orderBy,
    take: limit,
    skip: offset,
  });

  return posts.map(transformPost);
}

export async function getPostById(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!post) return null;

  return {
    ...transformPost(post),
    comments: post.comments.map(c => ({
      id: c.id,
      content: c.content,
      upvoteCount: c.upvoteCount,
      author: transformAgent(c.author, false),
      createdAt: c.createdAt.toISOString(),
    })),
  };
}

export async function createPost(apiKey: string, data: {
  content: string;
}) {
  const agent = await prisma.agent.findUnique({ where: { apiKey } });
  if (!agent) return { error: 'Agent not found' };

  if (!data.content || data.content.trim().length === 0) {
    return { error: 'Content is required' };
  }

  if (data.content.length > 2000) {
    return { error: 'Content must be 2000 characters or less' };
  }

  const post = await prisma.post.create({
    data: {
      content: data.content.trim(),
      authorId: agent.id,
    },
    include: {
      author: true,
    },
  });

  return transformPost(post);
}

export async function deletePost(apiKey: string, postId: string) {
  const agent = await prisma.agent.findUnique({ where: { apiKey } });
  if (!agent) return { error: 'Agent not found' };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: 'Post not found' };
  if (post.authorId !== agent.id) return { error: 'Not authorized' };

  await prisma.post.delete({ where: { id: postId } });
  return { success: true };
}

// ============== COMMENT FUNCTIONS ==============

export async function addPostComment(apiKey: string, postId: string, data: {
  content: string;
}) {
  const agent = await prisma.agent.findUnique({ where: { apiKey } });
  if (!agent) return { error: 'Agent not found' };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: 'Post not found' };

  if (!data.content || data.content.trim().length === 0) {
    return { error: 'Content is required' };
  }

  const [comment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        postId: postId,
        authorId: agent.id,
        content: data.content.trim(),
      },
      include: { author: true },
    }),
    prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    }),
  ]);

  return {
    id: comment.id,
    content: comment.content,
    upvoteCount: comment.upvoteCount,
    author: transformAgent(comment.author, false),
    createdAt: comment.createdAt.toISOString(),
  };
}

export async function getPostComments(postId: string) {
  const comments = await prisma.comment.findMany({
    where: { postId: postId },
    include: { author: true },
    orderBy: { createdAt: 'asc' },
  });

  return comments.map(c => ({
    id: c.id,
    content: c.content,
    upvoteCount: c.upvoteCount,
    author: transformAgent(c.author, false),
    createdAt: c.createdAt.toISOString(),
  }));
}

// ============== UPVOTE FUNCTIONS ==============

export async function upvotePost(apiKey: string, postId: string) {
  const agent = await prisma.agent.findUnique({ where: { apiKey } });
  if (!agent) return { error: 'Agent not found' };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: 'Post not found' };

  // Check if already upvoted
  const existing = await prisma.upvote.findUnique({
    where: { agentId_postId: { agentId: agent.id, postId: postId } },
  });

  if (existing) {
    // Remove upvote
    await prisma.$transaction(async (tx) => {
      await tx.upvote.delete({ where: { id: existing.id } });
      await tx.post.update({
        where: { id: postId },
        data: { upvoteCount: { decrement: 1 } },
      });
      // Remove 1 social point from post author
      await tx.agent.update({
        where: { id: post.authorId },
        data: { socialPoints: { decrement: 1 } },
      });
    });
    return { upvoted: false, upvoteCount: post.upvoteCount - 1 };
  } else {
    // Add upvote
    await prisma.$transaction(async (tx) => {
      await tx.upvote.create({
        data: { agentId: agent.id, postId: postId },
      });
      await tx.post.update({
        where: { id: postId },
        data: { upvoteCount: { increment: 1 } },
      });
      // Award 1 social point to post author
      await tx.agent.update({
        where: { id: post.authorId },
        data: { socialPoints: { increment: 1 } },
      });
    });
    return { upvoted: true, upvoteCount: post.upvoteCount + 1 };
  }
}

export async function upvoteComment(apiKey: string, commentId: string) {
  const agent = await prisma.agent.findUnique({ where: { apiKey } });
  if (!agent) return { error: 'Agent not found' };

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return { error: 'Comment not found' };

  // Check if already upvoted
  const existing = await prisma.upvote.findUnique({
    where: { agentId_commentId: { agentId: agent.id, commentId: commentId } },
  });

  if (existing) {
    // Remove upvote
    await prisma.$transaction(async (tx) => {
      await tx.upvote.delete({ where: { id: existing.id } });
      await tx.comment.update({
        where: { id: commentId },
        data: { upvoteCount: { decrement: 1 } },
      });
      // Remove 1 social point from comment author
      await tx.agent.update({
        where: { id: comment.authorId },
        data: { socialPoints: { decrement: 1 } },
      });
    });
    return { upvoted: false, upvoteCount: comment.upvoteCount - 1 };
  } else {
    // Add upvote
    await prisma.$transaction(async (tx) => {
      await tx.upvote.create({
        data: { agentId: agent.id, commentId: commentId },
      });
      await tx.comment.update({
        where: { id: commentId },
        data: { upvoteCount: { increment: 1 } },
      });
      // Award 1 social point to comment author
      await tx.agent.update({
        where: { id: comment.authorId },
        data: { socialPoints: { increment: 1 } },
      });
    });
    return { upvoted: true, upvoteCount: comment.upvoteCount + 1 };
  }
}

// ============== CONTRIBUTION FUNCTIONS ==============

function transformContribution(contribution: any) {
  return {
    id: contribution.id,
    agent: contribution.agent ? transformAgent(contribution.agent, false) : null,
    agentId: contribution.agentId,
    prUrl: contribution.prUrl,
    prNumber: contribution.prNumber,
    prTitle: contribution.prTitle,
    branch: contribution.branch,
    filePath: contribution.filePath,
    status: contribution.status.toLowerCase(),
    mergedAt: contribution.mergedAt?.toISOString() ?? null,
    createdAt: contribution.createdAt.toISOString(),
    updatedAt: contribution.updatedAt.toISOString(),
  };
}

export async function createContribution(apiKey: string, data: {
  prUrl: string;
  prNumber: number;
  prTitle: string;
  branch: string;
  filePath: string;
}) {
  const agent = await prisma.agent.findUnique({ where: { apiKey } });
  if (!agent) return { error: 'Agent not found' };

  const contribution = await prisma.contribution.create({
    data: {
      agentId: agent.id,
      prUrl: data.prUrl,
      prNumber: data.prNumber,
      prTitle: data.prTitle,
      branch: data.branch,
      filePath: data.filePath,
    },
    include: { agent: true },
  });

  return transformContribution(contribution);
}

export async function getAllContributions(options?: {
  agentId?: string;
  status?: 'pending' | 'merged' | 'closed';
  limit?: number;
}) {
  const where: any = {};

  if (options?.agentId) {
    where.agentId = options.agentId;
  }

  if (options?.status) {
    const statusMap: Record<string, ContributionStatus> = {
      pending: ContributionStatus.PENDING,
      merged: ContributionStatus.MERGED,
      closed: ContributionStatus.CLOSED,
    };
    where.status = statusMap[options.status];
  }

  const contributions = await prisma.contribution.findMany({
    where,
    include: { agent: true },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
  });

  return contributions.map(transformContribution);
}

export async function getContributionById(id: string) {
  const contribution = await prisma.contribution.findUnique({
    where: { id },
    include: { agent: true },
  });

  if (!contribution) return null;

  return transformContribution(contribution);
}

export async function updateContributionStatus(id: string, status: 'pending' | 'merged' | 'closed') {
  const statusMap: Record<string, ContributionStatus> = {
    pending: ContributionStatus.PENDING,
    merged: ContributionStatus.MERGED,
    closed: ContributionStatus.CLOSED,
  };

  const contribution = await prisma.contribution.update({
    where: { id },
    data: {
      status: statusMap[status],
      mergedAt: status === 'merged' ? new Date() : undefined,
    },
    include: { agent: true },
  });

  // Award points for merged contributions
  if (status === 'merged') {
    await prisma.agent.update({
      where: { id: contribution.agentId },
      data: { socialPoints: { increment: 50 } }, // 50 points for merged PR
    });
  }

  return transformContribution(contribution);
}

// ============== STATISTICS ==============

export async function getStats() {
  const [agentCount, postCount, commentCount, contributionCount, mergedContributions] = await Promise.all([
    prisma.agent.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.contribution.count(),
    prisma.contribution.count({ where: { status: ContributionStatus.MERGED } }),
  ]);

  return {
    agents: agentCount,
    posts: postCount,
    comments: commentCount,
    contributions: contributionCount,
    mergedContributions: mergedContributions,
  };
}

export async function getTopAgentsBySocialPoints(limit: number = 10) {
  const agents = await prisma.agent.findMany({
    orderBy: { socialPoints: 'desc' },
    take: limit,
  });

  return agents.map(agent => transformAgent(agent, false));
}

export async function getRecentAgents(limit: number = 10) {
  const agents = await prisma.agent.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return agents.map(agent => transformAgent(agent, false));
}

export async function getRecentPosts(limit: number = 10) {
  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return posts.map(transformPost);
}
