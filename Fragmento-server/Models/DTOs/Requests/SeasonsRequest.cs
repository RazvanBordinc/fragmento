using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.DTOs.Requests
{
    public class SeasonsRequest
    {
        [Range(0, 5, ErrorMessage = "Spring rating must be between 0 and 5")]
        public int? Spring { get; set; }

        [Range(0, 5, ErrorMessage = "Summer rating must be between 0 and 5")]
        public int? Summer { get; set; }

        [Range(0, 5, ErrorMessage = "Fall rating must be between 0 and 5")]
        public int? Fall { get; set; }

        [Range(0, 5, ErrorMessage = "Winter rating must be between 0 and 5")]
        public int? Winter { get; set; }
    }
}
