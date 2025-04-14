using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.DTOs.Requests
{
    public class CreateCommentRequest
    {
        [Required]
        public Guid PostId { get; set; }

        [Required]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "Comment text must be between 1 and 1000 characters.")]
        public string Text { get; set; }

        // Optional parent comment ID for replies
        public Guid? ParentCommentId { get; set; }
    }
}
