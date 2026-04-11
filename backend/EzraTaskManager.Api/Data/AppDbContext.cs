using Microsoft.EntityFrameworkCore;
using EzraTaskManager.Api.Models;

namespace EzraTaskManager.Api.Data;

// DbContext is like JPA's EntityManager — it's the gateway to the database
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Title).IsRequired().HasMaxLength(200);
            entity.Property(t => t.Description).HasMaxLength(2000);
            entity.Property(t => t.Status).HasConversion<int>();
            entity.Property(t => t.Priority).HasConversion<int>();
        });
    }
}
