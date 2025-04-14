using System.ComponentModel.DataAnnotations;

namespace Fragmento_server.Models.DTOs.Requests
{
    public class UpdateProfileRequest
    {
        [StringLength(1000)]
        public string Bio { get; set; }

        [StringLength(500)]
        public string ProfilePictureUrl { get; set; }

        [StringLength(500)]
        public string CoverPictureUrl { get; set; }

        public SignatureFragranceRequest SignatureFragrance { get; set; }

        public bool RemoveSignatureFragrance { get; set; }
    }
}
