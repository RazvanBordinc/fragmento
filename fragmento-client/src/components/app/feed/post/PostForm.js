/** @format */
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Save,
  Tag,
  Droplets,
  Sparkles,
  Star,
  CalendarDays,
  Sun,
  Moon,
  Image,
  X,
  AlignLeft,
} from "lucide-react";

import BasicInfo from "./BasicInfo";
import TagsInput from "./TagsInput";
import NotesSelect from "./NotesSelect";
import AccordsSelect from "./AccordsSelect";
import RatingSliders from "./RatingSliders";
import SeasonSliders from "./SeasonSliders";
import NightSlider from "./NightSlider";
import OccasionSelect from "./OcassionSelect";
import PhotoUpload from "./PhotoUpload";

export default function PostForm({ onSubmit }) {
  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    tags: [],
    notes: [],
    accords: [],
    ratings: {
      overall: 5,
      scent: 5,
      longevity: 5,
      sillage: 5,
      valueForMoney: 5,
    },
    seasons: {
      spring: 5,
      summer: 5,
      autumn: 5,
      winter: 5,
    },
    dayNight: 5,
    occasion: "",
    photoUrl: null, // Changed from photos array to photoUrl string
  });

  // Track which sections the user has visited/interacted with
  const [interactionState, setInteractionState] = useState({
    ratings: false,
    seasons: false,
    dayNight: false,
  });

  // Track completion status of each section
  const [completionStatus, setCompletionStatus] = useState({
    basicInfo: false,
    tags: false,
    notes: false,
    accords: false,
    ratings: false, // Only mark as complete when user interacts
    seasons: false, // Only mark as complete when user interacts
    dayNight: false, // Only mark as complete when user interacts
    occasion: false,
    photos: false,
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState(null);

  // Tab definitions
  const tabs = [
    {
      id: "tags",
      label: "Tags",
      icon: <Tag size={16} />,
      color: "text-orange-400",
    },
    {
      id: "notes",
      label: "Notes",
      icon: <Droplets size={16} />,
      color: "text-blue-400",
    },
    {
      id: "accords",
      label: "Accords",
      icon: <Sparkles size={16} />,
      color: "text-purple-400",
    },
    {
      id: "ratings",
      label: "Ratings",
      icon: <Star size={16} />,
      color: "text-yellow-400",
    },
    {
      id: "seasons",
      label: "Seasons",
      icon: <CalendarDays size={16} />,
      color: "text-green-400",
    },
    {
      id: "dayNight",
      label: "Day/Night",
      icon: (
        <div className="flex">
          <Sun size={16} />
          <Moon size={16} />
        </div>
      ),
      color: "text-indigo-400",
    },
    {
      id: "occasion",
      label: "Occasion",
      icon: <CalendarDays size={16} />,
      color: "text-pink-400",
    },
    {
      id: "photos",
      label: "Photos",
      icon: <Image size={16} />,
      color: "text-cyan-400",
    },
  ];

  // Function to update form data from child components
  const updateFormData = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    // Update completion status
    checkCompletionStatus(field, value);

    // Update interaction state for special fields
    if (field === "dayNight") {
      setInteractionState((prev) => ({
        ...prev,
        dayNight: true,
      }));
      setCompletionStatus((prev) => ({
        ...prev,
        dayNight: true,
      }));
    }
  };

  // Function to update nested form data (for ratings and seasons)
  const updateNestedFormData = (parent, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [parent]: {
        ...prevData[parent],
        [field]: value,
      },
    }));

    // Mark this section as interacted with
    setInteractionState((prev) => ({
      ...prev,
      [parent]: true,
    }));

    // Update completion status for the parent field
    setCompletionStatus((prev) => ({
      ...prev,
      [parent]: true,
    }));
  };

  // Function to check if a section is complete
  const checkCompletionStatus = (field, value) => {
    let isComplete = false;

    switch (field) {
      case "name":
      case "brand":
      case "category":
      case "description":
        // Update basicInfo completion status
        const updatedBasicInfo = {
          ...formData,
          [field]: value,
        };
        isComplete =
          updatedBasicInfo.name &&
          updatedBasicInfo.brand &&
          updatedBasicInfo.category;
        setCompletionStatus((prev) => ({
          ...prev,
          basicInfo: isComplete,
        }));
        break;
      case "tags":
        isComplete = value.length > 0;
        setCompletionStatus((prev) => ({
          ...prev,
          [field]: isComplete,
        }));
        break;
      case "notes":
        isComplete = value.length > 0;
        setCompletionStatus((prev) => ({
          ...prev,
          [field]: isComplete,
        }));
        break;
      case "accords":
        isComplete = value.length > 0;
        setCompletionStatus((prev) => ({
          ...prev,
          [field]: isComplete,
        }));
        break;
      case "occasion":
        isComplete = value !== "";
        setCompletionStatus((prev) => ({
          ...prev,
          [field]: isComplete,
        }));
        break;
      case "photoUrl":
        // PhotoUrl is optional, so always consider it "complete"
        // Only mark as "truly complete" if there's actually a URL
        isComplete = value !== null && value !== "";
        setCompletionStatus((prev) => ({
          ...prev,
          photos: isComplete, // Keep the key as "photos" for backward compatibility
        }));
        break;
      default:
        break;
    }
  };
  const getNoteDisplayValue = (note) => {
    return typeof note === "object" && note.name ? note.name : note;
  };

  const getNoteCategory = (note) => {
    return typeof note === "object" && note.category
      ? note.category
      : "unspecified";
  };
  // Function to save the current section and move back to overview
  const saveCurrentSection = () => {
    // Additional validation could happen here
    setActiveTab(null);
  };

  // Check if the form is valid for submission
  const isFormValid = () => {
    // Basic info is required
    return formData.name && formData.brand && formData.category;
  };

  // Handle overall form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      // Show some error or focus on required fields
      alert("Please fill in the required fields (Name, Brand, and Category)");
      return;
    }

    // Call the onSubmit prop with the form data
    onSubmit(formData);
  };

  // Check if form has any content beyond basic info
  const hasAdditionalContent = () => {
    return (
      formData.description ||
      formData.tags.length > 0 ||
      formData.notes.length > 0 ||
      formData.accords.length > 0 ||
      formData.occasion !== "" ||
      formData.photoUrl ||
      Object.values(completionStatus).some((status) => status === true)
    );
  };

  // Animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  // Function to truncate text for the summary view
  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="max-w-3xl mx-auto bg-zinc-900 md:rounded-b-xl overflow-hidden shadow-xl relative">
      <div className="bg-gradient-to-r from-zinc-800 to-zinc-800/90 px-4 sticky top-0 z-10 flex items-center justify-between py-2">
        {activeTab && (
          <button
            type="button"
            onClick={saveCurrentSection}
            className="text-orange-600 font-bold hover:scale-[1.1] p-1 rounded-md cursor-pointer flex items-center bg-orange-300 tracking-wide uppercase transition-transform"
          >
            <X className="stroke-4 mr-1" size={18} /> Close section
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="px-4 py-4">
          {/* Basic Info Section - Always visible */}
          <div className={activeTab ? "hidden" : "mb-4"}>
            <BasicInfo
              name={formData.name}
              brand={formData.brand}
              category={formData.category}
              description={formData.description}
              updateFormData={updateFormData}
            />
          </div>

          {/* Active Section Content */}
          <AnimatePresence mode="wait">
            {activeTab === "tags" && (
              <motion.div
                key="tags-section"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <TagsInput
                  tags={formData.tags}
                  updateFormData={updateFormData}
                />
              </motion.div>
            )}

            {activeTab === "notes" && (
              <motion.div
                key="notes-section"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <NotesSelect
                  notes={formData.notes}
                  updateFormData={updateFormData}
                />
              </motion.div>
            )}

            {activeTab === "accords" && (
              <motion.div
                key="accords-section"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <AccordsSelect
                  accords={formData.accords}
                  updateFormData={updateFormData}
                />
              </motion.div>
            )}

            {activeTab === "ratings" && (
              <motion.div
                key="ratings-section"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <RatingSliders
                  ratings={formData.ratings}
                  updateNestedFormData={updateNestedFormData}
                />
              </motion.div>
            )}

            {activeTab === "seasons" && (
              <motion.div
                key="seasons-section"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <SeasonSliders
                  seasons={formData.seasons}
                  updateNestedFormData={updateNestedFormData}
                />
              </motion.div>
            )}

            {activeTab === "dayNight" && (
              <motion.div
                key="daynight-section"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <NightSlider
                  dayNight={formData.dayNight}
                  updateFormData={updateFormData}
                />
              </motion.div>
            )}

            {activeTab === "occasion" && (
              <motion.div
                key="occasion-section"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <OccasionSelect
                  occasion={formData.occasion}
                  updateFormData={updateFormData}
                />
              </motion.div>
            )}

            {activeTab === "photos" && (
              <motion.div
                key="photos-section"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <PhotoUpload
                  photoUrl={formData.photoUrl}
                  updateFormData={updateFormData}
                />
              </motion.div>
            )}

            {/* Show summary when no tab is active */}
            {!activeTab && hasAdditionalContent() && (
              <motion.div
                key="summary"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-2 p-3 bg-zinc-800/80 rounded-lg border border-zinc-700"
              >
                {/* Description Summary */}
                {formData.description && (
                  <div className="mb-3 p-2 bg-zinc-800/70 border border-zinc-700/50 rounded-md">
                    <div className="flex items-center text-zinc-300 mb-1 font-medium">
                      <AlignLeft size={12} className="mr-1 text-orange-400" />
                      <span className="truncate">Description</span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {truncateText(formData.description)}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Tags */}
                  {formData.tags.length > 0 && (
                    <div className="rounded-md p-2 bg-zinc-800/70 border border-zinc-700/50">
                      <div className="flex items-center text-zinc-300 mb-1 font-medium">
                        <Tag size={12} className="mr-1 text-orange-400" />
                        <span className="truncate">
                          Tags ({formData.tags.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {formData.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full truncate"
                          >
                            {tag}
                          </span>
                        ))}
                        {formData.tags.length > 3 && (
                          <span className="text-xs bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded-full">
                            +{formData.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {formData.notes.length > 0 && (
                    <div className="rounded-md p-2 bg-zinc-800/70 border border-zinc-700/50">
                      <div className="flex items-center text-zinc-300 mb-1 font-medium">
                        <Droplets size={12} className="mr-1 text-blue-400" />
                        <span className="truncate">
                          Notes ({formData.notes.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {formData.notes.slice(0, 3).map((note, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full truncate"
                          >
                            {getNoteDisplayValue(note)}
                          </span>
                        ))}
                        {formData.notes.length > 3 && (
                          <span className="text-xs bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded-full">
                            +{formData.notes.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Accords */}
                  {formData.accords.length > 0 && (
                    <div className="rounded-md p-2 bg-zinc-800/70 border border-zinc-700/50">
                      <div className="flex items-center text-zinc-300 mb-1 font-medium">
                        <Sparkles size={12} className="mr-1 text-purple-400" />
                        <span className="truncate">
                          Accords ({formData.accords.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {formData.accords.slice(0, 3).map((accord, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full truncate"
                          >
                            {accord}
                          </span>
                        ))}
                        {formData.accords.length > 3 && (
                          <span className="text-xs bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded-full">
                            +{formData.accords.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Occasion */}
                  {formData.occasion && (
                    <div className="rounded-md p-2 bg-zinc-800/70 border border-zinc-700/50">
                      <div className="flex items-center text-zinc-300 mb-1 font-medium">
                        <CalendarDays
                          size={12}
                          className="mr-1 text-pink-400"
                        />
                        <span className="truncate">Occasion</span>
                      </div>
                      <span className="text-xs bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded-full">
                        {formData.occasion}
                      </span>
                    </div>
                  )}
                </div>

                {/* Photos preview */}
                {formData.photoUrl && (
                  <div className="mt-2 rounded-md p-2 bg-zinc-800/70 border border-zinc-700/50">
                    <div className="flex items-center text-zinc-300 mb-1 font-medium">
                      <Image size={12} className="mr-1 text-cyan-400" />
                      <span className="truncate">Photos</span>
                    </div>
                    <div className="flex gap-1 overflow-x-auto pb-1">
                      {formData.photos.slice(0, 4).map((photo, idx) => (
                        <img
                          key={idx}
                          src={URL.createObjectURL(photo)}
                          alt={`Fragrance photo ${idx + 1}`}
                          className="w-10 h-10 rounded-md border border-zinc-600 object-cover flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab button navigation */}
        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900 via-zinc-900 to-zinc-900/95 border-t border-zinc-700 p-3 z-20">
          {activeTab ? (
            <div className="flex">
              <motion.button
                type="button"
                onClick={saveCurrentSection}
                className="flex-1 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 text-sm shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="mr-2 h-4 w-4" />
                Save {tabs.find((tab) => tab.id === activeTab)?.label}
              </motion.button>
            </div>
          ) : (
            <>
              {/* Tabs row - using flex-wrap instead of scrollbar */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1.5">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        // Mark this section as interacted with
                        if (
                          ["ratings", "seasons", "dayNight"].includes(tab.id)
                        ) {
                          setInteractionState((prev) => ({
                            ...prev,
                            [tab.id]: true,
                          }));
                        }
                      }}
                      className={`flex items-center px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 
                        cursor-pointer hover:bg-zinc-700 ${
                          completionStatus[tab.id]
                            ? (["ratings", "seasons", "dayNight"].includes(
                                tab.id
                              )
                                ? interactionState[tab.id]
                                  ? tab.color
                                  : "text-zinc-400"
                                : tab.color) +
                              " bg-zinc-800/80 border border-zinc-700"
                            : "text-zinc-400 bg-zinc-800/50 border border-zinc-700"
                        }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="mr-1">{tab.icon}</span>
                      {tab.label}
                      {completionStatus[tab.id] &&
                        (["ratings", "seasons", "dayNight"].includes(tab.id)
                          ? interactionState[tab.id]
                          : true) && (
                          <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={!isFormValid()}
                className={`w-full py-2 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg
                  ${
                    isFormValid()
                      ? "bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white cursor-pointer"
                      : "bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-400 cursor-not-allowed"
                  }
                  font-medium text-sm`}
                whileHover={isFormValid() ? { scale: 1.02 } : {}}
                whileTap={isFormValid() ? { scale: 0.98 } : {}}
              >
                <Send className="mr-2 h-4 w-4" />
                {hasAdditionalContent()
                  ? "Share Your Fragrance"
                  : "Share Fragrance"}
              </motion.button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
