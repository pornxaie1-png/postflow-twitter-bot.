// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishPost } from "@/lib/publisher";

// GET /api/posts — list all posts
export async function GET() {
  const posts = await prisma.post.findMany({
    include: { accounts: { include: { account: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

// POST /api/posts — create and optionally schedule a post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, platforms, mediaPath, mediaType, scheduledAt } = body;

    if (!content || !platforms || platforms.length === 0) {
      return NextResponse.json({ error: "content and platforms are required" }, { status: 400 });
    }

    // Look up the connected accounts for the selected platforms
    const connectedAccounts = await prisma.connectedAccount.findMany({
      where: { platform: { in: platforms } },
    });

    if (connectedAccounts.length === 0) {
      return NextResponse.json(
        { error: "None of the selected platforms are connected. Go to Accounts to connect them." },
        { status: 400 }
      );
    }

    const isScheduled = !!scheduledAt;
    const post = await prisma.post.create({
      data: {
        content,
        mediaPath: mediaPath ?? null,
        mediaType: mediaType ?? null,
        scheduledAt: isScheduled ? new Date(scheduledAt) : null,
        status: isScheduled ? "scheduled" : "draft",
        accounts: {
          create: connectedAccounts.map((acc) => ({ accountId: acc.id })),
        },
      },
      include: { accounts: { include: { account: true } } },
    });

    // If no schedule date was set, publish immediately
    if (!isScheduled) {
      await publishPost(post.id);
    }

    return NextResponse.json(post, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/posts error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
