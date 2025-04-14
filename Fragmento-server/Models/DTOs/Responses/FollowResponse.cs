namespace Fragmento_server.Models.DTOs.Responses
{
    public class FollowResponse
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string ProfilePictureUrl { get; set; }
        public DateTime FollowedAt { get; set; }
    }
}
