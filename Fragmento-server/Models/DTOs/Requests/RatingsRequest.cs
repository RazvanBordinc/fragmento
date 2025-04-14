using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.DTOs.Requests
{
    public class RatingsRequest
    {
        [Range(0, 10, ErrorMessage = "Overall rating must be between 0 and 10")]
        public decimal? Overall { get; set; }

        [Range(0, 10, ErrorMessage = "Longevity rating must be between 0 and 10")]
        public decimal? Longevity { get; set; }

        [Range(0, 10, ErrorMessage = "Sillage rating must be between 0 and 10")]
        public decimal? Sillage { get; set; }

        [Range(0, 10, ErrorMessage = "Scent rating must be between 0 and 10")]
        public decimal? Scent { get; set; }

        [Range(0, 10, ErrorMessage = "Value rating must be between 0 and 10")]
        public decimal? Value { get; set; }
    }
}
