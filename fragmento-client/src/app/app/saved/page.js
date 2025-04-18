/** @format */
import { cookies } from "next/headers";
import FeedLayout from "@/components/app/feed/FeedLayout";
import { fetchSavedPosts } from "@/lib/posts/PostsAction";
import { redirect } from "next/navigation";

export default async function SavedPostsPage() {
  // Check for authentication token
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  // If no token, redirect to login
  if (!token) {
    redirect("/");
  }

  // Fetch saved posts server-side
  const postsData = await fetchSavedPosts(token, 1, 20);

  // Extract the posts and pass them to the client component
  const initialPosts = postsData?.posts || [];

  return (
    <div>
      <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 py-4 px-6 mb-4">
        <h1 className="text-2xl font-bold text-white">My Saved Fragrances</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Your collection of saved fragrance posts
        </p>
      </div>

      <FeedLayout initialPosts={initialPosts} isSavedPage={true} />
    </div>
  );
}
