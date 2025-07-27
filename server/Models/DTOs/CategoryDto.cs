using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models.DTOs;

public class CategoryDto
{
    public int id { get; set; }
    public string name { get; set; } = string.Empty;
    public string displayNameEn { get; set; } = string.Empty;
    public string displayNameHe { get; set; } = string.Empty;
    public DateTime createdAt { get; set; }
}