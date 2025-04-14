namespace Fragmento_server.Models.DTOs.Responses
{
    public class UserProfileResponse
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Bio { get; set; }
        public string ProfilePictureUrl { get; set; }
        public string CoverPictureUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastActive { get; set; }
        public bool IsFollowing { get; set; }
        public bool IsCurrentUser { get; set; }
        public UserStatsResponse Stats { get; set; }
        public SignatureFragranceResponse SignatureFragrance { get; set; }
    }
}
