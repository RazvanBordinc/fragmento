/** @format */
import React from "react";
import PostDetail from "@/components/app/post/PostDetail";
import { fetchPostServer } from "@/lib/posts/PostsApi";

export default async function PostPage({ params }) {
  const { postId } = params;

  // Fetch the post data server-side
  const postData = await fetchPostServer(postId);

  return <PostDetail postId={postId} initialPostData={postData} />;
}
