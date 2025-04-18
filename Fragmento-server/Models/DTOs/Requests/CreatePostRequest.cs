using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.DTOs.Requests
{
    public class CreatePostRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 100 characters")]
        public string Name { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Brand must be between 1 and 100 characters")]
        public string Brand { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 1, ErrorMessage = "Category must be between 1 and 50 characters")]
        public string Category { get; set; }

        [StringLength(2000)]
        public string Description { get; set; }

        [StringLength(50)]
        public string? Occasion { get; set; }

        [StringLength(500)]
        public string? PhotoUrl { get; set; }

        [Range(0, 100)]
        public int? DayNight { get; set; }

        public List<string> Tags { get; set; }

        public List<NoteRequest> Notes { get; set; }

        public List<string> Accords { get; set; }

        public RatingsRequest Ratings { get; set; }

        public SeasonsRequest Seasons { get; set; }
    }
}
