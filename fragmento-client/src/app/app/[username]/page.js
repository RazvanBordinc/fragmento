/** @format */

import UserProfile from "@/components/app/profile/UserProfile";
import React from "react";

export default async function UserProfilePage({ params }) {
  const { username } = await params;

  return <UserProfile username={username} />;
}
