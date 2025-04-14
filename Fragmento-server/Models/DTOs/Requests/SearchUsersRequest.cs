using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.DTOs.Requests
{
    public class SearchUsersRequest
    {
        [Required]
        [StringLength(50, MinimumLength = 1)]
        public string Query { get; set; }

        [Range(1, 100)]
        public int Limit { get; set; } = 20;
    }
}
