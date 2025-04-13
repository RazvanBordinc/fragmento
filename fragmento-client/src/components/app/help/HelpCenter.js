/** @format */
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  SprayCan,
  UserPlus,
  Heart,
  Bookmark,
  Image,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default function HelpCenter() {
  // State for active section and search
  const [activeSection, setActiveSection] = useState("getting-started");
  const [expandedFaqs, setExpandedFaqs] = useState([]);

  // Handle FAQ toggle
  const toggleFaq = (id) => {
    setExpandedFaqs((prev) =>
      prev.includes(id) ? prev.filter((faqId) => faqId !== id) : [...prev, id]
    );
  };

  // Check if FAQ is expanded
  const isFaqExpanded = (id) => {
    return expandedFaqs.includes(id);
  };

  // Content sections
  const sections = [
    {
      id: "getting-started",
      label: "Getting Started",
      icon: <HelpCircle size={18} />,
    },
    { id: "posts", label: "Creating Posts", icon: <SprayCan size={18} /> },
    {
      id: "profiles",
      label: "Profiles & Following",
      icon: <UserPlus size={18} />,
    },
    { id: "discover", label: "Discover & Explore", icon: <Search size={18} /> },
  ];

  // FAQs data
  const faqData = [
    {
      id: "faq-1",
      question: "What is Fragmento?",
      answer:
        "Fragmento is a social media platform dedicated to fragrance enthusiasts. Share your favorite scents, discover new fragrances, and connect with other people who share your passion for perfumes and colognes.",
    },
    {
      id: "faq-2",
      question: "How do I create an account?",
      answer:
        "To create an account, click the 'Sign Up' button on our landing page. You'll need to provide a valid email address and create a username and password. After verifying your email, you can start customizing your profile and exploring the platform.",
    },
    {
      id: "faq-3",
      question: "Is Fragmento free to use?",
      answer:
        "Yes, Fragmento is completely free to use! You can create an account, share posts, follow other users, and access all basic features at no cost. In the future, we may introduce premium features, but our core functionality will always remain free.",
    },
    {
      id: "faq-4",
      question: "How do I share my signature fragrance?",
      answer:
        "To set your signature fragrance, go to your profile and click 'Edit Profile'. On the edit modal, click the 'Signature' tab and enter details about your signature scent, including name, brand, photo, and notes. Click 'Save Changes' when you're done, and your signature fragrance will be displayed on your profile.",
    },
    {
      id: "faq-5",
      question: "How do I follow other users?",
      answer:
        "To follow another user, visit their profile page and click the 'Follow' button. You'll start seeing their posts in your feed and can view their activity. You can manage your following list from your profile page.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-900 text-white pt-6 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-3">Help Center</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Find answers to your questions about Fragmento and learn how to make
            the most of our fragrance community.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar navigation */}
          <div className="w-full md:w-64 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
            <nav>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center w-full px-4 py-3 cursor-pointer transition-colors ${
                    activeSection === section.id
                      ? "bg-zinc-700 text-orange-400 border-l-2 border-orange-500"
                      : "text-zinc-300 hover:bg-zinc-700/70"
                  }`}
                >
                  <span className="mr-3">{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main content area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeSection === "getting-started" && (
                <motion.div
                  key="getting-started-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-zinc-800 rounded-lg border border-zinc-700 p-5"
                >
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <HelpCircle size={20} className="mr-2 text-orange-400" />
                    Getting Started with Fragmento
                  </h2>

                  <div className="space-y-6 text-zinc-300">
                    <p>
                      Welcome to Fragmento, the social network for fragrance
                      enthusiasts! Here's how to get started:
                    </p>

                    <div className="space-y-4">
                      <div className="bg-zinc-700/50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2 text-sm">
                            1
                          </span>
                          Create Your Profile
                        </h3>
                        <p className="text-zinc-300 ml-8">
                          After signing up, customize your profile with a bio
                          and profile picture. Add your signature fragrance to
                          let others know your favorite scent.
                        </p>
                      </div>

                      <div className="bg-zinc-700/50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2 text-sm">
                            2
                          </span>
                          Follow Other Enthusiasts
                        </h3>
                        <p className="text-zinc-300 ml-8">
                          Find other fragrance lovers by browsing the Discover
                          section. Follow accounts that interest you to see
                          their posts in your feed.
                        </p>
                      </div>

                      <div className="bg-zinc-700/50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2 text-sm">
                            3
                          </span>
                          Create Your First Post
                        </h3>
                        <p className="text-zinc-300 ml-8">
                          Share a fragrance you love by creating a post. Add
                          details like notes, occasion, seasonality, and your
                          personal experience with the scent.
                        </p>
                      </div>

                      <div className="bg-zinc-700/50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2 text-sm">
                            4
                          </span>
                          Engage with the Community
                        </h3>
                        <p className="text-zinc-300 ml-8">
                          Like, comment, and save posts from other users. Join
                          conversations and share your thoughts on fragrances
                          you're familiar with.
                        </p>
                      </div>
                    </div>

                    {/* Frequently Asked Questions */}
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-white mb-4">
                        Frequently Asked Questions
                      </h3>

                      <div className="space-y-3">
                        {faqData.map((faq) => (
                          <div
                            key={faq.id}
                            className="border border-zinc-700 rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() => toggleFaq(faq.id)}
                              className="w-full flex items-center justify-between p-4 text-left bg-zinc-700/30 hover:bg-zinc-700/60 cursor-pointer transition-colors"
                            >
                              <span className="font-medium text-white">
                                {faq.question}
                              </span>
                              {isFaqExpanded(faq.id) ? (
                                <ChevronUp
                                  size={20}
                                  className="text-zinc-400"
                                />
                              ) : (
                                <ChevronDown
                                  size={20}
                                  className="text-zinc-400"
                                />
                              )}
                            </button>

                            <AnimatePresence>
                              {isFaqExpanded(faq.id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 bg-zinc-800 text-zinc-300">
                                    {faq.answer}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "posts" && (
                <motion.div
                  key="posts-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-zinc-800 rounded-lg border border-zinc-700 p-5"
                >
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <SprayCan size={20} className="mr-2 text-orange-400" />
                    Creating Fragrance Posts
                  </h2>

                  <div className="space-y-6 text-zinc-300">
                    <p>
                      Sharing your fragrance experiences is at the heart of
                      Fragmento. Here's how to create detailed and engaging
                      posts:
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start border-l-2 border-orange-500 pl-4 py-1">
                        <Plus
                          size={20}
                          className="text-orange-500 mr-3 flex-shrink-0 mt-0.5"
                        />
                        <div>
                          <h3 className="text-white font-medium mb-1">
                            Creating a New Post
                          </h3>
                          <p className="text-zinc-300">
                            Click the "+" button in the bottom right corner of
                            the feed to start creating a post. This opens the
                            post creation form.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start border-l-2 border-orange-500 pl-4 py-1">
                        <SprayCan
                          size={20}
                          className="text-orange-500 mr-3 flex-shrink-0 mt-0.5"
                        />
                        <div>
                          <h3 className="text-white font-medium mb-1">
                            Basic Information
                          </h3>
                          <p className="text-zinc-300">
                            Start by entering the fragrance name, brand, and
                            category. Add a detailed description of your
                            experience with the scent.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start border-l-2 border-orange-500 pl-4 py-1">
                        <Image
                          size={20}
                          className="text-orange-500 mr-3 flex-shrink-0 mt-0.5"
                        />
                        <div>
                          <h3 className="text-white font-medium mb-1">
                            Adding Photos
                          </h3>
                          <p className="text-zinc-300">
                            Upload a photo of your fragrance bottle. Good
                            lighting and a clean background help showcase the
                            fragrance best.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start border-l-2 border-orange-500 pl-4 py-1">
                        <Droplets
                          size={20}
                          className="text-orange-500 mr-3 flex-shrink-0 mt-0.5"
                        />
                        <div>
                          <h3 className="text-white font-medium mb-1">
                            Notes & Accords
                          </h3>
                          <p className="text-zinc-300">
                            Add the fragrance notes (ingredients) and accords
                            (overall characteristics) to help others understand
                            the scent profile.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start border-l-2 border-orange-500 pl-4 py-1">
                        <Star
                          size={20}
                          className="text-orange-500 mr-3 flex-shrink-0 mt-0.5"
                        />
                        <div>
                          <h3 className="text-white font-medium mb-1">
                            Ratings & Season
                          </h3>
                          <p className="text-zinc-300">
                            Rate the fragrance on factors like longevity,
                            sillage, and value. Indicate which seasons the
                            fragrance works best in.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Post Tips */}
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mt-6">
                      <h3 className="text-white font-medium mb-2 flex items-center">
                        <HelpCircle
                          size={18}
                          className="text-orange-400 mr-2"
                        />
                        Tips for Great Fragrance Posts
                      </h3>
                      <ul className="space-y-2 text-zinc-300 ml-6 list-disc">
                        <li>
                          Be specific about what you like or dislike about the
                          fragrance
                        </li>
                        <li>
                          Mention specific occasions or settings where you've
                          worn it
                        </li>
                        <li>
                          Describe how the fragrance evolves over time (opening,
                          middle, base)
                        </li>
                        <li>
                          Mention compliments received or reactions from others
                        </li>
                        <li>
                          Compare to similar fragrances to help others
                          understand the scent
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "profiles" && (
                <motion.div
                  key="profiles-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-zinc-800 rounded-lg border border-zinc-700 p-5"
                >
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <UserPlus size={20} className="mr-2 text-orange-400" />
                    Profiles & Following
                  </h2>

                  <div className="space-y-6 text-zinc-300">
                    <h3 className="text-lg font-medium text-white">
                      Your Profile
                    </h3>

                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-700/30 rounded-lg">
                        <h4 className="text-white font-medium mb-2">
                          Profile Customization
                        </h4>
                        <p>
                          Your profile is your identity on Fragmento. Customize
                          it with a profile picture, cover photo, and bio. Add
                          your signature fragrance to showcase your personal
                          favorite.
                        </p>
                        <div className="mt-2 ml-4">
                          <p className="text-sm text-zinc-400">
                            Access by clicking your username in the navigation
                            bar, then "Edit Profile"
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-700/30 rounded-lg">
                        <h4 className="text-white font-medium mb-2">
                          Signature Fragrance
                        </h4>
                        <p>
                          Your signature fragrance is a special feature that
                          highlights your favorite or most-worn scent. It
                          appears prominently on your profile, giving visitors
                          an immediate sense of your preferences.
                        </p>
                        <div className="mt-2 ml-4">
                          <p className="text-sm text-zinc-400">
                            Set this in the Edit Profile modal, under the
                            "Signature" tab
                          </p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-medium text-white mt-6">
                      Following & Followers
                    </h3>

                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-700/30 rounded-lg">
                        <h4 className="text-white font-medium mb-2">
                          Following Users
                        </h4>
                        <p>
                          Follow other fragrance enthusiasts to see their posts
                          in your feed. Visit a profile and click the "Follow"
                          button to start following someone.
                        </p>
                        <div className="mt-2 ml-4">
                          <p className="text-sm text-zinc-400">
                            View who you're following by clicking "Following" on
                            your profile
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-700/30 rounded-lg">
                        <h4 className="text-white font-medium mb-2">
                          Managing Followers
                        </h4>
                        <p>
                          People who follow you can see your posts in their
                          feed. You can view your followers list and remove
                          followers if needed.
                        </p>
                        <div className="mt-2 ml-4">
                          <p className="text-sm text-zinc-400">
                            Access your followers list by clicking "Followers"
                            on your profile
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "discover" && (
                <motion.div
                  key="discover-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-zinc-800 rounded-lg border border-zinc-700 p-5"
                >
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Search size={20} className="mr-2 text-orange-400" />
                    Discover & Explore
                  </h2>

                  <div className="space-y-6 text-zinc-300">
                    <p>
                      Fragmento offers several ways to discover new fragrances
                      and connect with other enthusiasts:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-zinc-700/30 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <Search className="text-orange-400 mr-2" size={20} />
                          <h3 className="text-white font-medium">
                            Discover Feed
                          </h3>
                        </div>
                        <p className="text-zinc-300">
                          The Discover tab shows trending posts and content from
                          users you might be interested in. It's a great way to
                          find new fragrances and accounts to follow.
                        </p>
                        <div className="mt-3">
                          <Link
                            href="/app/discover"
                            className="text-orange-400 hover:text-orange-300 text-sm cursor-pointer"
                          >
                            Go to Discover →
                          </Link>
                        </div>
                      </div>

                      <div className="bg-zinc-700/30 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <Heart className="text-orange-400 mr-2" size={20} />
                          <h3 className="text-white font-medium">
                            Liking & Engaging
                          </h3>
                        </div>
                        <p className="text-zinc-300">
                          Like posts that you enjoy or find helpful. Engage with
                          others by leaving comments and asking questions about
                          fragrances you're curious about.
                        </p>
                      </div>

                      <div className="bg-zinc-700/30 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <Bookmark
                            className="text-orange-400 mr-2"
                            size={20}
                          />
                          <h3 className="text-white font-medium">
                            Saving Posts
                          </h3>
                        </div>
                        <p className="text-zinc-300">
                          Save posts to revisit later. This is useful for
                          keeping track of fragrances you want to try or reviews
                          you found particularly helpful.
                        </p>
                        <div className="mt-3">
                          <Link
                            href="/app/saved"
                            className="text-orange-400 hover:text-orange-300 text-sm cursor-pointer"
                          >
                            View Saved Posts →
                          </Link>
                        </div>
                      </div>

                      <div className="bg-zinc-700/30 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <MessageSquare
                            className="text-orange-400 mr-2"
                            size={20}
                          />
                          <h3 className="text-white font-medium">
                            Comments & Discussion
                          </h3>
                        </div>
                        <p className="text-zinc-300">
                          Join conversations by commenting on posts. Share your
                          experiences with fragrances, ask questions, or provide
                          recommendations to others.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
const Droplets = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
  </svg>
);

const Star = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
