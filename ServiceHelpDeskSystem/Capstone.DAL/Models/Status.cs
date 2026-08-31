using System.ComponentModel.DataAnnotations;

namespace Capstone.DAL.Models;

public class Status
{
    [Key]
    public int StatusId { get; set; }

    [Required]
    [StringLength(50)]
    public string Description { get; set; } = string.Empty;

    public ICollection<ServiceRequest> ServiceRequests { get; set; } = new List<ServiceRequest>();
}