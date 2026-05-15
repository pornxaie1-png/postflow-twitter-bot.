// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OAuth from "oauth-1.0a";
import crypto from "crypto";

// This auto-connects the Twitter account using env vars and stores it in the DB
export async function POST() {
  try {
    const consumerKey = process.env.TWITTER_CONSUMER_KEY;
    const consumerSecret = process.env.TWITTER_CONSUMER_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    if (!consumerKey || !consumerSecret || !accessToken || !accessSecret) {
      return NextResponse.json({ error: "Twitter credentials not configured" }, { status: 400 });
    }

    // Fetch profile from Twitter API
    const oauth = new OAuth({
      consumer: { key: consumerKey, secret: consumerSecret },
      signature_method: "HMAC-SHA1",
      hash_function(base_string, key) {
        return crypto.createHmac("sha1", key).update(base_string).digest("base64");
      },
    });
    const token = { key: accessToken, secret: accessSecret };

    const url = "https://api.twitter.com/2/users/me?user.fields=name,username,profile_image_url,public_metrics";
    const headers = oauth.toHeader(oauth.authorize({ url, method: "GET" }, token));
    const res = await fetch(url, { headers: headers as any });

    if (!res.ok) {
      const errBody = await res.text();
      return NextResponse.json({ error: `Twitter API error: ${errBody}` }, { status: res.status });
    }

    const { data: user } = await res.json();

    // Upsert the account in the database
    const account = await (prisma as any).connectedAccount.upsert({
      where: { platform: "twitter" },
      update: {
        username: user.username,
        displayName: user.name,
        avatarUrl: user.profile_image_url?.replace("_normal", "_400x400"),
        accountId: user.id,
        accessToken: accessToken,
        followersCount: user.public_metrics?.followers_count || 0,
      },
      create: {
        platform: "twitter",
        username: user.username,
        displayName: user.name,
        avatarUrl: user.profile_image_url?.replace("_normal", "_400x400"),
        accountId: user.id,
        accessToken: accessToken,
        followersCount: user.public_metrics?.followers_count || 0,
      },
    });

    return NextResponse.json({ success: true, account });
  } catch (error: any) {
    console.error("Auto-connect error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
