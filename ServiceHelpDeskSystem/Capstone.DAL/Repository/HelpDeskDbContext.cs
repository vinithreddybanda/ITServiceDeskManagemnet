using Capstone.DAL.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Capstone.DAL.Repository;

public class HelpDeskDbContext(DbContextOptions<HelpDeskDbContext> options) : DbContext(options)
{
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();
    public DbSet<Status> Statuses => Set<Status>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId);

        modelBuilder.Entity<ServiceRequest>()
            .HasOne(s => s.Status)
            .WithMany(st => st.ServiceRequests)
            .HasForeignKey(s => s.ReqStatus);

        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, RoleName = "User" },
            new Role { RoleId = 2, RoleName = "Admin" }
        );

        modelBuilder.Entity<Status>().HasData(
            new Status { StatusId = 1, Description = "New" },
            new Status { StatusId = 2, Description = "Closed" }
        );

        modelBuilder.Entity<User>().HasData(
            new User { UserName = "rahul", Password = "Password1", CreatedOn = new DateTime(2026, 1, 1), RoleId = 1 },
            new User { UserName = "kathryn", Password = "Password1", CreatedOn = new DateTime(2026, 1, 1), RoleId = 1 },
            new User { UserName = "admin", Password = "Admin123", CreatedOn = new DateTime(2026, 1, 1), RoleId = 2 }
        );
    }
}

public class HelpDeskDbContextFactory : IDesignTimeDbContextFactory<HelpDeskDbContext>
{
    public HelpDeskDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<HelpDeskDbContext>()
            .UseSqlite("Data Source=Database/ServiceDeskDB.db")
            .Options;

        return new HelpDeskDbContext(options);
    }
}