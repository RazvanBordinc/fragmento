using Microsoft.EntityFrameworkCore;
using Fragmento_server.Models.Entities;
using Fragmento_server.Models.Entities.Fragmento_server.Models.Entities;

namespace Fragmento_server.Data
{
    public class FragmentoDbContext : DbContext
    {
        public FragmentoDbContext(DbContextOptions<FragmentoDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<FragranceSignature> FragranceSignatures { get; set; }
        public DbSet<FragranceSignatureNote> FragranceSignatureNotes { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Fragrance> Fragrances { get; set; }
        public DbSet<FragranceTag> FragranceTags { get; set; }
        public DbSet<FragranceNote> FragranceNotes { get; set; }
        public DbSet<FragranceAccord> FragranceAccords { get; set; }
        public DbSet<FragranceRatings> FragranceRatings { get; set; }
        public DbSet<FragranceSeasons> FragranceSeasons { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<CommentLike> CommentLikes { get; set; }
        public DbSet<PostLike> PostLikes { get; set; }
        public DbSet<SavedPost> SavedPosts { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Follow> Follows { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User - must have a unique username
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // User - must have a unique email
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Configure one-to-one relationship between User and SignatureFragrance
            modelBuilder.Entity<User>()
                .HasOne(u => u.SignatureFragrance)
                .WithOne(s => s.User)
                .HasForeignKey<FragranceSignature>(s => s.UserId);

            // Configure one-to-one relationship between Post and Fragrance
            modelBuilder.Entity<Post>()
                .HasOne(p => p.Fragrance)
                .WithOne(f => f.Post)
                .HasForeignKey<Fragrance>(f => f.PostId);

            // Configure one-to-one relationship between Fragrance and Ratings
            modelBuilder.Entity<Fragrance>()
                .HasOne(f => f.Ratings)
                .WithOne(r => r.Fragrance)
                .HasForeignKey<FragranceRatings>(r => r.FragranceId);

            // Configure one-to-one relationship between Fragrance and Seasons
            modelBuilder.Entity<Fragrance>()
                .HasOne(f => f.Seasons)
                .WithOne(s => s.Fragrance)
                .HasForeignKey<FragranceSeasons>(s => s.FragranceId);

            // Configure User-Post relationship
            modelBuilder.Entity<Post>()
                .HasOne(p => p.User)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

            // Configure Comment-User relationship
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

            // Configure self-referencing relationship for Comment replies
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

            // Configure unique constraint for user likes on posts
            modelBuilder.Entity<PostLike>()
                .HasIndex(pl => new { pl.PostId, pl.UserId })
                .IsUnique();

            // Configure unique constraint for user likes on comments
            modelBuilder.Entity<CommentLike>()
                .HasIndex(cl => new { cl.CommentId, cl.UserId })
                .IsUnique();

            // Configure unique constraint for saved posts
            modelBuilder.Entity<SavedPost>()
                .HasIndex(sp => new { sp.PostId, sp.UserId })
                .IsUnique();

            // Configure unique constraint for follows
            modelBuilder.Entity<Follow>()
                .HasIndex(f => new { f.FollowerId, f.FollowingId })
                .IsUnique();

            // Configure Follow relationships
            modelBuilder.Entity<Follow>()
                .HasOne(f => f.Follower)
                .WithMany(u => u.Following)
                .HasForeignKey(f => f.FollowerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Follow>()
                .HasOne(f => f.Following)
                .WithMany(u => u.Followers)
                .HasForeignKey(f => f.FollowingId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Notification relationships
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Actor)
                .WithMany()
                .HasForeignKey(n => n.ActorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure RefreshToken relationships
            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany()  // User class will need a collection of RefreshTokens
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);  // When user is deleted, delete their tokens
        }
    }
}