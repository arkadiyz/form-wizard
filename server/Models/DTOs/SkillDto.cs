using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models.DTOs;

public class SkillDto
{
    public Guid id { get; set; }
    public Guid categoryId { get; set; }
    public string name { get; set; } = string.Empty;
    public DateTime createdAt { get; set; }
}

public class SkillCategoryDto
{
    public Guid id { get; set; }
    public string name { get; set; } = string.Empty;
    public DateTime createdAt { get; set; }
}

public class SkillFilterRequest
{
    public Guid? categoryId { get; set; }
    public string? searchTerm { get; set; }
    public int? limit { get; set; }
}