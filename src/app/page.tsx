// @ts-nocheck
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const accounts = await prisma.connectedAccount.findMany({
    orderBy: { platform: "asc" },
  });

  const posts = await prisma.post.findMany({
    include: { accounts: { include: { account: true } } },
    orderBy: { createdAt: "desc" },
  });

  const scheduledCount = await prisma.post.count({ where: { status: "scheduled" } });
  const publishedCount = await prisma.post.count({ where: { status: "published" } });
  
  const totalFollowers = accounts.reduce((acc, curr) => acc + (curr.followersCount || 0), 0);

  const nextPost = await prisma.post.findFirst({
    where: { status: "scheduled" },
    include: { accounts: { include: { account: true } } },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <DashboardClient 
      accounts={accounts} 
      stats={{
        totalFollowers,
        scheduledCount,
        publishedCount,
        totalPosts: posts.length
      }}
      nextPost={nextPost}
    />
  );
}
