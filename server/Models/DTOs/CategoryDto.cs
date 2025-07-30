using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models.DTOs;

public class CategoryDto
{
    public Guid id { get; set; }
    public string name { get; set; } = string.Empty;
    public DateTime createdAt { get; set; }
}