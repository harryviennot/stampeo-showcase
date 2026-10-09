import { blogFeedResponse } from "@/lib/blog/feed";

export async function GET() {
  return blogFeedResponse("pl");
}
