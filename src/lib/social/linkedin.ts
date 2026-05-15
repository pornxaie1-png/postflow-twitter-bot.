import axios from "axios";
import { prisma } from "@/lib/prisma";

const BASE = "https://api.linkedin.com/v2";

// ─── Step 1: Build the authorization URL ──────────────────────────────────
export function getLinkedInAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: `${process.env.APP_URL}/api/oauth/linkedin/callback`,
    scope: "openid profile email w_member_social",
    state,
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

// ─── Step 2: Exchange auth code for access token ──────────────────────────
export async function exchangeLinkedInCode(code: string) {
  const { data } = await axios.post(
    "https://www.linkedin.com/oauth/v2/accessToken",
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${process.env.APP_URL}/api/oauth/linkedin/callback`,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return data; // { access_token, expires_in, refresh_token? }
}

// ─── Step 3: Get the authenticated user's profile ─────────────────────────
export async function getLinkedInUser(accessToken: string) {
  const { data } = await axios.get("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data; // { sub (person URN), name, email, picture }
}

// ─── Step 4: Post a text update to LinkedIn ──────────────────────────────
export async function postToLinkedIn(postId: string) {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    include: { accounts: { include: { account: true } } },
  });

  const liAccount = post.accounts.find(
    (a) => a.account.platform === "linkedin"
  );
  if (!liAccount) throw new Error("No LinkedIn account linked to this post");

  const personUrn = `urn:li:person:${liAccount.account.accountId}`;
  const token = liAccount.account.accessToken;

  const body = {
    author: personUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: post.content },
        shareMediaCategory: "NONE",
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const { data } = await axios.post(`${BASE}/ugcPosts`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
  });

  return data; // { id: "urn:li:ugcPost:..." }
}
