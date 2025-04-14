namespace Fragmento_server.Models.DTOs.Responses
{
    public class CommentDetailResponse : CommentResponse
    {
        // Extended properties for detailed view
        public bool IsLikedByCurrentUser { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

}
