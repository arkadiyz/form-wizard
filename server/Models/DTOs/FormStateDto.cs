using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models.DTOs;

public class FormDataDto
{
    public PersonalInfoDto PersonalInfo { get; set; } = new();
    public JobInterestDto JobInterest { get; set; } = new();
    public NotificationDto Notifications { get; set; } = new();
}

public class FormStateDto
{
    [Column("id")]
    public Guid Id { get; set; }
    
    [Column("sessionId")]
    public string SessionId { get; set; } = string.Empty;
    
    [Column("formData")]
    public FormDataDto FormData { get; set; } = new();
    
    [Column("currentStep")]
    public int CurrentStep { get; set; } = 1;
    
    [Column("isCompleted")]
    public bool IsCompleted { get; set; } = false;
    
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }
    
    [Column("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}

public class SaveFormStateRequest
{
    public string SessionId { get; set; } = string.Empty;
    public FormDataDto FormData { get; set; } = new();
    public int CurrentStep { get; set; } = 1;
}

public class UpdateStepRequest
{
    public string SessionId { get; set; } = string.Empty;
    public int CurrentStep { get; set; }
}

public class SubmitFormRequest
{
    public string SessionId { get; set; } = string.Empty;
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string> Errors { get; set; } = new();
}