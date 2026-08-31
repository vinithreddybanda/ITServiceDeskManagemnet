using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Capstone.DAL.Models;

public class User
{
    [Key]
    [StringLength(20, MinimumLength = 1)]
    public string UserName { get; set; } = string.Empty;

    [Required]
    [StringLength(20, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public DateTime CreatedOn { get; set; } = DateTime.Now;

    [ForeignKey(nameof(Role))]
    public int RoleId { get; set; }

    public Role? Role { get; set; }
}