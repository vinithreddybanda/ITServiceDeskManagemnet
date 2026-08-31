
using Capstone.DAL.Repository;
using Microsoft.EntityFrameworkCore;

namespace Capstone.API;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        Directory.CreateDirectory("Database");
        var dbPath = Path.Combine("Database", "ServiceDeskDB.db");
        builder.Services.AddDbContext<HelpDeskDbContext>(options => options.UseSqlite($"Data Source={dbPath}"));

        builder.Services.AddScoped<IRepository, Repository>();

        var allowedOrigins = "_allowedOrigins";
        builder.Services.AddCors(options =>
        {
            options.AddPolicy(name: allowedOrigins,
                policy =>
                    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
        });

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        using (var scope = app.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<HelpDeskDbContext>();
            context.Database.Migrate();
        }

        app.UseHttpsRedirection();
        app.UseCors(allowedOrigins);
        app.UseAuthorization();
        app.MapControllers();
        app.Run();
    }
}
