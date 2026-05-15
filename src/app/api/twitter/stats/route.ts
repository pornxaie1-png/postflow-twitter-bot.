import { NextResponse } from "next/server";
import OAuth from "oauth-1.0a";
import crypto from "crypto";

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

export async function GET() {
  try {
    // Fetch profile data
    const profileUrl = "https://api.twitter.com/2/users/me?user.fields=name,username,profile_image_url,public_metrics,description,created_at";
    const profileHeaders = oauth.toHeader(oauth.authorize({ url: profileUrl, method: "GET" }, token));
    const profileRes = await fetch(profileUrl, { headers: profileHeaders as any, next: { revalidate: 60 } });

    if (!profileRes.ok) {
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: profileRes.status });
    }

    const profileData = await profileRes.json();
    const user = profileData.data;

    // Fetch recent tweets
    const tweetsUrl = `https://api.twitter.com/2/users/${user.id}/tweets?max_results=5&tweet.fields=created_at,public_metrics`;
    const tweetsHeaders = oauth.toHeader(oauth.authorize({ url: tweetsUrl, method: "GET" }, token));
    const tweetsRes = await fetch(tweetsUrl, { headers: tweetsHeaders as any, next: { revalidate: 60 } });

    let recentTweets: any[] = [];
    if (tweetsRes.ok) {
      const tweetsData = await tweetsRes.json();
      recentTweets = tweetsData.data || [];
    }

    return NextResponse.json({
      profile: {
        name: user.name,
        username: user.username,
        avatar: user.profile_image_url?.replace("_normal", "_400x400"),
        bio: user.description,
        createdAt: user.created_at,
      },
      metrics: user.public_metrics,
      recentTweets: recentTweets.map((t: any) => ({
        id: t.id,
        text: t.text,
        createdAt: t.created_at,
        likes: t.public_metrics?.like_count || 0,
        retweets: t.public_metrics?.retweet_count || 0,
        replies: t.public_metrics?.reply_count || 0,
        impressions: t.public_metrics?.impression_count || 0,
      })),
    });
  } catch (error: any) {
    console.error("Twitter Stats Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
