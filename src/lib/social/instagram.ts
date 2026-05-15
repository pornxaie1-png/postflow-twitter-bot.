import axios from "axios";
import { prisma } from "@/lib/prisma";

const BASE = "https://graph.facebook.com/v19.0";

// ─── Step 1: Build the authorization URL ──────────────────────────────────
// Requires: Business/Creator Instagram account linked to a Facebook Page
export function getInstagramAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_CLIENT_ID!,
    redirect_uri: `${process.env.APP_URL}/api/oauth/instagram/callback`,
    scope: [
      "instagram_basic",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
    ].join(","),
    response_type: "code",
    state,
  });
  return `https://www.facebook.com/v19.0/dialog/oauth?${params}`;
}

// ─── Step 2: Exchange auth code for a short-lived token ──────────────────
export async function exchangeInstagramCode(code: string) {
  const { data } = await axios.get(`${BASE}/oauth/access_token`, {
    params: {
      client_id: process.env.INSTAGRAM_CLIENT_ID,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
      redirect_uri: `${process.env.APP_URL}/api/oauth/instagram/callback`,
      code,
    },
  });
  return data; // { access_token, token_type }
}

// ─── Step 3: Exchange for a long-lived token (60-day expiry) ─────────────
export async function getLongLivedToken(shortToken: string) {
  const { data } = await axios.get(`${BASE}/oauth/access_token`, {
    params: {
      grant_type: "fb_exchange_token",
      client_id: process.env.INSTAGRAM_CLIENT_ID,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
      fb_exchange_token: shortToken,
    },
  });
  return data; // { access_token, token_type, expires_in }
}

// ─── Step 4: Get the user's connected Instagram Business account ──────────
export async function getInstagramAccount(accessToken: string) {
  // Get Facebook Pages
  const { data: pagesData } = await axios.get(`${BASE}/me/accounts`, {
    params: { access_token: accessToken, fields: "instagram_business_account,name" },
  });

  const page = pagesData.data?.find((p: any) => p.instagram_business_account);
  if (!page) throw new Error("No Instagram Business account found on your Facebook Pages");

  const igId = page.instagram_business_account.id;

  // Get Instagram profile
  const { data: igData } = await axios.get(`${BASE}/${igId}`, {
    params: {
      access_token: accessToken,
      fields: "id,username,name,profile_picture_url,followers_count",
    },
  });

  return { ...igData, pageAccessToken: accessToken }; // { id, username, name, profile_picture_url, followers_count }
}

// ─── Step 5: Post an image to Instagram ──────────────────────────────────
// mediaUrl MUST be a publicly accessible URL (not localhost)
export async function postToInstagram(postId: string, mediaUrl?: string) {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    include: { accounts: { include: { account: true } } },
  });

  const igAccount = post.accounts.find(
    (a) => a.account.platform === "instagram"
  );
  if (!igAccount) throw new Error("No Instagram account linked to this post");

  const igUserId = igAccount.account.accountId;
  const token = igAccount.account.accessToken;

  if (!mediaUrl) {
    // Text-only: not supported on Instagram — need media
    throw new Error("Instagram requires an image or video");
  }

  // Step A: Create a media container
  const { data: container } = await axios.post(
    `${BASE}/${igUserId}/media`,
    null,
    {
      params: {
        image_url: mediaUrl,
        caption: post.content,
        access_token: token,
      },
    }
  );

  // Step B: Publish the container
  const { data: published } = await axios.post(
    `${BASE}/${igUserId}/media_publish`,
    null,
    {
      params: {
        creation_id: container.id,
        access_token: token,
      },
    }
  );

  return published; // { id }
}
