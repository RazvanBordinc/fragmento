/** @format */

/**
 * Data mapping utilities for Fragmento
 * These functions help map between API responses and frontend component data structures
 */

/**
 * Map an API Post response to the structure expected by frontend components
 * @param {Object} apiPost - Post data from the API
 * @param {Object} currentUser - Current user information
 * @returns {Object} - Mapped post data for frontend
 */
/**
 * Map an API Post response to the structure expected by frontend components
 * @param {Object} apiPost - Post data from the API
 * @param {Object} currentUser - Current user information
 * @returns {Object} - Mapped post data for frontend
 */
export const mapApiPostToComponentPost = (apiPost, currentUser = null) => {
  if (!apiPost) return null;

  // Log the raw API post for debugging
  console.log("Mapping API post to component format:", apiPost);

  // Extract properties with fallbacks for both camelCase and PascalCase API responses
  const post = {
    id: apiPost.id || apiPost.Id || "",
    createdAt:
      apiPost.createdAt || apiPost.CreatedAt || new Date().toISOString(),
    updatedAt: apiPost.updatedAt || apiPost.UpdatedAt || null,
    user: {
      id: apiPost.user?.id || apiPost.User?.Id || "",
      username: apiPost.user?.username || apiPost.User?.Username || "unknown",
      profilePictureUrl:
        apiPost.user?.profilePictureUrl ||
        apiPost.User?.ProfilePictureUrl ||
        null,
    },
    fragrance: {
      id: apiPost.fragrance?.id || apiPost.Fragrance?.Id || "",
      name: apiPost.fragrance?.name || apiPost.Fragrance?.Name || "",
      brand: apiPost.fragrance?.brand || apiPost.Fragrance?.Brand || "",
      category:
        apiPost.fragrance?.category || apiPost.Fragrance?.Category || "",
      description:
        apiPost.fragrance?.description || apiPost.Fragrance?.Description || "",
      photo: apiPost.fragrance?.photoUrl || apiPost.Fragrance?.PhotoUrl || null,
      photoUrl:
        apiPost.fragrance?.photoUrl ||
        apiPost.Fragrance?.PhotoUrl ||
        "/images/fragrance-placeholder.jpg", // Add fallback
      tags: apiPost.fragrance?.tags || apiPost.Fragrance?.Tags || [],
      notes: apiPost.fragrance?.notes || apiPost.Fragrance?.Notes || [],
      accords: apiPost.fragrance?.accords || apiPost.Fragrance?.Accords || [],
      occasion:
        apiPost.fragrance?.occasion || apiPost.Fragrance?.Occasion || null,
      dayNight:
        apiPost.fragrance?.dayNightPreference ||
        apiPost.Fragrance?.DayNightPreference ||
        50,
      ratings: {
        overall:
          apiPost.fragrance?.ratings?.overall ||
          apiPost.Fragrance?.Ratings?.Overall ||
          5,
        longevity:
          apiPost.fragrance?.ratings?.longevity ||
          apiPost.Fragrance?.Ratings?.Longevity ||
          5,
        sillage:
          apiPost.fragrance?.ratings?.sillage ||
          apiPost.Fragrance?.Ratings?.Sillage ||
          5,
        scent:
          apiPost.fragrance?.ratings?.scent ||
          apiPost.Fragrance?.Ratings?.Scent ||
          5,
        value:
          apiPost.fragrance?.ratings?.value ||
          apiPost.Fragrance?.Ratings?.Value ||
          5,
      },
      seasons: {
        spring:
          apiPost.fragrance?.seasons?.spring ||
          apiPost.Fragrance?.Seasons?.Spring ||
          3,
        summer:
          apiPost.fragrance?.seasons?.summer ||
          apiPost.Fragrance?.Seasons?.Summer ||
          3,
        fall:
          apiPost.fragrance?.seasons?.fall ||
          apiPost.Fragrance?.Seasons?.Fall ||
          3,
        winter:
          apiPost.fragrance?.seasons?.winter ||
          apiPost.Fragrance?.Seasons?.Winter ||
          3,
      },
    },
    likesCount: apiPost.likesCount || apiPost.LikesCount || 0,
    commentsCount: apiPost.commentsCount || apiPost.CommentsCount || 0,
    isLiked: apiPost.isLiked || apiPost.IsLiked || false,
    isSaved: apiPost.isSaved || apiPost.IsSaved || false,
    // Map comments if they exist
    comments: Array.isArray(apiPost.comments || apiPost.Comments)
      ? (apiPost.comments || apiPost.Comments).map((comment) =>
          mapApiCommentToComponentComment(comment, currentUser)
        )
      : [],
  };

  // Log the mapped post for verification
  console.log("Mapped post:", { id: post.id, name: post.fragrance.name });

  return post;
};

/**
 * Map an API Comment response to the structure expected by frontend components
 * @param {Object} apiComment - Comment data from the API
 * @param {Object} currentUser - Current user information
 * @returns {Object} - Mapped comment data for frontend
 */
export const mapApiCommentToComponentComment = (
  apiComment,
  currentUser = null
) => {
  if (!apiComment) return null;

  const comment = {
    id: apiComment.id || apiComment.Id || "",
    text: apiComment.text || apiComment.Text || "",
    createdAt:
      apiComment.createdAt || apiComment.CreatedAt || new Date().toISOString(),
    updatedAt: apiComment.updatedAt || apiComment.UpdatedAt || null,
    userId:
      apiComment.user?.id ||
      apiComment.User?.Id ||
      apiComment.userId ||
      apiComment.UserId ||
      "",
    username:
      apiComment.user?.username || apiComment.User?.Username || "unknown",
    profilePic:
      apiComment.user?.profilePictureUrl ||
      apiComment.User?.ProfilePictureUrl ||
      null,
    user: {
      id: apiComment.user?.id || apiComment.User?.Id || "",
      username:
        apiComment.user?.username || apiComment.User?.Username || "unknown",
      profilePictureUrl:
        apiComment.user?.profilePictureUrl ||
        apiComment.User?.ProfilePictureUrl ||
        null,
    },
    likesCount: apiComment.likesCount || apiComment.LikesCount || 0,
    repliesCount: apiComment.repliesCount || apiComment.RepliesCount || 0,
    isLiked:
      apiComment.isLikedByCurrentUser ||
      apiComment.IsLikedByCurrentUser ||
      false,
    canEdit: apiComment.canEdit || apiComment.CanEdit || false,
    canDelete: apiComment.canDelete || apiComment.CanDelete || false,

    // If current user ID matches the comment user ID, they can edit/delete
    isOwner:
      currentUser &&
      currentUser.id ===
        (apiComment.user?.id ||
          apiComment.User?.Id ||
          apiComment.userId ||
          apiComment.UserId),

    // Map nested replies if they exist
    replies: Array.isArray(apiComment.replies || apiComment.Replies)
      ? (apiComment.replies || apiComment.Replies).map((reply) =>
          mapApiCommentToComponentComment(reply, currentUser)
        )
      : [],
  };

  return comment;
};

/**
 * Map component post data to the structure expected by the API for creation/updates
 * @param {Object} componentPost - Post data from frontend components
 * @returns {Object} - Mapped post data for API
 */
export const mapComponentPostToApiPost = (componentPost) => {
  if (!componentPost) return null;

  // Ensure all required fields exist
  const apiPost = {
    name: componentPost.name || componentPost.fragrance?.name || "",
    brand: componentPost.brand || componentPost.fragrance?.brand || "",
    category: componentPost.category || componentPost.fragrance?.category || "",
    description:
      componentPost.description || componentPost.fragrance?.description || "",
    occasion:
      componentPost.occasion || componentPost.fragrance?.occasion || null,
    photoUrl:
      componentPost.photoUrl || componentPost.fragrance?.photoUrl || null,
    dayNightPreference:
      componentPost.dayNight || componentPost.fragrance?.dayNight || 50,
    tags: componentPost.tags || componentPost.fragrance?.tags || [],

    // Map notes to proper format
    notes: (componentPost.notes || componentPost.fragrance?.notes || []).map(
      (note) => {
        if (typeof note === "string") {
          return { name: note, category: "unspecified" };
        }
        return note;
      }
    ),

    accords: componentPost.accords || componentPost.fragrance?.accords || [],

    // Map ratings to proper format
    ratings: {
      overall:
        componentPost.ratings?.overall ||
        componentPost.fragrance?.ratings?.overall ||
        5,
      longevity:
        componentPost.ratings?.longevity ||
        componentPost.fragrance?.ratings?.longevity ||
        5,
      sillage:
        componentPost.ratings?.sillage ||
        componentPost.fragrance?.ratings?.sillage ||
        5,
      scent:
        componentPost.ratings?.scent ||
        componentPost.fragrance?.ratings?.scent ||
        5,
      value:
        componentPost.ratings?.valueForMoney ||
        componentPost.ratings?.value ||
        componentPost.fragrance?.ratings?.value ||
        5,
    },

    // Map seasons to proper format
    seasons: {
      spring:
        componentPost.seasons?.spring ||
        componentPost.fragrance?.seasons?.spring ||
        3,
      summer:
        componentPost.seasons?.summer ||
        componentPost.fragrance?.seasons?.summer ||
        3,
      fall:
        componentPost.seasons?.autumn ||
        componentPost.seasons?.fall ||
        componentPost.fragrance?.seasons?.fall ||
        3,
      winter:
        componentPost.seasons?.winter ||
        componentPost.fragrance?.seasons?.winter ||
        3,
    },
  };

  return apiPost;
};
