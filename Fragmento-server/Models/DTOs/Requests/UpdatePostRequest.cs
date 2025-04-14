using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.DTOs.Requests
{
    public class UpdatePostRequest
    {
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(100)]
        public string Brand { get; set; }

        [StringLength(50)]
        public string Category { get; set; }

        [StringLength(2000)]
        public string Description { get; set; }

        [StringLength(50)]
        public string Occasion { get; set; }

        [StringLength(500)]
        public string PhotoUrl { get; set; }

        [Range(0, 100)]
        public int? DayNight { get; set; }

        public List<string> Tags { get; set; }

        public List<NoteRequest> Notes { get; set; }

        public List<string> Accords { get; set; }

        public RatingsRequest Ratings { get; set; }

        public SeasonsRequest Seasons { get; set; }
    }
}
