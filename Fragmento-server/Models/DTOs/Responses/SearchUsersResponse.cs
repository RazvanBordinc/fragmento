namespace Fragmento_server.Models.DTOs.Responses
{
    public class SearchUsersResponse
    {
        public List<UserSearchResult> Users { get; set; } = new List<UserSearchResult>();
        public int Total { get; set; }
        public string Query { get; set; }
    }
}
