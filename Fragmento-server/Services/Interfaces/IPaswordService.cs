namespace Fragmento_server.Services.Interfaces
{
    public interface IPasswordService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string storedHash);
        bool IsStrongPassword(string password);
    }
}
