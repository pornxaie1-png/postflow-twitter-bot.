import { prisma } from "@/lib/prisma";
import { postTweet } from "./social/twitter";
import { postToInstagram } from "./social/instagram";
import { postToLinkedIn } from "./social/linkedin";

// Central publisher — called by the scheduler or manual "Publish Now"
export async function publishPost(postId: string) {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    include: { accounts: { include: { account: true } } },
  });

  if (post.status === "published") return;

  // Mark as in-progress
  await prisma.post.update({
    where: { id: postId },
    data: { status: "published", publishedAt: new Date() },
  });

  const results = await Promise.allSettled(
    post.accounts.map(async (pa) => {
      const platform = pa.account.platform;
      try {
        if (platform === "twitter") await postTweet(postId);
        else if (platform === "instagram") await postToInstagram(postId);
        else if (platform === "linkedin") await postToLinkedIn(postId);

        await prisma.postAccount.update({
          where: { id: pa.id },
          data: { status: "published" },
        });
      } catch (err: any) {
        const msg = err?.response?.data?.detail || err?.message || "Unknown error";
        await prisma.postAccount.update({
          where: { id: pa.id },
          data: { status: "failed", errorMsg: msg },
        });
        throw new Error(`${platform}: ${msg}`);
      }
    })
  );

  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    const msgs = (failures as PromiseRejectedResult[]).map((f) => f.reason?.message).join("; ");
    await prisma.post.update({
      where: { id: postId },
      data: { status: "failed", errorMsg: msgs },
    });
  }
}
