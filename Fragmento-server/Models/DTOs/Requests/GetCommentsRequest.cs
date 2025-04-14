namespace Fragmento_server.Models.DTOs.Requests
{
    public class GetCommentsRequest
    {
        // Pagination
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        // Sorting
        public string SortBy { get; set; } = "createdAt"; // createdAt, likes
        public bool Descending { get; set; } = true;

        // Filtering
        public bool OnlyTopLevel { get; set; } = true;
    }
}
