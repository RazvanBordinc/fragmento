namespace Fragmento_server.Models.DTOs.Responses
{
    public class CommentPaginatedResponse
    {
        public List<CommentDetailResponse> Comments { get; set; }
        public int TotalComments { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
    }
}
