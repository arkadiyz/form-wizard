using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models.DTOs;

public class FormDataDto
{
    public PersonalInfoDto personalInfo { get; set; } = new();
    public JobInterestDto jobInterest { get; set; } = new();
    public NotificationDto notifications { get; set; } = new();
}

public class FormStateDto
{
    public Guid id { get; set; }
    public string sessionId { get; set; } = string.Empty;
    public FormDataDto formData { get; set; } = new();
    public int currentStep { get; set; } = 1;
    public bool isCompleted { get; set; } = false;
    public DateTime createdAt { get; set; }
    public DateTime updatedAt { get; set; }
}

public class SaveFormStateRequest
{
    public string sessionId { get; set; } = string.Empty;
    public FormDataDto formData { get; set; } = new();
    public int currentStep { get; set; } = 1;
}

public class UpdateStepRequest
{
    public string sessionId { get; set; } = string.Empty;
    public int currentStep { get; set; }
}

public class SubmitFormRequest
{
    public string sessionId { get; set; } = string.Empty;
}

public class ApiResponse<T>
{
    public bool success { get; set; }
    public string message { get; set; } = string.Empty;
    public T? data { get; set; }
    public List<string> errors { get; set; } = new();
}