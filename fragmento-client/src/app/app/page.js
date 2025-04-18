/** @format */
import FeedLayout from "@/components/app/feed/FeedLayout";
import { fetchPostsServer } from "@/lib/posts/PostsApi";

export default async function HomePage() {
  // Fetch initial posts server-side to improve SEO and initial load time
  const postsData = await fetchPostsServer(1, 20);

  // Extract the posts and pass them to the client component
  const initialPosts = postsData?.posts || [];

  return <FeedLayout initialPosts={initialPosts} />;
}
