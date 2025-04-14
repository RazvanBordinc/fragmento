namespace Fragmento_server.Models.DTOs.Responses
{
    public class UserSearchResult
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string ProfilePictureUrl { get; set; }
        public string Bio { get; set; }
        public bool IsFollowing { get; set; }
    }
}
