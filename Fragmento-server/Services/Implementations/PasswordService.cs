using Fragmento_server.Services.Interfaces;
using System.Security.Cryptography;

namespace Fragmento_server.Services.Implementations
{
    public class PasswordService : IPasswordService
    {
        private const int SaltSize = 16; // 128 bit
        private const int KeySize = 32; // 256 bit
        private const int Iterations = 10000;
        private static readonly HashAlgorithmName HashAlgorithm = HashAlgorithmName.SHA256;
        private const char Delimiter = ':';

        public string HashPassword(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(SaltSize);
            var hash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                Iterations,
                HashAlgorithm,
                KeySize);

            return string.Join(
                Delimiter,
                Convert.ToBase64String(hash),
                Convert.ToBase64String(salt),
                Iterations,
                HashAlgorithm
            );
        }

        public bool VerifyPassword(string password, string storedHash)
        {
            var elements = storedHash.Split(Delimiter);
            var hash = Convert.FromBase64String(elements[0]);
            var salt = Convert.FromBase64String(elements[1]);
            var iterations = int.Parse(elements[2]);
            var algorithm = new HashAlgorithmName(elements[3]);

            var verificationHash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                iterations,
                algorithm,
                hash.Length
            );

            return CryptographicOperations.FixedTimeEquals(hash, verificationHash);
        }

        public bool IsStrongPassword(string password)
        {
            // At least 8 characters
            if (password.Length < 8)
                return false;

            // Check for uppercase letters
            if (!password.Any(char.IsUpper))
                return false;

            // Check for lowercase letters
            if (!password.Any(char.IsLower))
                return false;

            // Check for digits
            if (!password.Any(char.IsDigit))
                return false;

            // Check for special characters
            if (!password.Any(c => !char.IsLetterOrDigit(c)))
                return false;

            return true;
        }
    }
}
