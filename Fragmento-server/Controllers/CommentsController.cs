using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Fragmento_server.Data;
using Fragmento_server.Models.DTOs.Requests;
using Fragmento_server.Models.DTOs.Responses;
using Fragmento_server.Models.Entities;
using Fragmento_server.Models.Entities.Fragmento_server.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Fragmento_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly FragmentoDbContext _context;
        private readonly ILogger<CommentsController> _logger;

        public CommentsController(
            FragmentoDbContext context,
            ILogger<CommentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/comments/post/{postId}
        [HttpGet("post/{postId}")]
        [EnableRateLimiting("default")]
        public async Task<ActionResult<CommentPaginatedResponse>> GetComments(
            Guid postId,
            [FromQuery] GetCommentsRequest request)
        {
            _logger.LogInformation($"Getting comments for post {postId}, page {request.Page}");

            // Validate post exists
            var postExists = await _context.Posts.AnyAsync(p => p.Id == postId);
            if (!postExists)
            {
                _logger.LogWarning($"Post {postId} not found");
                return NotFound(new { message = "Post not found" });
            }

            // Normalize page and pageSize
            if (request.Page < 1) request.Page = 1;
            if (request.PageSize < 1) request.PageSize = 10;
            if (request.PageSize > 50) request.PageSize = 50; // Maximum page size

            // Get comments query - we'll load top-level comments first
            var commentsQuery = _context.Comments
                .Include(c => c.User)
                .Include(c => c.Likes)
                .Where(c => c.PostId == postId);

            // Apply filter for top-level comments only if requested
            if (request.OnlyTopLevel)
            {
                commentsQuery = commentsQuery.Where(c => c.ParentCommentId == null);
            }

            // Apply sorting
            commentsQuery = request.SortBy.ToLower() switch
            {
                "likes" => request.Descending
                    ? commentsQuery.OrderByDescending(c => c.Likes.Count)
                    : commentsQuery.OrderBy(c => c.Likes.Count),
                _ => request.Descending
                    ? commentsQuery.OrderByDescending(c => c.CreatedAt)
                    : commentsQuery.OrderBy(c => c.CreatedAt)
            };

            // Get total count for pagination
            var totalComments = await commentsQuery.CountAsync();
            var totalPages = (int)Math.Ceiling(totalComments / (double)request.PageSize);

            // Apply pagination and fetch the comments
            var comments = await commentsQuery
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            // Get current user ID if authenticated
            Guid? currentUserId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            }

            // Now load direct replies for these comments in a separate query
            var commentIds = comments.Select(c => c.Id).ToList();
            var directReplies = await _context.Comments
                .Include(r => r.User)
                .Include(r => r.Likes)
                .Where(r => r.ParentCommentId != null && commentIds.Contains(r.ParentCommentId.Value))
                .ToListAsync();

            // Group replies by parent comment ID for easier mapping
            var repliesByParent = directReplies.GroupBy(r => r.ParentCommentId.Value)
                .ToDictionary(g => g.Key, g => g.ToList());

            // Map to response using our helper method
            var commentResponses = comments.Select(c =>
            {
                var response = MapToCommentDetailResponse(c, currentUserId);

                // Manually add first-level replies since we loaded them separately
                if (repliesByParent.TryGetValue(c.Id, out var replies))
                {
                    response.Replies = replies
                        .OrderByDescending(r => r.CreatedAt)
                        .Select(r => MapToCommentResponse(r, currentUserId))
                        .ToList();
                }

                return response;
            }).ToList();

            var response = new CommentPaginatedResponse
            {
                Comments = commentResponses,
                TotalComments = totalComments,
                CurrentPage = request.Page,
                TotalPages = totalPages,
                HasPreviousPage = request.Page > 1,
                HasNextPage = request.Page < totalPages
            };

            return Ok(response);
        }

        // GET: api/comments/{commentId}/replies
        [HttpGet("{commentId}/replies")]
        [EnableRateLimiting("default")]
        public async Task<ActionResult<CommentPaginatedResponse>> GetReplies(
            Guid commentId,
            [FromQuery] GetCommentsRequest request)
        {
            _logger.LogInformation($"Getting replies for comment {commentId}, page {request.Page}");

            // Validate comment exists
            var comment = await _context.Comments
                .Include(c => c.Post)
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
            {
                _logger.LogWarning($"Comment {commentId} not found");
                return NotFound(new { message = "Comment not found" });
            }

            // Normalize page and pageSize
            if (request.Page < 1) request.Page = 1;
            if (request.PageSize < 1) request.PageSize = 10;
            if (request.PageSize > 50) request.PageSize = 50; // Maximum page size

            // Get replies query - direct replies to this comment
            var repliesQuery = _context.Comments
                .Include(c => c.User)
                .Include(c => c.Likes)
                .Where(c => c.ParentCommentId == commentId);

            // Apply sorting
            repliesQuery = request.SortBy.ToLower() switch
            {
                "likes" => request.Descending
                    ? repliesQuery.OrderByDescending(c => c.Likes.Count)
                    : repliesQuery.OrderBy(c => c.Likes.Count),
                _ => request.Descending
                    ? repliesQuery.OrderByDescending(c => c.CreatedAt)
                    : repliesQuery.OrderBy(c => c.CreatedAt)
            };

            // Get total count for pagination
            var totalReplies = await repliesQuery.CountAsync();
            var totalPages = (int)Math.Ceiling(totalReplies / (double)request.PageSize);

            // Apply pagination and fetch the replies
            var replies = await repliesQuery
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            // Get current user ID if authenticated
            Guid? currentUserId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            }

            // Now load next-level replies for these comments
            var replyIds = replies.Select(r => r.Id).ToList();
            var nestedReplies = await _context.Comments
                .Include(r => r.User)
                .Include(r => r.Likes)
                .Where(r => r.ParentCommentId != null && replyIds.Contains(r.ParentCommentId.Value))
                .ToListAsync();

            // Group nested replies by parent comment ID
            var nestedRepliesByParent = nestedReplies.GroupBy(r => r.ParentCommentId.Value)
                .ToDictionary(g => g.Key, g => g.ToList());

            // Map replies to response format with proper nesting
            var replyResponses = replies.Select(r =>
            {
                var response = MapToCommentDetailResponse(r, currentUserId);

                // Manually add next-level replies
                if (nestedRepliesByParent.TryGetValue(r.Id, out var childReplies))
                {
                    response.Replies = childReplies
                        .OrderByDescending(nr => nr.CreatedAt)
                        .Select(nr => MapToCommentResponse(nr, currentUserId))
                        .ToList();
                }

                return response;
            }).ToList();

            var response = new CommentPaginatedResponse
            {
                Comments = replyResponses,
                TotalComments = totalReplies,
                CurrentPage = request.Page,
                TotalPages = totalPages,
                HasPreviousPage = request.Page > 1,
                HasNextPage = request.Page < totalPages
            };

            return Ok(response);
        }

        // Helper method to map comments to detail responses
        private CommentDetailResponse MapToCommentDetailResponse(Comment comment, Guid? currentUserId)
        {
            if (comment == null) return null;

            // Check if the current user has liked this comment
            bool isLiked = currentUserId.HasValue && comment.Likes.Any(l => l.UserId == currentUserId.Value);

            return new CommentDetailResponse
            {
                Id = comment.Id.ToString(),
                User = new UserBriefResponse
                {
                    Id = comment.User.Id.ToString(),
                    Username = comment.User.Username,
                    ProfilePictureUrl = comment.User.ProfilePictureUrl
                },
                Text = comment.Text,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                LikesCount = comment.Likes.Count,
                RepliesCount = comment.Replies.Count,
                IsLikedByCurrentUser = isLiked,
                IsLiked = isLiked, // Set both properties to the same value
                CanEdit = currentUserId.HasValue && comment.UserId == currentUserId.Value,
                CanDelete = currentUserId.HasValue && comment.UserId == currentUserId.Value,
                Replies = new List<CommentResponse>() // Initialize with empty list, will be filled separately
            };
        }

        // Helper method to map comments to responses
        private CommentResponse MapToCommentResponse(Comment comment, Guid? currentUserId)
        {
            if (comment == null) return null;

            // Check if the current user has liked this comment
            bool isLiked = currentUserId.HasValue && comment.Likes.Any(l => l.UserId == currentUserId.Value);

            return new CommentResponse
            {
                Id = comment.Id.ToString(),
                User = new UserBriefResponse
                {
                    Id = comment.User.Id.ToString(),
                    Username = comment.User.Username,
                    ProfilePictureUrl = comment.User.ProfilePictureUrl
                },
                Text = comment.Text,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                LikesCount = comment.Likes.Count,
                RepliesCount = comment.Replies.Count,
                IsLiked = isLiked, // Set both properties
                IsLikedByCurrentUser = isLiked, // Set both properties for consistency
                IsOwner = currentUserId.HasValue && comment.UserId == currentUserId.Value,
                Replies = new List<CommentResponse>() // Initialize with empty list
            };
        }

        // POST: api/comments
        [HttpPost]
        [Authorize]
        [EnableRateLimiting("comments")]
        public async Task<ActionResult<CommentDetailResponse>> CreateComment(CreateCommentRequest request)
        {
            _logger.LogInformation("Creating a new comment");

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for comment creation");
                return BadRequest(ModelState);
            }

            // Get current user
            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            // Validate post exists
            var post = await _context.Posts.FindAsync(request.PostId);
            if (post == null)
            {
                _logger.LogWarning($"Post {request.PostId} not found");
                return NotFound(new { message = "Post not found" });
            }

            // If it's a reply, validate parent comment exists and belongs to the same post
            if (request.ParentCommentId.HasValue)
            {
                var parentComment = await _context.Comments.FindAsync(request.ParentCommentId.Value);
                if (parentComment == null)
                {
                    _logger.LogWarning($"Parent comment {request.ParentCommentId} not found");
                    return NotFound(new { message = "Parent comment not found" });
                }

                if (parentComment.PostId != request.PostId)
                {
                    _logger.LogWarning($"Parent comment {request.ParentCommentId} does not belong to post {request.PostId}");
                    return BadRequest(new { message = "Parent comment does not belong to the specified post" });
                }
            }

            // Create comment
            var comment = new Comment
            {
                PostId = request.PostId,
                UserId = currentUserId,
                Text = request.Text,
                ParentCommentId = request.ParentCommentId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);

            // Create notification for post owner if comment is not from post owner
            if (post.UserId != currentUserId)
            {
                var notification = new Notification
                {
                    UserId = post.UserId,
                    ActorId = currentUserId,
                    Type = "comment",
                    PostId = post.Id,
                    CommentId = comment.Id,
                    Content = new NotificationContent
                    {
                        Action = request.ParentCommentId.HasValue ? "replied to a comment on your post" : "commented on your post",
                        PostTitle = post.Fragrance.Name,
                        CommentText = comment.Text.Length > 100 ? comment.Text.Substring(0, 97) + "..." : comment.Text
                    }
                };

                _context.Notifications.Add(notification);
            }

            // Create notification for parent comment owner if different from current user and post owner
            if (request.ParentCommentId.HasValue)
            {
                var parentComment = await _context.Comments
                    .Include(c => c.User)
                    .FirstOrDefaultAsync(c => c.Id == request.ParentCommentId.Value);

                if (parentComment != null && parentComment.UserId != currentUserId && parentComment.UserId != post.UserId)
                {
                    var replyNotification = new Notification
                    {
                        UserId = parentComment.UserId,
                        ActorId = currentUserId,
                        Type = "comment",
                        PostId = post.Id,
                        CommentId = comment.Id,
                        Content = new NotificationContent
                        {
                            Action = "replied to your comment",
                            PostTitle = post.Fragrance.Name,
                            CommentText = comment.Text.Length > 100 ? comment.Text.Substring(0, 97) + "..." : comment.Text
                        }
                    };

                    _context.Notifications.Add(replyNotification);
                }
            }

            await _context.SaveChangesAsync();

            // Get user data for response
            var user = await _context.Users.FindAsync(currentUserId);

            var response = new CommentDetailResponse
            {
                Id = comment.Id.ToString(),
                User = new UserBriefResponse
                {
                    Id = user.Id.ToString(),
                    Username = user.Username,
                    ProfilePictureUrl = user.ProfilePictureUrl
                },
                Text = comment.Text,
                CreatedAt = comment.CreatedAt,
                LikesCount = 0,
                RepliesCount = 0,
                IsLikedByCurrentUser = false, // You can't like your own just-created comment
                IsLiked = false, // Set both properties
                CanEdit = true, // You can edit your own comment
                CanDelete = true, // You can delete your own comment
                Replies = new List<CommentResponse>() // Initialize with empty list
            };

            _logger.LogInformation($"Comment created successfully with ID: {comment.Id}");
            return CreatedAtAction(nameof(GetComments), new { postId = request.PostId }, response);
        }

        // PUT: api/comments/{id}
        [HttpPut("{id}")]
        [Authorize]
        [EnableRateLimiting("comments")]
        public async Task<IActionResult> UpdateComment(Guid id, UpdateCommentRequest request)
        {
            _logger.LogInformation($"Updating comment {id}");

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for comment update");
                return BadRequest(ModelState);
            }

            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
            {
                _logger.LogWarning($"Comment {id} not found");
                return NotFound(new { message = "Comment not found" });
            }

            // Check if user owns the comment
            if (comment.UserId != currentUserId)
            {
                _logger.LogWarning($"User {currentUserId} tried to update comment {id} that belongs to user {comment.UserId}");
                return Forbid("You do not have permission to edit this comment");
            }

            // Update comment
            comment.Text = request.Text;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Comment {id} updated successfully");
            return Ok(new { message = "Comment updated successfully" });
        }

        // DELETE: api/comments/{id}
        [HttpDelete("{id}")]
        [Authorize]
        [EnableRateLimiting("comments")]
        public async Task<IActionResult> DeleteComment(Guid id)
        {
            _logger.LogInformation($"Deleting comment {id}");

            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            // Use separate queries to avoid issues with entity tracking
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
            {
                _logger.LogWarning($"Comment {id} not found");
                return NotFound(new { message = "Comment not found" });
            }

            // Check if user owns the comment
            if (comment.UserId != currentUserId)
            {
                _logger.LogWarning($"User {currentUserId} tried to delete comment {id} that belongs to user {comment.UserId}");
                return Forbid("You do not have permission to delete this comment");
            }

            // Find all replies to this comment
            var replies = await _context.Comments
                .Where(c => c.ParentCommentId == id)
                .ToListAsync();

            // Update replies to be top-level comments (parent removed)
            foreach (var reply in replies)
            {
                reply.ParentCommentId = null;
                _context.Comments.Update(reply);
            }

            // Delete related entities
            var commentLikes = await _context.CommentLikes
                .Where(cl => cl.CommentId == id)
                .ToListAsync();
            _context.CommentLikes.RemoveRange(commentLikes);

            // Delete notifications related to this comment
            var notifications = await _context.Notifications
                .Where(n => n.CommentId == id)
                .ToListAsync();
            _context.Notifications.RemoveRange(notifications);

            // Remove the comment
            _context.Comments.Remove(comment);

            // Save all changes
            var saveResult = await _context.SaveChangesAsync();

            _logger.LogInformation($"Comment {id} deleted successfully. SaveChanges result: {saveResult}");
            return Ok(new { message = "Comment deleted successfully", affectedRecords = saveResult });
        }

        // POST: api/comments/{id}/like
        [HttpPost("{id}/like")]
        [Authorize]
        [EnableRateLimiting("likes")]
        public async Task<IActionResult> LikeComment(Guid id)
        {
            _logger.LogInformation($"Liking comment {id}");

            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var comment = await _context.Comments
                .Include(c => c.Post)
                .Include(c => c.Likes) // Important: Include likes to check if already liked
                .FirstOrDefaultAsync(c => c.Id == id);

            if (comment == null)
            {
                _logger.LogWarning($"Comment {id} not found");
                return NotFound(new { message = "Comment not found" });
            }

            // Check if user already liked the comment
            var existingLike = comment.Likes.FirstOrDefault(l => l.UserId == currentUserId);

            if (existingLike != null)
            {
                _logger.LogWarning($"User {currentUserId} tried to like comment {id} but already liked it");
                return Conflict(new { message = "You already liked this comment", liked = true });
            }

            // Create like
            var like = new CommentLike
            {
                CommentId = id,
                UserId = currentUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.CommentLikes.Add(like);

            // Create notification for comment owner if different from current user
            if (comment.UserId != currentUserId)
            {
                var notification = new Notification
                {
                    UserId = comment.UserId,
                    ActorId = currentUserId,
                    Type = "like",
                    PostId = comment.PostId,
                    CommentId = comment.Id,
                    Content = new NotificationContent
                    {
                        Action = "liked your comment",
                        PostTitle = comment.Post?.Fragrance?.Name ?? "a post",
                        CommentText = comment.Text.Length > 100 ? comment.Text.Substring(0, 97) + "..." : comment.Text
                    }
                };

                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Comment {id} liked successfully by user {currentUserId}");
            return Ok(new { liked = true });
        }

        // DELETE: api/comments/{id}/like
        [HttpDelete("{id}/like")]
        [Authorize]
        [EnableRateLimiting("likes")]
        public async Task<IActionResult> UnlikeComment(Guid id)
        {
            _logger.LogInformation($"Unliking comment {id}");

            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            // Find the like directly
            var like = await _context.CommentLikes
                .FirstOrDefaultAsync(cl => cl.CommentId == id && cl.UserId == currentUserId);

            if (like == null)
            {
                _logger.LogWarning($"Like not found for comment {id} by user {currentUserId}");
                return NotFound(new { message = "Like not found", liked = false });
            }

            _context.CommentLikes.Remove(like);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Comment {id} unliked successfully by user {currentUserId}");
            return Ok(new { liked = false });
        }
    }
}