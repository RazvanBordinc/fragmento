using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.DTOs.Requests
{
    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
