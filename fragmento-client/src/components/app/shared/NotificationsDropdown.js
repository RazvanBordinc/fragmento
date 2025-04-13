/** @format */
"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Heart,
  MessageSquare,
  ChevronRight,
  Clock,
  AtSign,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsDropdown() {
  const router = useRouter();

  // Mock notification data
  const notifications = [
    {
      id: "notif1",
      type: "follow",
      user: {
        id: "user123",
        username: "perfumemaster",
        profilePic: null,
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      content: {
        action: "followed you",
      },
    },
    {
      id: "notif2",
      type: "like",
      user: {
        id: "user456",
        username: "scentexplorer",
        profilePic: null,
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      content: {
        action: "liked your post",
        postId: "post123",
        postTitle: "Light Blue by D&G",
      },
    },
    {
      id: "notif3",
      type: "comment",
      user: {
        id: "user789",
        username: "fragranceboutique",
        profilePic: null,
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
      content: {
        action: "commented on your post",
        postId: "post456",
        postTitle: "Aventus by Creed",
        comment: "This is my signature fragrance too! Great choice!",
      },
    },
    {
      id: "notif4",
      type: "like",
      user: {
        id: "user321",
        username: "oudlover",
        profilePic: null,
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      content: {
        action: "liked your comment",
        postId: "post789",
        postTitle: "Oud Wood by Tom Ford",
      },
    },
    {
      id: "notif5",
      type: "mention",
      user: {
        id: "user654",
        username: "aromatic_adventures",
        profilePic: null,
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      read: true,
      content: {
        action: "mentioned you in a comment",
        postId: "post101",
        postTitle: "Sauvage by Dior",
        comment: "I think @fragrancefan would love this one too!",
      },
    },
  ];

  // Format time using date-fns
  const formatTime = (date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "follow":
        return <UserPlus size={16} className="text-blue-400" />;
      case "like":
        return <Heart size={16} className="text-red-400" />;
      case "comment":
        return <MessageSquare size={16} className="text-green-400" />;
      case "mention":
        return <AtSign size={16} className="text-orange-400" />;
      default:
        return <Clock size={16} className="text-zinc-400" />;
    }
  };

  // Handle username click
  const handleUsernameClick = (e, username) => {
    e.stopPropagation(); // Prevent the parent notification click
    router.push(`/app/${username}`);
  };

  // Handle post title click
  const handlePostClick = (e, postId) => {
    e.stopPropagation(); // Prevent the parent notification click
    router.push(`/app/post/${postId}`);
  };

  // Get notification content based on type
  const getNotificationContent = (notification) => {
    const { type, user, content } = notification;

    switch (type) {
      case "follow":
        return (
          <span>
            <span
              className="font-medium text-orange-400 hover:underline cursor-pointer"
              onClick={(e) => handleUsernameClick(e, user.username)}
            >
              @{user.username}
            </span>{" "}
            {content.action}
          </span>
        );
      case "like":
        return (
          <span>
            <span
              className="font-medium text-orange-400 hover:underline cursor-pointer"
              onClick={(e) => handleUsernameClick(e, user.username)}
            >
              @{user.username}
            </span>{" "}
            {content.action}{" "}
            <span
              className="text-zinc-300 hover:text-white cursor-pointer"
              onClick={(e) => handlePostClick(e, content.postId)}
            >
              {content.postTitle}
            </span>
          </span>
        );
      case "comment":
        return (
          <span>
            <span
              className="font-medium text-orange-400 hover:underline cursor-pointer"
              onClick={(e) => handleUsernameClick(e, user.username)}
            >
              @{user.username}
            </span>{" "}
            {content.action}{" "}
            <span
              className="text-zinc-300 hover:text-white cursor-pointer"
              onClick={(e) => handlePostClick(e, content.postId)}
            >
              {content.postTitle}
            </span>
            <span className="block mt-1 text-zinc-400 text-xs italic">
              "
              {content.comment.length > 50
                ? content.comment.substring(0, 50) + "..."
                : content.comment}
              "
            </span>
          </span>
        );
      case "mention":
        return (
          <span>
            <span
              className="font-medium text-orange-400 hover:underline cursor-pointer"
              onClick={(e) => handleUsernameClick(e, user.username)}
            >
              @{user.username}
            </span>{" "}
            {content.action}{" "}
            <span
              className="text-zinc-300 hover:text-white cursor-pointer"
              onClick={(e) => handlePostClick(e, content.postId)}
            >
              {content.postTitle}
            </span>
            <span className="block mt-1 text-zinc-400 text-xs italic">
              "
              {content.comment.length > 50
                ? content.comment.substring(0, 50) + "..."
                : content.comment}
              "
            </span>
          </span>
        );
      default:
        return <span>You have a new notification</span>;
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (notification.type === "follow") {
      router.push(`/app/${notification.user.username}`);
    } else {
      router.push(`/app/post/${notification.content.postId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-50"
      style={{ top: "100%" }}
    >
      <div className="p-3 border-b border-zinc-700 flex justify-between items-center">
        <h3 className="text-white font-medium">Notifications</h3>
        <Link
          href="/app/notifications"
          className="text-orange-400 text-xs hover:text-orange-300 cursor-pointer"
        >
          See all
        </Link>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-zinc-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="block cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <motion.div
                  whileHover={{ backgroundColor: "#2A2A2A" }}
                  className={`p-3 flex ${
                    notification.read ? "bg-zinc-800" : "bg-zinc-800/60"
                  }`}
                >
                  <div className="mr-3 mt-0.5">
                    {notification.user.profilePic ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={notification.user.profilePic}
                          alt={notification.user.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm font-medium">
                        {notification.user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="text-sm text-zinc-300">
                        {getNotificationContent(notification)}
                      </div>
                      <div className="flex items-center ml-2">
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>
                        )}
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {formatTime(notification.timestamp)}
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-500">
            <p>No notifications yet</p>
          </div>
        )}
      </div>

      <div className="bg-zinc-800 p-2 border-t border-zinc-700">
        <Link href="/app/notifications">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg text-sm font-medium flex items-center justify-center cursor-pointer transition-colors"
          >
            <span>View All Notifications</span>
            <ChevronRight size={16} className="ml-1" />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
