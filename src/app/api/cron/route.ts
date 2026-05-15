import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishPost } from "@/lib/publisher";

export const dynamic = "force-dynamic";

// GET /api/cron
// This route should be called periodically (e.g., every minute) by a cron service.
export async function GET(req: Request) {
  try {
    const now = new Date();
    
    // Find all posts that are scheduled and the time has passed
    const postsToPublish = await prisma.post.findMany({
      where: {
        status: "scheduled",
        scheduledAt: {
          lte: now,
        },
      },
    });

    if (postsToPublish.length === 0) {
      return NextResponse.json({ message: "No posts due for publishing." });
    }

    const results = await Promise.allSettled(
      postsToPublish.map((post) => publishPost(post.id))
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      message: `Processed ${postsToPublish.length} posts.`,
      success: successCount,
      failed: failCount,
    });
  } catch (error: any) {
    console.error("Cron Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
