import OAuth from "oauth-1.0a";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

// ─── OAuth 1.0a Setup ────────────────────────────────────────────────
const oauth = new OAuth({
  consumer: {
    key: process.env.TWITTER_CONSUMER_KEY!,
    secret: process.env.TWITTER_CONSUMER_SECRET!,
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string: string, key: string) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

const token = {
  key: process.env.TWITTER_ACCESS_TOKEN!,
  secret: process.env.TWITTER_ACCESS_SECRET!,
};

// ─── Upload Media to Twitter (multipart/form-data) ───────────────────
async function uploadMedia(filePath: string): Promise<string> {
  const absolutePath = path.join(process.cwd(), "public", filePath);
  console.log("📸 Reading file from:", absolutePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".gif": "image/gif", ".webp": "image/webp", ".mp4": "video/mp4",
  };
  const mimeType = mimeMap[ext] || "image/jpeg";
  console.log("📸 File size:", fileBuffer.length, "bytes, type:", mimeType);

  const url = "https://upload.twitter.com/1.1/media/upload.json";
  const authHeader = oauth.toHeader(
    oauth.authorize({ url, method: "POST" }, token)
  );

  // Use multipart/form-data — body is NOT included in OAuth signature
  const formData = new FormData();
  formData.append("media", new Blob([fileBuffer], { type: mimeType }), path.basename(absolutePath));

  const response = await fetch(url, {
    method: "POST",
    headers: { ...authHeader },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("❌ Media Upload Error:", JSON.stringify(data));
    throw new Error(`Media Upload Failed: ${JSON.stringify(data)}`);
  }

  console.log("✅ Media uploaded! media_id:", data.media_id_string);
  return data.media_id_string;
}

// ─── Post a tweet (with optional media) ──────────────────────────────
export async function postTweet(postId: string) {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
  });

  let mediaIds: string[] = [];

  if (post.mediaPath && post.mediaPath.startsWith("/uploads/")) {
    console.log("📸 Post has media, uploading to Twitter...");
    try {
      const mediaId = await uploadMedia(post.mediaPath);
      mediaIds.push(mediaId);
    } catch (err: any) {
      console.error("❌ Media upload failed:", err.message);
    }
  } else {
    console.log("📝 Text-only post. mediaPath:", post.mediaPath);
  }

  const endpointURL = "https://api.twitter.com/2/tweets";
  const authHeader = oauth.toHeader(
    oauth.authorize({ url: endpointURL, method: "POST" }, token)
  );

  const payload: any = { text: post.content };
  if (mediaIds.length > 0) {
    payload.media = { media_ids: mediaIds };
  }

  console.log("🚀 Posting tweet, media_ids:", mediaIds);

  const response = await fetch(endpointURL, {
    method: "POST",
    headers: { ...authHeader, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("❌ Twitter API Error:", JSON.stringify(data));
    throw new Error(data.detail || data.title || "Twitter API Error");
  }

  console.log("🚀 Tweet posted! ID:", data.data.id);
  return data.data;
}

export function getTwitterAuthUrl(state: string): string {
  return `${process.env.APP_URL}/accounts?success=twitter`;
}

export async function syncTwitterAccount() {
  return await prisma.connectedAccount.upsert({
    where: { platform: "twitter" },
    update: {
      username: "ItsLunaNoir_",
      displayName: "Luna",
      avatarUrl: "https://pbs.twimg.com/profile_images/2055275915156836352/1TJUmeGH_normal.jpg",
      updatedAt: new Date(),
    },
    create: {
      platform: "twitter",
      username: "ItsLunaNoir_",
      displayName: "Luna",
      avatarUrl: "https://pbs.twimg.com/profile_images/2055275915156836352/1TJUmeGH_normal.jpg",
      accountId: "2055274966187175936",
      accessToken: "connected",
      refreshToken: "via-env",
    },
  });
}
