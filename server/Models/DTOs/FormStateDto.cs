namespace Server.Models.DTOs;

public class FormDataDto
{
    public PersonalInfoDto PersonalInfo { get; set; } = new();
    public JobInterestDto JobInterest { get; set; } = new();
    public NotificationDto Notifications { get; set; } = new();
}

public class FormStateDto
{
    public Guid Id { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public FormDataDto FormData { get; set; } = new();
    public int CurrentStep { get; set; } = 1;
    public bool IsCompleted { get; set; } = false;
    public DateTime CreatedAt { get; set; }
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