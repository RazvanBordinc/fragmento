using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Fragmento_server.Data;
using Fragmento_server.Models.Entities;
using Fragmento_server.Models.DTOs.Requests;
using Fragmento_server.Models.DTOs.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Fragmento_server.Models.Entities.Fragmento_server.Models.Entities;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.RateLimiting;

namespace Fragmento_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostsController : ControllerBase
    {
        private readonly FragmentoDbContext _context;
        private readonly ILogger<PostsController> _logger;

        public PostsController(
            FragmentoDbContext context,
            ILogger<PostsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/posts
        [HttpGet]
        [EnableRateLimiting("default")]
        public async Task<ActionResult<IEnumerable<PostResponse>>> GetPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                _logger.LogInformation("Fetching posts with page={Page}, pageSize={PageSize}", page, pageSize);

                // Validate pagination parameters
                if (page < 1)
                {
                    _logger.LogWarning("Invalid page number: {Page}", page);
                    return BadRequest("Page number must be greater than 0");
                }

                if (pageSize < 1 || pageSize > 50)
                {
                    _logger.LogWarning("Invalid page size: {PageSize}", pageSize);
                    return BadRequest("Page size must be between 1 and 50");
                }

                // Calculate skip for pagination
                int skip = (page - 1) * pageSize;

                // Make sure to properly include all related entities
                var postsQuery = _context.Posts
                    .Include(p => p.User)
                    .Include(p => p.Likes)
                    .Include(p => p.Comments.Where(c => c.ParentCommentId == null).OrderByDescending(c => c.CreatedAt).Take(3))
                        .ThenInclude(c => c.User)
                    .Include(p => p.Comments.Where(c => c.ParentCommentId == null).OrderByDescending(c => c.CreatedAt).Take(3))
                        .ThenInclude(c => c.Likes)
                    .AsSplitQuery(); // Use split queries for better performance with multiple includes

                // Apply ordering, pagination, then fetch
                var posts = await postsQuery
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} posts", posts.Count);

                // Second pass to load Fragrance related entities for each post since they have a separate relationship
                foreach (var post in posts)
                {
                    if (post.Fragrance == null)
                    {
                        _logger.LogWarning($"Post {post.Id} has null Fragrance - attempting to fix");

                        // Find the fragrance explicitly by PostId since it's a one-to-one relationship
                        var fragrance = await _context.Fragrances
                            .Include(f => f.Tags)
                            .Include(f => f.Notes)
                            .Include(f => f.Accords)
                            .Include(f => f.Ratings)
                            .Include(f => f.Seasons)
                            .FirstOrDefaultAsync(f => f.PostId == post.Id);

                        if (fragrance != null)
                        {
                            post.Fragrance = fragrance;
                            _logger.LogInformation($"Found and loaded Fragrance for Post {post.Id}");
                        }
                        else
                        {
                            _logger.LogError($"Could not find Fragrance for Post {post.Id}");
                        }
                    }
                    else
                    {
                        // Ensure the related entities of Fragrance are loaded
                        if (!_context.Entry(post.Fragrance).Collection(f => f.Tags).IsLoaded)
                        {
                            await _context.Entry(post.Fragrance).Collection(f => f.Tags).LoadAsync();
                        }

                        if (!_context.Entry(post.Fragrance).Collection(f => f.Notes).IsLoaded)
                        {
                            await _context.Entry(post.Fragrance).Collection(f => f.Notes).LoadAsync();
                        }

                        if (!_context.Entry(post.Fragrance).Collection(f => f.Accords).IsLoaded)
                        {
                            await _context.Entry(post.Fragrance).Collection(f => f.Accords).LoadAsync();
                        }

                        if (!_context.Entry(post.Fragrance).Reference(f => f.Ratings).IsLoaded)
                        {
                            await _context.Entry(post.Fragrance).Reference(f => f.Ratings).LoadAsync();

                            // If Ratings is still null, create a default one
                            if (post.Fragrance.Ratings == null)
                            {
                                post.Fragrance.Ratings = new FragranceRatings
                                {
                                    FragranceId = post.Fragrance.Id,
                                    Overall = 5,
                                    Longevity = 5,
                                    Sillage = 5,
                                    Scent = 5,
                                    Value = 5
                                };
                            }
                        }

                        if (!_context.Entry(post.Fragrance).Reference(f => f.Seasons).IsLoaded)
                        {
                            await _context.Entry(post.Fragrance).Reference(f => f.Seasons).LoadAsync();

                            // If Seasons is still null, create a default one
                            if (post.Fragrance.Seasons == null)
                            {
                                post.Fragrance.Seasons = new FragranceSeasons
                                {
                                    FragranceId = post.Fragrance.Id,
                                    Spring = 3,
                                    Summer = 3,
                                    Fall = 3,
                                    Winter = 3
                                };
                            }
                        }
                    }
                }

                // Check for current user to determine if posts are liked/saved
                Guid? currentUserId = null;
                if (User.Identity.IsAuthenticated)
                {
                    currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                }

                // Transform to response DTOs with our improved mapping method
                var postResponses = posts
                    .Select(p => MapPostToResponse(p, currentUserId))
                    .Where(p => p != null) // Filter out any nulls that might result from mapping errors
                    .ToList();

                // Return with pagination metadata
                return Ok(new
                {
                    Posts = postResponses,
                    Pagination = new
                    {
                        CurrentPage = page,
                        PageSize = pageSize,
                        TotalCount = await _context.Posts.CountAsync(),
                        HasMore = posts.Count == pageSize
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching posts");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        // GET: api/posts/feed
        [HttpGet("feed")]
        [Authorize]
        [EnableRateLimiting("default")]
        public async Task<ActionResult<IEnumerable<PostResponse>>> GetFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                _logger.LogInformation("Fetching feed for user {UserId} with page={Page}, pageSize={PageSize}", currentUserId, page, pageSize);

                // Validate pagination parameters
                if (page < 1 || pageSize < 1 || pageSize > 50)
                {
                    return BadRequest("Invalid pagination parameters");
                }

                // Calculate skip for pagination
                int skip = (page - 1) * pageSize;

                // Get IDs of users the current user follows
                var followingIds = await _context.Follows
                    .Where(f => f.FollowerId == currentUserId)
                    .Select(f => f.FollowingId)
                    .ToListAsync();

                // Add current user's ID to include their own posts
                followingIds.Add(currentUserId);

                var posts = await _context.Posts
                    .Where(p => followingIds.Contains(p.UserId))
                    .Include(p => p.User)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Tags)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Notes)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Accords)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Ratings)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Seasons)
                    .Include(p => p.Likes)
                    .Include(p => p.Comments)
                        .ThenInclude(c => c.User)
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} posts for feed", posts.Count);

                // Transform to response DTOs
                var postResponses = posts.Select(p => MapPostToResponse(p, currentUserId)).ToList();

                // Return with pagination metadata
                return Ok(new
                {
                    Posts = postResponses,
                    Pagination = new
                    {
                        CurrentPage = page,
                        PageSize = pageSize,
                        HasMore = posts.Count == pageSize
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching feed for user {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        // GET: api/posts/discover
        [HttpGet("discover")]
        [EnableRateLimiting("default")]
        public async Task<ActionResult<IEnumerable<PostResponse>>> GetDiscover([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                _logger.LogInformation("Fetching discover page with page={Page}, pageSize={PageSize}", page, pageSize);

                // Validate pagination parameters
                if (page < 1 || pageSize < 1 || pageSize > 50)
                {
                    return BadRequest("Invalid pagination parameters");
                }

                // Calculate skip for pagination
                int skip = (page - 1) * pageSize;

                // For discover, we want popular posts - ones with most likes or comments
                var posts = await _context.Posts
                    .Include(p => p.User)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Tags)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Notes)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Accords)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Ratings)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Seasons)
                    .Include(p => p.Likes)
                    .Include(p => p.Comments)
                        .ThenInclude(c => c.User)
                    .OrderByDescending(p => p.Likes.Count + p.Comments.Count) // Order by engagement
                    .ThenByDescending(p => p.CreatedAt) // Secondary ordering by date
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                _logger.LogInformation("Retrieved {Count} posts for discover page", posts.Count);

                // Check for current user to determine if posts are liked/saved
                Guid? currentUserId = null;
                if (User.Identity.IsAuthenticated)
                {
                    currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                }

                // Transform to response DTOs
                var postResponses = posts.Select(p => MapPostToResponse(p, currentUserId)).ToList();

                // Return with pagination metadata
                return Ok(new
                {
                    Posts = postResponses,
                    Pagination = new
                    {
                        CurrentPage = page,
                        PageSize = pageSize,
                        HasMore = posts.Count == pageSize
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching discover page");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        // GET: api/posts/{id}
        [HttpGet("{id}")]
        [EnableRateLimiting("default")]
        public async Task<ActionResult<PostResponse>> GetPost(Guid id)
        {
            try
            {
                _logger.LogInformation("Fetching post with ID: {PostId}", id);

                var post = await _context.Posts
                    .Include(p => p.User)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Tags)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Notes)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Accords)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Ratings)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Seasons)
                    .Include(p => p.Likes)
                    .Include(p => p.Comments)
                        .ThenInclude(c => c.User)
                    .Include(p => p.Comments)
                        .ThenInclude(c => c.Likes)
                    .Include(p => p.Comments)
                        .ThenInclude(c => c.Replies)
                            .ThenInclude(r => r.User)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (post == null)
                {
                    _logger.LogWarning("Post with ID {PostId} not found", id);
                    return NotFound("Post not found");
                }

                _logger.LogInformation("Post with ID {PostId} retrieved successfully", id);

                // Check for current user to determine if post is liked/saved
                Guid? currentUserId = null;
                if (User.Identity.IsAuthenticated)
                {
                    currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                    // Increment view count if not the post creator
                    if (currentUserId != post.UserId)
                    {
                        // Here you could track post views if needed
                    }
                }

                // Map post to response
                var postResponse = MapPostToResponse(post, currentUserId, true);

                return Ok(postResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching post with ID {PostId}", id);
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        // POST: api/posts
        [HttpPost]
        [Authorize]
        [EnableRateLimiting("post_create")]
        public async Task<ActionResult<PostResponse>> CreatePost(CreatePostRequest request)
        {
            try
            {
                // Validate request
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid post creation request: {ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                // Validate key fields (only required ones)
                if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Brand) || string.IsNullOrEmpty(request.Category))
                {
                    _logger.LogWarning("Missing required fields for post creation");
                    return BadRequest("Name, brand, and category are required");
                }

                // Get current user from token claims
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                _logger.LogInformation("Creating new post for user {UserId}", currentUserId);

                try
                {
                    // Load the user to ensure it exists
                    var user = await _context.Users.FindAsync(currentUserId);
                    if (user == null)
                    {
                        _logger.LogError($"User {currentUserId} not found when creating post");
                        return NotFound("User not found");
                    }

                    // Create the post with all related entities
                    var post = new Post
                    {
                        Id = Guid.NewGuid(), // Explicitly set ID
                        UserId = currentUserId,
                        User = user, // Set the user navigation property
                        CreatedAt = DateTime.UtcNow,
                        Comments = new List<Comment>(),
                        Likes = new List<PostLike>()
                    };

                    // Create the fragrance with relationship to post
                    var fragrance = new Fragrance
                    {
                        Id = Guid.NewGuid(), // Explicitly set ID
                        PostId = post.Id, // Set the foreign key
                        Post = post, // Set the navigation property
                        Name = request.Name,
                        Brand = request.Brand,
                        Category = request.Category,
                        Description = request.Description, // Optional
                        Occasion = request.Occasion, // Optional
                        PhotoUrl = request.PhotoUrl, // Optional
                        DayNightPreference = request.DayNight ?? 50,
                        Tags = new List<FragranceTag>(),
                        Notes = new List<FragranceNote>(),
                        Accords = new List<FragranceAccord>()
                    };

                    // Set the fragrance on the post
                    post.Fragrance = fragrance;

                    // Create ratings for the fragrance
                    var ratings = new FragranceRatings
                    {
                        Id = Guid.NewGuid(),
                        FragranceId = fragrance.Id,
                        Fragrance = fragrance,
                        Overall = request.Ratings?.Overall ?? 5,
                        Longevity = request.Ratings?.Longevity ?? 5,
                        Sillage = request.Ratings?.Sillage ?? 5,
                        Scent = request.Ratings?.Scent ?? 5,
                        Value = request.Ratings?.Value ?? 5
                    };

                    // Create seasons for the fragrance
                    var seasons = new FragranceSeasons
                    {
                        Id = Guid.NewGuid(),
                        FragranceId = fragrance.Id,
                        Fragrance = fragrance,
                        Spring = request.Seasons?.Spring ?? 3,
                        Summer = request.Seasons?.Summer ?? 3,
                        Fall = request.Seasons?.Fall ?? 3,
                        Winter = request.Seasons?.Winter ?? 3
                    };

                    // Set the ratings and seasons on the fragrance
                    fragrance.Ratings = ratings;
                    fragrance.Seasons = seasons;

                    // Add tags if provided (safely handle null collections)
                    if (request.Tags != null && request.Tags.Any())
                    {
                        foreach (var tag in request.Tags)
                        {
                            if (!string.IsNullOrEmpty(tag))
                            {
                                fragrance.Tags.Add(new FragranceTag
                                {
                                    Id = Guid.NewGuid(),
                                    FragranceId = fragrance.Id,
                                    Fragrance = fragrance,
                                    Name = tag
                                });
                            }
                        }
                    }

                    // Add notes if provided (safely handle null collections)
                    if (request.Notes != null && request.Notes.Any())
                    {
                        int order = 0;
                        foreach (var note in request.Notes)
                        {
                            if (note != null && !string.IsNullOrEmpty(note.Name))
                            {
                                fragrance.Notes.Add(new FragranceNote
                                {
                                    Id = Guid.NewGuid(),
                                    FragranceId = fragrance.Id,
                                    Fragrance = fragrance,
                                    Name = note.Name,
                                    Category = note.Category ?? "unspecified",
                                    Order = order++
                                });
                            }
                        }
                    }

                    // Add accords if provided (safely handle null collections)
                    if (request.Accords != null && request.Accords.Any())
                    {
                        foreach (var accord in request.Accords)
                        {
                            if (!string.IsNullOrEmpty(accord))
                            {
                                fragrance.Accords.Add(new FragranceAccord
                                {
                                    Id = Guid.NewGuid(),
                                    FragranceId = fragrance.Id,
                                    Fragrance = fragrance,
                                    Name = accord
                                });
                            }
                        }
                    }

                    // Add entities to context in correct order to maintain relationships
                    _context.Posts.Add(post);
                    _context.Fragrances.Add(fragrance);
                    _context.FragranceRatings.Add(ratings);
                    _context.FragranceSeasons.Add(seasons);

                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Post created successfully with ID: {PostId}", post.Id);

                    // Return created post with location header
                    return CreatedAtAction(nameof(GetPost), new { id = post.Id }, MapPostToResponse(post, currentUserId));
                }
                catch (DbUpdateException dbEx)
                {
                    _logger.LogError(dbEx, "Database error occurred while creating post");
                    return StatusCode(500, "Database error occurred. Please try again.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating a post for user {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        // PUT: api/posts/{id}
        [HttpPut("{id}")]
        [Authorize]
        [EnableRateLimiting("post_create")]
        public async Task<IActionResult> UpdatePost(Guid id, UpdatePostRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid post update request: {ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                _logger.LogInformation("Updating post {PostId} for user {UserId}", id, currentUserId);

                // Find post with all related entities
                var post = await _context.Posts
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Tags)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Notes)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Accords)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Ratings)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Seasons)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (post == null)
                {
                    _logger.LogWarning("Post {PostId} not found", id);
                    return NotFound("Post not found");
                }

                // Verify ownership
                if (post.UserId != currentUserId)
                {
                    _logger.LogWarning("User {UserId} attempted to update post {PostId} owned by {OwnerId}", currentUserId, id, post.UserId);
                    return Forbid("You do not have permission to update this post");
                }

                // Update post attributes
                post.UpdatedAt = DateTime.UtcNow;

                // Update fragrance attributes
                if (!string.IsNullOrEmpty(request.Name))
                    post.Fragrance.Name = request.Name;

                if (!string.IsNullOrEmpty(request.Brand))
                    post.Fragrance.Brand = request.Brand;

                if (!string.IsNullOrEmpty(request.Category))
                    post.Fragrance.Category = request.Category;

                if (request.Description != null)
                    post.Fragrance.Description = request.Description;

                if (request.Occasion != null)
                    post.Fragrance.Occasion = request.Occasion;

                if (request.PhotoUrl != null)
                    post.Fragrance.PhotoUrl = request.PhotoUrl;

                if (request.DayNight.HasValue)
                    post.Fragrance.DayNightPreference = request.DayNight.Value;

                // Update ratings if provided
                if (request.Ratings != null)
                {
                    if (request.Ratings.Overall.HasValue)
                        post.Fragrance.Ratings.Overall = request.Ratings.Overall.Value;

                    if (request.Ratings.Longevity.HasValue)
                        post.Fragrance.Ratings.Longevity = request.Ratings.Longevity.Value;

                    if (request.Ratings.Sillage.HasValue)
                        post.Fragrance.Ratings.Sillage = request.Ratings.Sillage.Value;

                    if (request.Ratings.Scent.HasValue)
                        post.Fragrance.Ratings.Scent = request.Ratings.Scent.Value;

                    if (request.Ratings.Value.HasValue)
                        post.Fragrance.Ratings.Value = request.Ratings.Value.Value;
                }

                // Update seasons if provided
                if (request.Seasons != null)
                {
                    if (request.Seasons.Spring.HasValue)
                        post.Fragrance.Seasons.Spring = request.Seasons.Spring.Value;

                    if (request.Seasons.Summer.HasValue)
                        post.Fragrance.Seasons.Summer = request.Seasons.Summer.Value;

                    if (request.Seasons.Fall.HasValue)
                        post.Fragrance.Seasons.Fall = request.Seasons.Fall.Value;

                    if (request.Seasons.Winter.HasValue)
                        post.Fragrance.Seasons.Winter = request.Seasons.Winter.Value;
                }

                // Update tags if provided
                if (request.Tags != null)
                {
                    // Remove existing tags
                    _context.FragranceTags.RemoveRange(post.Fragrance.Tags);

                    // Add new tags
                    foreach (var tag in request.Tags)
                    {
                        post.Fragrance.Tags.Add(new FragranceTag
                        {
                            FragranceId = post.Fragrance.Id,
                            Name = tag
                        });
                    }
                }

                // Update notes if provided
                if (request.Notes != null)
                {
                    // Remove existing notes
                    _context.FragranceNotes.RemoveRange(post.Fragrance.Notes);

                    // Add new notes
                    int order = 0;
                    foreach (var note in request.Notes)
                    {
                        post.Fragrance.Notes.Add(new FragranceNote
                        {
                            FragranceId = post.Fragrance.Id,
                            Name = note.Name,
                            Category = note.Category,
                            Order = order++
                        });
                    }
                }

                // Update accords if provided
                if (request.Accords != null)
                {
                    // Remove existing accords
                    _context.FragranceAccords.RemoveRange(post.Fragrance.Accords);

                    // Add new accords
                    foreach (var accord in request.Accords)
                    {
                        post.Fragrance.Accords.Add(new FragranceAccord
                        {
                            FragranceId = post.Fragrance.Id,
                            Name = accord
                        });
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Post {PostId} updated successfully", id);

                return Ok(new { message = "Post updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating post {PostId}", id);
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        // DELETE: api/posts/{id}
        [HttpDelete("{id}")]
        [Authorize]
        [EnableRateLimiting("post_create")]
        public async Task<IActionResult> DeletePost(Guid id)
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                _logger.LogInformation("Deleting post {PostId} by user {UserId}", id, currentUserId);

                var post = await _context.Posts
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Tags)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Notes)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Accords)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Ratings)
                    .Include(p => p.Fragrance)
                        .ThenInclude(f => f.Seasons)
                    .Include(p => p.Comments)
                        .ThenInclude(c => c.Likes)
                    .Include(p => p.Comments)
                        .ThenInclude(c => c.Replies)
                            .ThenInclude(r => r.Likes)
                    .Include(p => p.Likes)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (post == null)
                {
                    _logger.LogWarning("Post {PostId} not found", id);
                    return NotFound("Post not found");
                }

                // Verify ownership
                if (post.UserId != currentUserId)
                {
                    _logger.LogWarning("User {UserId} attempted to delete post {PostId} owned by {OwnerId}", currentUserId, id, post.UserId);
                    return Forbid("You do not have permission to delete this post");
                }

                // Delete all related entities
                // Note: This can be optimized with cascade delete in EF Core

                // Delete likes on replies
                foreach (var comment in post.Comments)
                {
                    foreach (var reply in comment.Replies)
                    {
                        _context.CommentLikes.RemoveRange(reply.Likes);
                    }

                    // Delete replies
                    _context.Comments.RemoveRange(comment.Replies);

                    // Delete comment likes
                    _context.CommentLikes.RemoveRange(comment.Likes);
                }

                // Delete comments
                _context.Comments.RemoveRange(post.Comments);

                // Delete post likes
                _context.PostLikes.RemoveRange(post.Likes);

                // Delete fragrance entities
                _context.FragranceTags.RemoveRange(post.Fragrance.Tags);
                _context.FragranceNotes.RemoveRange(post.Fragrance.Notes);
                _context.FragranceAccords.RemoveRange(post.Fragrance.Accords);
                _context.FragranceRatings.Remove(post.Fragrance.Ratings);
                _context.FragranceSeasons.Remove(post.Fragrance.Seasons);
                _context.Fragrances.Remove(post.Fragrance);

                // Delete saved references
                var savedPosts = await _context.SavedPosts.Where(sp => sp.PostId == id).ToListAsync();
                _context.SavedPosts.RemoveRange(savedPosts);

                // Delete notifications related to this post
                var notifications = await _context.Notifications.Where(n => n.PostId == id).ToListAsync();
                _context.Notifications.RemoveRange(notifications);

                // Finally, delete the post
                _context.Posts.Remove(post);

                await _context.SaveChangesAsync();

                _logger.LogInformation("Post {PostId} deleted successfully", id);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting post {PostId}", id);
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        // POST: api/posts/{id}/like
        [HttpPost("{id}/like")]
        [Authorize]
        [EnableRateLimiting("likes")]
        public async Task<IActionResult> LikePost(Guid id)
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                _logger.LogInformation("User {UserId} liking post {PostId}", currentUserId, id);

                var post = await _context.Posts
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (post == null)
                {
                    _logger.LogWarning("Post {PostId} not found", id);
                    return NotFound("Post not found");
                }

                // Check if user already liked the post
                var existingLike = await _context.PostLikes
                    .FirstOrDefaultAsync(pl => pl.PostId == id && pl.UserId == currentUserId);

                if (existingLike != null)
                {
                    _logger.LogInformation("User {UserId} already liked post {PostId}", currentUserId, id);
                    return Ok(new { liked = true, message = "Post already liked" });
                }

                // Add like
                var like = new PostLike
                {
                    PostId = id,
                    UserId = currentUserId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.PostLikes.Add(like);

                // Create notification for post owner if it's not the current user
                if (post.UserId != currentUserId)
                {
                    var notification = new Notification
                    {
                        UserId = post.UserId,
                        ActorId = currentUserId,
                        Type = "like",
                        PostId = post.Id,
                        Content = new NotificationContent
                        {
                            Action = "liked your post",
                            PostTitle = post.Fragrance?.Name ?? "your post"
                        },
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Notifications.Add(notification);
                    _logger.LogInformation("Created like notification for user {RecipientId} from {ActorId}", post.UserId, currentUserId);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} successfully liked post {PostId}", currentUserId, id);

                return Ok(new { liked = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while liking post {PostId}", id);
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        // DELETE: api/posts/{id}/like
        [HttpDelete("{id}/like")]
        [Authorize]
        [EnableRateLimiting("likes")]
        public async Task<IActionResult> UnlikePost(Guid id)
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                _logger.LogInformation("User {UserId} unliking post {PostId}", currentUserId, id);

                // Find the like
                var like = await _context.PostLikes
                    .FirstOrDefaultAsync(pl => pl.PostId == id && pl.UserId == currentUserId);

                if (like == null)
                {
                    _logger.LogWarning("Like not found for post {PostId} by user {UserId}", id, currentUserId);
                    return NotFound("Like not found");
                }

                _context.PostLikes.Remove(like);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} successfully unliked post {PostId}", currentUserId, id);

                return Ok(new { liked = false });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while unliking post {PostId}", id);
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        // POST: api/posts/{id}/save
        [HttpPost("{id}/save")]
        [Authorize]
        [EnableRateLimiting("likes")]
        public async Task<IActionResult> SavePost(Guid id)
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                _logger.LogInformation("User {UserId} saving post {PostId}", currentUserId, id);

                var post = await _context.Posts.FindAsync(id);
                if (post == null)
                {
                    _logger.LogWarning("Post {PostId} not found", id);
                    return NotFound("Post not found");
                }

                // Check if user already saved the post
                var existingSave = await _context.SavedPosts
                    .FirstOrDefaultAsync(sp => sp.PostId == id && sp.UserId == currentUserId);

                if (existingSave != null)
                {
                    _logger.LogInformation("User {UserId} already saved post {PostId}", currentUserId, id);
                    return Ok(new { saved = true, message = "Post already saved" });
                }

                // Add save
                var savedPost = new SavedPost
                {
                    PostId = id,
                    UserId = currentUserId,
                    SavedAt = DateTime.UtcNow
                };

                _context.SavedPosts.Add(savedPost);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} successfully saved post {PostId}", currentUserId, id);

                return Ok(new { saved = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while saving post {PostId}", id);
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        // DELETE: api/posts/{id}/save
        [HttpDelete("{id}/save")]
        [Authorize]
        [EnableRateLimiting("likes")]
        public async Task<IActionResult> UnsavePost(Guid id)
        {
            try
            {
                var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                _logger.LogInformation("User {UserId} unsaving post {PostId}", currentUserId, id);

                // Find the saved post
                var savedPost = await _context.SavedPosts
                    .FirstOrDefaultAsync(sp => sp.PostId == id && sp.UserId == currentUserId);

                if (savedPost == null)
                {
                    _logger.LogWarning("Saved post not found for post {PostId} by user {UserId}", id, currentUserId);
                    return NotFound("Saved post not found");
                }

                _context.SavedPosts.Remove(savedPost);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User {UserId} successfully unsaved post {PostId}", currentUserId, id);

                return Ok(new { saved = false });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while unsaving post {PostId}", id);
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        // Private Helper Methods

        private PostResponse MapPostToResponse(Post post, Guid? currentUserId, bool includeAllComments = false)
        {
            // Check if post is null (add early return to prevent null reference)
            if (post == null)
            {
                _logger.LogWarning("Attempted to map a null post to response");
                return null;
            }

            try
            {
                // Determine if current user has liked or saved this post
                bool isLiked = false;
                bool isSaved = false;

                if (currentUserId.HasValue && post.Likes != null)
                {
                    isLiked = post.Likes.Any(l => l.UserId == currentUserId);
                    // Note: We'd need to load the SavedPosts relation separately
                    // For now, we can't determine this without an additional query
                    // isSaved = post.SavedPosts.Any(sp => sp.UserId == currentUserId);
                }

                // Top-level comments to include, optionally filtered
                IEnumerable<Comment> comments = Enumerable.Empty<Comment>();
                if (post.Comments != null)
                {
                    comments = post.Comments
                        .Where(c => c.ParentCommentId == null); // Only top-level comments

                    if (!includeAllComments)
                    {
                        comments = comments.Take(3); // Limit to 3 comments for feed view
                    }
                }

                // User null check and default
                var userResponse = new UserBriefResponse
                {
                    Id = post.User?.Id.ToString() ?? "00000000-0000-0000-0000-000000000000",
                    Username = post.User?.Username ?? "Unknown User",
                    ProfilePictureUrl = post.User?.ProfilePictureUrl
                };

                // Fragrance null check and default
                var fragranceResponse = new FragranceResponse
                {
                    Id = post.Fragrance?.Id.ToString() ?? "00000000-0000-0000-0000-000000000000",
                    Name = post.Fragrance?.Name ?? "Unknown Fragrance",
                    Brand = post.Fragrance?.Brand ?? "Unknown Brand",
                    Category = post.Fragrance?.Category ?? "Unknown",
                    Description = post.Fragrance?.Description,
                    Occasion = post.Fragrance?.Occasion,
                    PhotoUrl = post.Fragrance?.PhotoUrl,
                    DayNightPreference = post.Fragrance?.DayNightPreference ?? 50,

                    // Handle null collection properties
                    Tags = post.Fragrance?.Tags?.Select(t => t.Name).ToList() ?? new List<string>(),
                    Notes = post.Fragrance?.Notes?.Select(n => new NoteResponse
                    {
                        Name = n.Name,
                        Category = n.Category
                    }).ToList() ?? new List<NoteResponse>(),
                    Accords = post.Fragrance?.Accords?.Select(a => a.Name).ToList() ?? new List<string>(),

                    // Handle null ratings
                    Ratings = post.Fragrance?.Ratings != null ? new RatingsResponse
                    {
                        Overall = post.Fragrance.Ratings.Overall,
                        Longevity = post.Fragrance.Ratings.Longevity,
                        Sillage = post.Fragrance.Ratings.Sillage,
                        Scent = post.Fragrance.Ratings.Scent,
                        Value = post.Fragrance.Ratings.Value
                    } : new RatingsResponse
                    {
                        Overall = 5,
                        Longevity = 5,
                        Sillage = 5,
                        Scent = 5,
                        Value = 5
                    },

                    // Handle null seasons
                    Seasons = post.Fragrance?.Seasons != null ? new SeasonsResponse
                    {
                        Spring = post.Fragrance.Seasons.Spring,
                        Summer = post.Fragrance.Seasons.Summer,
                        Fall = post.Fragrance.Seasons.Fall,
                        Winter = post.Fragrance.Seasons.Winter
                    } : new SeasonsResponse
                    {
                        Spring = 3,
                        Summer = 3,
                        Fall = 3,
                        Winter = 3
                    }
                };

                return new PostResponse
                {
                    Id = post.Id.ToString(),
                    User = userResponse,
                    CreatedAt = post.CreatedAt,
                    UpdatedAt = post.UpdatedAt,
                    Fragrance = fragranceResponse,
                    LikesCount = post.Likes?.Count ?? 0,
                    CommentsCount = post.Comments?.Count ?? 0,
                    IsLiked = isLiked,
                    IsSaved = isSaved,
                    Comments = comments
                        .Select(c => MapCommentToResponse(c, currentUserId))
                        .Where(c => c != null) // Filter out null comments
                        .ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error mapping post {post.Id} to response");

                // Return a minimal response instead of throwing
                return new PostResponse
                {
                    Id = post.Id.ToString(),
                    User = new UserBriefResponse { Username = "Error" },
                    CreatedAt = post.CreatedAt,
                    Fragrance = new FragranceResponse { Name = "Error loading fragrance data" },
                    Comments = new List<CommentResponse>()
                };
            }
        }

        private CommentResponse MapCommentToResponse(Comment comment, Guid? currentUserId)
        {
            // Early return if comment is null
            if (comment == null)
            {
                _logger.LogWarning("Attempted to map a null comment to response");
                return null;
            }

            try
            {
                // Determine if current user has liked this comment
                bool isLiked = false;
                if (currentUserId.HasValue && comment.Likes != null)
                {
                    isLiked = comment.Likes.Any(l => l.UserId == currentUserId);
                }

                var response = new CommentResponse
                {
                    Id = comment.Id.ToString(),
                    User = comment.User != null ? new UserBriefResponse
                    {
                        Id = comment.User.Id.ToString(),
                        Username = comment.User.Username,
                        ProfilePictureUrl = comment.User.ProfilePictureUrl
                    } : new UserBriefResponse { Username = "Unknown" },
                    Text = comment.Text,
                    CreatedAt = comment.CreatedAt,
                    UpdatedAt = comment.UpdatedAt,
                    LikesCount = comment.Likes?.Count ?? 0,
                    RepliesCount = comment.Replies?.Count ?? 0,
                    IsLiked = isLiked,
                    IsOwner = currentUserId.HasValue && currentUserId == comment.UserId
                };

                // Add replies if they exist
                if (comment.Replies != null && comment.Replies.Count > 0)
                {
                    response.Replies = comment.Replies
                        .Select(r => MapCommentToResponse(r, currentUserId))
                        .Where(r => r != null) // Filter out any nulls that might result from mapping
                        .ToList();
                }
                else
                {
                    response.Replies = new List<CommentResponse>();
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error mapping comment {comment.Id} to response");
                // Return a basic response instead of throwing
                return new CommentResponse
                {
                    Id = comment.Id.ToString(),
                    Text = "[Error displaying comment]",
                    CreatedAt = comment.CreatedAt,
                    LikesCount = 0,
                    RepliesCount = 0
                };
            }
        }
    }
}

 