/** @format */
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  UserPlus,
  Heart,
  MessageSquare,
  Filter,
  MoreHorizontal,
  Check,
  CheckCheck,
  Trash2,
  AtSign,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const router = useRouter();

  // State for notifications and filtering
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);

      // In a real app, this would be an API call to get notifications
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data for notifications
      const mockNotifications = [
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
        {
          id: "notif6",
          type: "follow",
          user: {
            id: "user222",
            username: "perfume_passion",
            profilePic: null,
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          read: true,
          content: {
            action: "followed you",
          },
        },
        {
          id: "notif7",
          type: "comment",
          user: {
            id: "user333",
            username: "frangrancereviewer",
            profilePic: null,
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
          read: true,
          content: {
            action: "replied to your comment",
            postId: "post202",
            postTitle: "Black Opium by YSL",
            comment: "I agree, the longevity is definitely impressive!",
          },
        },
        {
          id: "notif8",
          type: "like",
          user: {
            id: "user444",
            username: "cologne_connoisseur",
            profilePic: null,
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
          read: true,
          content: {
            action: "liked your post",
            postId: "post303",
            postTitle: "Y EDP by YSL",
          },
        },
      ];

      setNotifications(mockNotifications);
      setFilteredNotifications(mockNotifications);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  // Apply filter when activeFilter changes
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(
        notifications.filter((notif) => notif.type === activeFilter)
      );
    }
  }, [activeFilter, notifications]);

  // Filter options
  const filters = [
    { id: "all", label: "All", icon: <Bell size={16} /> },
    { id: "follow", label: "Follows", icon: <UserPlus size={16} /> },
    { id: "like", label: "Likes", icon: <Heart size={16} /> },
    { id: "comment", label: "Comments", icon: <MessageSquare size={16} /> },
    { id: "mention", label: "Mentions", icon: <AtSign size={16} /> },
  ];

  // Mark all as read
  const markAllAsRead = async () => {
    // In a real app, this would be an API call
    // For now, just update the state
    const updatedNotifications = notifications.map((notif) => ({
      ...notif,
      read: true,
    }));

    setNotifications(updatedNotifications);
    setFilteredNotifications(
      activeFilter === "all"
        ? updatedNotifications
        : updatedNotifications.filter((notif) => notif.type === activeFilter)
    );

    // Close dropdown
    setDropdownOpen(false);
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    // In a real app, this would be an API call
    // For now, just clear the state
    setNotifications([]);
    setFilteredNotifications([]);

    // Close dropdown
    setDropdownOpen(false);
  };

  // Format time using date-fns
  const formatTime = (date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Group notifications by date
  const groupNotificationsByDate = (notifications) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    notifications.forEach((notification) => {
      const notifDate = new Date(notification.timestamp);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (notifDate > thisWeek) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "follow":
        return <UserPlus size={18} className="text-blue-400" />;
      case "like":
        return <Heart size={18} className="text-red-400" />;
      case "comment":
        return <MessageSquare size={18} className="text-green-400" />;
      case "mention":
        return <AtSign size={18} className="text-orange-400" />;
      default:
        return <Bell size={18} className="text-zinc-400" />;
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Navigate to the appropriate page
    if (notification.type === "follow") {
      router.push(`/app/${notification.user.username}`);
    } else {
      router.push(`/app/post/${notification.content.postId}`);
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
          <div>
            <span
              className="font-medium text-orange-400 hover:underline cursor-pointer"
              onClick={(e) => handleUsernameClick(e, user.username)}
            >
              @{user.username}
            </span>{" "}
            {content.action}
          </div>
        );
      case "like":
        return (
          <div>
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
          </div>
        );
      case "comment":
      case "mention":
        return (
          <div>
            <div>
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
            </div>
            {content.comment && (
              <div className="mt-1 pl-2 border-l-2 border-zinc-700 text-zinc-400 text-sm">
                "{content.comment}"
              </div>
            )}
          </div>
        );
      default:
        return <div>You have a new notification</div>;
    }
  };

  // Group notifications for display
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  // Check if there are any unread notifications
  const hasUnreadNotifications = notifications.some((notif) => !notif.read);

  // Get count of notifications by type (for filter badges)
  const getNotificationCountByType = (type) => {
    return notifications.filter((notif) => notif.type === type).length;
  };

  return (
    <div className="min-h-screen bg-zinc-900 pt-6 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Bell className="mr-2 text-orange-500" size={24} />
            Notifications
          </h1>

          <div className="relative">
            <motion.button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MoreHorizontal size={20} />
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-10"
                >
                  <div className="py-1">
                    <button
                      onClick={markAllAsRead}
                      disabled={!hasUnreadNotifications}
                      className={`w-full flex items-center px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                        hasUnreadNotifications
                          ? "text-zinc-300 hover:bg-zinc-700"
                          : "text-zinc-500 cursor-not-allowed"
                      }`}
                    >
                      <CheckCheck size={16} className="mr-2" />
                      Mark all as read
                    </button>

                    <button
                      onClick={deleteAllNotifications}
                      disabled={notifications.length === 0}
                      className={`w-full flex items-center px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                        notifications.length > 0
                          ? "text-red-400 hover:bg-zinc-700"
                          : "text-zinc-500 cursor-not-allowed"
                      }`}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 overflow-x-auto scrollbar-none">
          <div className="flex space-x-2 pb-2">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center px-3 py-1.5 rounded-full cursor-pointer ${
                  activeFilter === filter.id
                    ? "bg-orange-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                } whitespace-nowrap transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-1.5">{filter.icon}</span>
                <span>{filter.label}</span>
                {filter.id !== "all" && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-zinc-700/50">
                    {getNotificationCountByType(filter.id)}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Notifications content */}
        <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Bell size={40} className="text-zinc-600 mb-4" />
              <h3 className="text-lg font-medium text-zinc-300 mb-2">
                No notifications yet
              </h3>
              <p className="text-zinc-500 max-w-md">
                When someone follows you, likes your posts, or comments on your
                content, you'll see it here.
              </p>
            </div>
          ) : (
            <div>
              {/* Today's notifications */}
              {groupedNotifications.today.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-zinc-900/50">
                    <h2 className="text-sm font-medium text-zinc-400">Today</h2>
                  </div>
                  <div className="divide-y divide-zinc-700">
                    {groupedNotifications.today.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        formatTime={formatTime}
                        getNotificationIcon={getNotificationIcon}
                        getNotificationContent={getNotificationContent}
                        onNotificationClick={handleNotificationClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Yesterday's notifications */}
              {groupedNotifications.yesterday.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-zinc-900/50 border-t border-zinc-700">
                    <h2 className="text-sm font-medium text-zinc-400">
                      Yesterday
                    </h2>
                  </div>
                  <div className="divide-y divide-zinc-700">
                    {groupedNotifications.yesterday.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        formatTime={formatTime}
                        getNotificationIcon={getNotificationIcon}
                        getNotificationContent={getNotificationContent}
                        onNotificationClick={handleNotificationClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* This week's notifications */}
              {groupedNotifications.thisWeek.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-zinc-900/50 border-t border-zinc-700">
                    <h2 className="text-sm font-medium text-zinc-400">
                      This Week
                    </h2>
                  </div>
                  <div className="divide-y divide-zinc-700">
                    {groupedNotifications.thisWeek.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        formatTime={formatTime}
                        getNotificationIcon={getNotificationIcon}
                        getNotificationContent={getNotificationContent}
                        onNotificationClick={handleNotificationClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Older notifications */}
              {groupedNotifications.older.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-zinc-900/50 border-t border-zinc-700">
                    <h2 className="text-sm font-medium text-zinc-400">Older</h2>
                  </div>
                  <div className="divide-y divide-zinc-700">
                    {groupedNotifications.older.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        formatTime={formatTime}
                        getNotificationIcon={getNotificationIcon}
                        getNotificationContent={getNotificationContent}
                        onNotificationClick={handleNotificationClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Notification item component - without Link wrapping
function NotificationItem({
  notification,
  formatTime,
  getNotificationIcon,
  getNotificationContent,
  onNotificationClick,
}) {
  return (
    <div
      className="block cursor-pointer"
      onClick={() => onNotificationClick(notification)}
    >
      <motion.div
        whileHover={{ backgroundColor: "#2A2A2A" }}
        className={`p-4 flex ${
          notification.read
            ? "bg-zinc-800"
            : "bg-zinc-800/60 border-l-2 border-orange-500"
        }`}
      >
        <div className="mr-3 mt-0.5">
          {notification.user.profilePic ? (
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={notification.user.profilePic}
                alt={notification.user.username}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-medium">
              {notification.user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="text-sm text-zinc-300">
              {getNotificationContent(notification)}
            </div>
            <div className="flex items-center ml-2 mr-1">
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
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
  );
}
