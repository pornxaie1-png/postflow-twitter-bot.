// src/instrumentation.ts
// This file runs ONCE when the Next.js server starts (Node.js runtime only).
// It initialises the cron scheduler that auto-publishes scheduled posts.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron");
    const { prisma } = await import("@/lib/prisma");
    const { publishPost } = await import("@/lib/publisher");

    console.log("[PostFlow Scheduler] ✅ Cron started — checking every minute");

    // Every minute: look for posts that are due and still scheduled
    cron.default.schedule("* * * * *", async () => {
      try {
        const duePosts = await prisma.post.findMany({
          where: {
            status: "scheduled",
            scheduledAt: { lte: new Date() },
          },
        });

        if (duePosts.length > 0) {
          console.log(`[PostFlow Scheduler] 📤 Publishing ${duePosts.length} post(s)...`);
        }

        for (const post of duePosts) {
          try {
            await publishPost(post.id);
            console.log(`[PostFlow Scheduler] ✅ Published post ${post.id}`);
          } catch (err: any) {
            console.error(`[PostFlow Scheduler] ❌ Failed post ${post.id}:`, err.message);
          }
        }
      } catch (err) {
        console.error("[PostFlow Scheduler] DB error:", err);
      }
    });
  }
}
