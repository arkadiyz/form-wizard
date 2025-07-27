using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models.DTOs;

public class SkillDto
{
    [Column("id")]
    public Guid Id { get; set; }
    
    [Column("categoryId")]
    public Guid CategoryId { get; set; }
    
    [Column("name")]
    public string Name { get; set; } = string.Empty;
    
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }
}

public class SkillFilterRequest
{
    public Guid? CategoryId { get; set; }
}