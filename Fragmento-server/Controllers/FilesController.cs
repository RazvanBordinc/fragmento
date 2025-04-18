using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Logging;

namespace Fragmento_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<FilesController> _logger;

        public FilesController(
            IWebHostEnvironment environment,
            ILogger<FilesController> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        // POST: api/files/upload
        [HttpPost("upload")]
        [Authorize]
        [EnableRateLimiting("default")]
        [RequestSizeLimit(10_000_000)] // 10 MB limit
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    _logger.LogWarning("No file uploaded");
                    return BadRequest("No file uploaded");
                }

                // Validate file type
                var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
                if (!Array.Exists(allowedTypes, type => type == file.ContentType))
                {
                    _logger.LogWarning($"Invalid file type: {file.ContentType}");
                    return BadRequest("Only image files (JPEG, PNG, GIF, WEBP) are allowed");
                }

                // Create uploads directory if it doesn't exist
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Create a unique filename
                var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Save the file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return the file URL
                var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{uniqueFileName}";

                _logger.LogInformation($"File uploaded successfully: {fileUrl}");

                return Ok(new { url = fileUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file");
                return StatusCode(500, "An error occurred while uploading the file");
            }
        }

        // POST: api/files/upload-base64
        [HttpPost("upload-base64")]
        [Authorize]
        [EnableRateLimiting("default")]
        [RequestSizeLimit(10_000_000)] // 10 MB limit
        public async Task<IActionResult> UploadBase64Image([FromBody] Base64UploadRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Base64Image))
                {
                    _logger.LogWarning("No base64 image provided");
                    return BadRequest("No base64 image provided");
                }

                // Extract content type and base64 data
                var parts = request.Base64Image.Split(',');
                if (parts.Length < 2)
                {
                    return BadRequest("Invalid base64 image format");
                }

                // Get content type and validate
                var contentTypeMatch = parts[0].Replace("data:", "").Replace(";base64", "");
                var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
                if (!Array.Exists(allowedTypes, type => type == contentTypeMatch))
                {
                    _logger.LogWarning($"Invalid file type: {contentTypeMatch}");
                    return BadRequest("Only image files (JPEG, PNG, GIF, WEBP) are allowed");
                }

                // Get base64 data
                var base64Data = parts[1];
                var fileData = Convert.FromBase64String(base64Data);

                // Create uploads directory if it doesn't exist
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Determine file extension
                var extension = ".jpg"; // Default
                if (contentTypeMatch == "image/png") extension = ".png";
                else if (contentTypeMatch == "image/gif") extension = ".gif";
                else if (contentTypeMatch == "image/webp") extension = ".webp";

                // Create a unique filename
                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Save the file
                await System.IO.File.WriteAllBytesAsync(filePath, fileData);

                // Return the file URL
                var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{uniqueFileName}";

                _logger.LogInformation($"Base64 image uploaded successfully: {fileUrl}");

                return Ok(new { url = fileUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading base64 image");
                return StatusCode(500, "An error occurred while uploading the image");
            }
        }
    }

    public class Base64UploadRequest
    {
        public string Base64Image { get; set; }
    }
}