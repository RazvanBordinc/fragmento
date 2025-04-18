/** @format */
import FeedLayout from "@/components/app/feed/FeedLayout";
import { fetchDiscoverPostsServer } from "@/lib/posts/PostsApi";

export default async function DiscoverPage() {
  // Fetch trending/discover posts server-side
  const postsData = await fetchDiscoverPostsServer(1, 20);

  // Extract the posts and pass them to the client component
  const initialPosts = postsData?.posts || [];

  return <FeedLayout initialPosts={initialPosts} />;
}
