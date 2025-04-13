/** @format */

import PostDetail from "@/components/app/post/PostDetail";
import React from "react";

export default async function PostPage({ params }) {
  const { postId } = await params;

  return <PostDetail postId={postId} />;
}
