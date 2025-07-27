# 🎯 Phase 1 Prompt - FormState Infrastructure

**הנה הפרומט המסודר והמדויק ל-Phase 1:**

---

## 📋 Phase 1 Mission Statement

Create the complete FormState infrastructure to enable XML-based persistent storage as required by the assignment. This phase establishes the foundation for continuous form state saving and session-based data retrieval.

**Duration:** 45 minutes  
**Priority:** Critical (Required for frontend integration)

---

## 🎯 Phase 1 Objectives

1. ✅ Create FormState table in database
2. ✅ Create DTOs matching frontend TypeScript interfaces  
3. ✅ Implement FormStateService with XML operations
4. ✅ Update FormController with save/load endpoints
5. ✅ Configure dependency injection and CORS

---

## 📊 Phase 1 Deliverables

### Database:
- `FormState` table with XML column and indexes

### Models:
- `PersonalInfoDto.cs`
- `JobInterestDto.cs` 
- `NotificationDto.cs`
- `FormStateDto.cs`
- `ApiResponse.cs`

### Services:
- `IFormStateService.cs` interface
- `FormStateService.cs` implementation

### API Endpoints:
- `POST /api/form/save-state`
- `GET /api/form/load-state/{sessionId}`
- `PUT /api/form/update-step`
- `POST /api/form/submit-final`

### Configuration:
- Updated `Program.cs` with DI and CORS

---

# ⚡ Phase 1 - Detailed Task Breakdown

## 🔴 Step 1A: Database Setup (10 דקות)

### 📋 Task 1A.1: Create FormState Table
**Time:** 5 דקות

```sql
-- Execute in SQL Server Management Studio or Azure Data Studio
USE form_wizard_db;

CREATE TABLE FormState (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    sessionId NVARCHAR(255) NOT NULL UNIQUE,
    formDataXml XML NOT NULL,
    currentStep INT DEFAULT 1,
    isCompleted BIT DEFAULT 0,
    createdAt DATETIME2 DEFAULT GETUTCDATE(),
    updatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

**Verification:**
```sql
-- Check table was created
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'FormState';
```

### 📋 Task 1A.2: Create Indexes
**Time:** 3 דקות

```sql
-- Create performance indexes
CREATE INDEX IX_FormState_SessionId ON FormState(sessionId);
CREATE INDEX IX_FormState_IsCompleted ON FormState(isCompleted);
CREATE PRIMARY XML INDEX IX_FormState_FormDataXml ON FormState(formDataXml);
```

**Verification:**
```sql
-- Check indexes were created
SELECT name, type_desc FROM sys.indexes 
WHERE object_id = OBJECT_ID('FormState');
```

### 📋 Task 1A.3: Test Table Structure
**Time:** 2 דקות

```sql
-- Insert test record
INSERT INTO FormState (sessionId, formDataXml, currentStep)
VALUES ('test-session-123', '<FormData><Test>true</Test></FormData>', 1);

-- Verify insert and delete test record
SELECT * FROM FormState WHERE sessionId = 'test-session-123';
DELETE FROM FormState WHERE sessionId = 'test-session-123';
```

---

## 🟡 Step 1B: DTOs Creation (10 דקות)

### 📋 Task 1B.1: Create DTOs Folder Structure
**Time:** 1 דקה

Create folder: `server/Models/DTOs/`

### 📋 Task 1B.2: Create PersonalInfoDto
**Time:** 2 דקות

**File:** `server/Models/DTOs/PersonalInfoDto.cs`
```csharp
namespace Server.Models.DTOs;

public class PersonalInfoDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
```

### 📋 Task 1B.3: Create JobInterestDto
**Time:** 2 דקות

**File:** `server/Models/DTOs/JobInterestDto.cs`
```csharp
namespace Server.Models.DTOs;

public class JobInterestDto
{
    public string CategoryId { get; set; } = string.Empty;
    public List<string> RoleIds { get; set; } = new();
    public string LocationId { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = new();
    public string? ExperienceLevel { get; set; }
}
```

### 📋 Task 1B.4: Create NotificationDto
**Time:** 2 דקות

**File:** `server/Models/DTOs/NotificationDto.cs`
```csharp
namespace Server.Models.DTOs;

public class NotificationDto
{
    public bool Email { get; set; } = false;
    public bool Phone { get; set; } = false;
    public bool Call { get; set; } = false;
    public bool SMS { get; set; } = false;
    public bool WhatsApp { get; set; } = false;
}
```

### 📋 Task 1B.5: Create FormStateDto and ApiResponse
**Time:** 3 דקות

**File:** `server/Models/DTOs/FormStateDto.cs`
```csharp
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
```

---

## 🟢 Step 1C: Service Interface (10 דקות)

### 📋 Task 1C.1: Create Services Folder Structure
**Time:** 1 דקה

Create folders:
- `server/Services/Interfaces/`
- `server/Services/Implementations/`

### 📋 Task 1C.2: Create IFormStateService Interface
**Time:** 4 דקות

**File:** `server/Services/Interfaces/IFormStateService.cs`
```csharp
using Server.Models.DTOs;

namespace Server.Services.Interfaces;

public interface IFormStateService
{
    /// <summary>
    /// Get form state by session ID
    /// </summary>
    Task<FormStateDto?> GetFormStateAsync(string sessionId);
    
    /// <summary>
    /// Save or update form state
    /// </summary>
    Task<FormStateDto> SaveFormStateAsync(SaveFormStateRequest request);
    
    /// <summary>
    /// Update current step only
    /// </summary>
    Task<bool> UpdateCurrentStepAsync(string sessionId, int currentStep);
    
    /// <summary>
    /// Mark form as completed
    /// </summary>
    Task<bool> MarkCompletedAsync(string sessionId);
    
    /// <summary>
    /// Delete form state (for cleanup)
    /// </summary>
    Task<bool> DeleteFormStateAsync(string sessionId);
}
```

### 📋 Task 1C.3: Plan XML Conversion Methods
**Time:** 5 דקות

**Document the XML structure we'll use:**
```xml
<!-- Expected XML structure -->
<FormData>
  <PersonalInfo>
    <FirstName>John</FirstName>
    <LastName>Doe</LastName>
    <Phone>050-1234567</Phone>
    <Email>john@example.com</Email>
  </PersonalInfo>
  <JobInterest>
    <CategoryId>guid-here</CategoryId>
    <RoleIds>
      <RoleId>guid1</RoleId>
      <RoleId>guid2</RoleId>
    </RoleIds>
    <LocationId>guid-here</LocationId>
    <Skills>
      <Skill>React</Skill>
      <Skill>Node.js</Skill>
    </Skills>
    <ExperienceLevel>mid</ExperienceLevel>
  </JobInterest>
  <Notifications>
    <Email>true</Email>
    <Phone>false</Phone>
    <Call>false</Call>
    <SMS>false</SMS>
    <WhatsApp>false</WhatsApp>
  </Notifications>
</FormData>
```

---

## 🔵 Step 1D: Service Implementation (20 דקות)

### 📋 Task 1D.1: Create FormStateService Class Structure
**Time:** 3 דקות

**File:** `server/Services/Implementations/FormStateService.cs`
```csharp
using Dapper;
using System.Data.SqlClient;
using System.Xml.Linq;
using Server.Models.DTOs;
using Server.Services.Interfaces;

namespace Server.Services.Implementations;

public class FormStateService : IFormStateService
{
    private readonly string _connectionString;

    public FormStateService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found.");
    }

    // TODO: Implement methods
    public async Task<FormStateDto?> GetFormStateAsync(string sessionId)
    {
        throw new NotImplementedException();
    }

    public async Task<FormStateDto> SaveFormStateAsync(SaveFormStateRequest request)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> UpdateCurrentStepAsync(string sessionId, int currentStep)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> MarkCompletedAsync(string sessionId)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteFormStateAsync(string sessionId)
    {
        throw new NotImplementedException();
    }

    // TODO: Add XML conversion methods
}
```

### 📋 Task 1D.2: Implement XML Conversion Methods
**Time:** 7 דקות

**Add to FormStateService class:**
```csharp
private string ConvertFormDataToXml(FormDataDto formData)
{
    var doc = new XDocument(
        new XElement("FormData",
            new XElement("PersonalInfo",
                new XElement("FirstName", formData.PersonalInfo.FirstName),
                new XElement("LastName", formData.PersonalInfo.LastName),
                new XElement("Phone", formData.PersonalInfo.Phone),
                new XElement("Email", formData.PersonalInfo.Email)
            ),
            new XElement("JobInterest",
                new XElement("CategoryId", formData.JobInterest.CategoryId),
                new XElement("RoleIds", 
                    formData.JobInterest.RoleIds.Select(id => new XElement("RoleId", id))
                ),
                new XElement("LocationId", formData.JobInterest.LocationId),
                new XElement("Skills",
                    formData.JobInterest.Skills.Select(skill => new XElement("Skill", skill))
                ),
                new XElement("ExperienceLevel", formData.JobInterest.ExperienceLevel ?? "")
            ),
            new XElement("Notifications",
                new XElement("Email", formData.Notifications.Email),
                new XElement("Phone", formData.Notifications.Phone),
                new XElement("Call", formData.Notifications.Call),
                new XElement("SMS", formData.Notifications.SMS),
                new XElement("WhatsApp", formData.Notifications.WhatsApp)
            )
        )
    );

    return doc.ToString();
}

private FormDataDto ConvertXmlToFormData(string xmlString)
{
    var doc = XDocument.Parse(xmlString);
    var root = doc.Root!;

    var personalInfo = root.Element("PersonalInfo");
    var jobInterest = root.Element("JobInterest");
    var notifications = root.Element("Notifications");

    return new FormDataDto
    {
        PersonalInfo = new PersonalInfoDto
        {
            FirstName = personalInfo?.Element("FirstName")?.Value ?? "",
            LastName = personalInfo?.Element("LastName")?.Value ?? "",
            Phone = personalInfo?.Element("Phone")?.Value ?? "",
            Email = personalInfo?.Element("Email")?.Value ?? ""
        },
        JobInterest = new JobInterestDto
        {
            CategoryId = jobInterest?.Element("CategoryId")?.Value ?? "",
            RoleIds = jobInterest?.Element("RoleIds")?.Elements("RoleId")
                .Select(e => e.Value).ToList() ?? new List<string>(),
            LocationId = jobInterest?.Element("LocationId")?.Value ?? "",
            Skills = jobInterest?.Element("Skills")?.Elements("Skill")
                .Select(e => e.Value).ToList() ?? new List<string>(),
            ExperienceLevel = jobInterest?.Element("ExperienceLevel")?.Value
        },
        Notifications = new NotificationDto
        {
            Email = bool.TryParse(notifications?.Element("Email")?.Value, out var email) && email,
            Phone = bool.TryParse(notifications?.Element("Phone")?.Value, out var phone) && phone,
            Call = bool.TryParse(notifications?.Element("Call")?.Value, out var call) && call,
            SMS = bool.TryParse(notifications?.Element("SMS")?.Value, out var sms) && sms,
            WhatsApp = bool.TryParse(notifications?.Element("WhatsApp")?.Value, out var whatsapp) && whatsapp
        }
    };
}
```

### 📋 Task 1D.3: Implement GetFormStateAsync
**Time:** 3 דקות

```csharp
public async Task<FormStateDto?> GetFormStateAsync(string sessionId)
{
    using var connection = new SqlConnection(_connectionString);
    
    const string sql = @"
        SELECT id, sessionId, formDataXml, currentStep, isCompleted, createdAt, updatedAt
        FROM FormState 
        WHERE sessionId = @SessionId";

    var result = await connection.QueryFirstOrDefaultAsync(sql, new { SessionId = sessionId });
    
    if (result == null) return null;

    // Convert XML to FormDataDto
    var formData = ConvertXmlToFormData(result.formDataXml);

    return new FormStateDto
    {
        Id = result.id,
        SessionId = result.sessionId,
        FormData = formData,
        CurrentStep = result.currentStep,
        IsCompleted = result.isCompleted,
        CreatedAt = result.createdAt,
        UpdatedAt = result.updatedAt
    };
}
```

### 📋 Task 1D.4: Implement SaveFormStateAsync
**Time:** 4 דקות

```csharp
public async Task<FormStateDto> SaveFormStateAsync(SaveFormStateRequest request)
{
    using var connection = new SqlConnection(_connectionString);
    
    var xml = ConvertFormDataToXml(request.FormData);
    
    const string sql = @"
        MERGE FormState AS target
        USING (SELECT @SessionId as sessionId) AS source
        ON target.sessionId = source.sessionId
        WHEN MATCHED THEN
            UPDATE SET 
                formDataXml = @FormDataXml,
                currentStep = @CurrentStep,
                updatedAt = GETUTCDATE()
        WHEN NOT MATCHED THEN
            INSERT (sessionId, formDataXml, currentStep)
            VALUES (@SessionId, @FormDataXml, @CurrentStep);
        
        SELECT id, sessionId, formDataXml, currentStep, isCompleted, createdAt, updatedAt
        FROM FormState 
        WHERE sessionId = @SessionId";

    var result = await connection.QueryFirstAsync(sql, new 
    { 
        SessionId = request.SessionId,
        FormDataXml = xml,
        CurrentStep = request.CurrentStep
    });

    return new FormStateDto
    {
        Id = result.id,
        SessionId = result.sessionId,
        FormData = request.FormData,
        CurrentStep = result.currentStep,
        IsCompleted = result.isCompleted,
        CreatedAt = result.createdAt,
        UpdatedAt = result.updatedAt
    };
}
```

### 📋 Task 1D.5: Implement Remaining Methods
**Time:** 3 דקות

```csharp
public async Task<bool> UpdateCurrentStepAsync(string sessionId, int currentStep)
{
    using var connection = new SqlConnection(_connectionString);
    
    const string sql = @"
        UPDATE FormState 
        SET currentStep = @CurrentStep, updatedAt = GETUTCDATE()
        WHERE sessionId = @SessionId";

    var rowsAffected = await connection.ExecuteAsync(sql, new 
    { 
        SessionId = sessionId,
        CurrentStep = currentStep
    });

    return rowsAffected > 0;
}

public async Task<bool> MarkCompletedAsync(string sessionId)
{
    using var connection = new SqlConnection(_connectionString);
    
    const string sql = @"
        UPDATE FormState 
        SET isCompleted = 1, updatedAt = GETUTCDATE()
        WHERE sessionId = @SessionId";

    var rowsAffected = await connection.ExecuteAsync(sql, new { SessionId = sessionId });
    return rowsAffected > 0;
}

public async Task<bool> DeleteFormStateAsync(string sessionId)
{
    using var connection = new SqlConnection(_connectionString);
    
    const string sql = "DELETE FROM FormState WHERE sessionId = @SessionId";
    var rowsAffected = await connection.ExecuteAsync(sql, new { SessionId = sessionId });
    
    return rowsAffected > 0;
}
```

---

## ⚪ Step 1E: Controller & Configuration (15 דקות)

### 📋 Task 1E.1: Update FormController
**Time:** 8 דקות

**Replace content in:** `server/Controllers/FormController.cs`
```csharp
using Microsoft.AspNetCore.Mvc;
using Server.Models.DTOs;
using Server.Services.Interfaces;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FormController : ControllerBase
{
    private readonly IFormStateService _formStateService;

    public FormController(IFormStateService formStateService)
    {
        _formStateService = formStateService;
    }

    [HttpPost("save-state")]
    public async Task<ActionResult<ApiResponse<FormStateDto>>> SaveFormState([FromBody] SaveFormStateRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.SessionId))
            {
                return BadRequest(new ApiResponse<FormStateDto>
                {
                    Success = false,
                    Message = "Session ID is required",
                    Errors = ["Session ID cannot be empty"]
                });
            }

            var result = await _formStateService.SaveFormStateAsync(request);

            return Ok(new ApiResponse<FormStateDto>
            {
                Success = true,
                Message = "Form state saved successfully",
                Data = result
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<FormStateDto>
            {
                Success = false,
                Message = "Failed to save form state",
                Errors = [ex.Message]
            });
        }
    }

    [HttpGet("load-state/{sessionId}")]
    public async Task<ActionResult<ApiResponse<FormStateDto>>> LoadFormState(string sessionId)
    {
        try
        {
            var result = await _formStateService.GetFormStateAsync(sessionId);

            if (result == null)
            {
                return NotFound(new ApiResponse<FormStateDto>
                {
                    Success = false,
                    Message = "Form state not found for this session"
                });
            }

            return Ok(new ApiResponse<FormStateDto>
            {
                Success = true,
                Message = "Form state loaded successfully",
                Data = result
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<FormStateDto>
            {
                Success = false,
                Message = "Failed to load form state",
                Errors = [ex.Message]
            });
        }
    }

    [HttpPut("update-step")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateCurrentStep([FromBody] UpdateStepRequest request)
    {
        try
        {
            var result = await _formStateService.UpdateCurrentStepAsync(request.SessionId, request.CurrentStep);

            return Ok(new ApiResponse<bool>
            {
                Success = result,
                Message = result ? "Current step updated successfully" : "Failed to update current step",
                Data = result
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Failed to update current step",
                Errors = [ex.Message]
            });
        }
    }

    [HttpPost("submit-final")]
    public async Task<ActionResult<ApiResponse<bool>>> SubmitFinalForm([FromBody] SubmitFormRequest request)
    {
        try
        {
            var result = await _formStateService.MarkCompletedAsync(request.SessionId);

            return Ok(new ApiResponse<bool>
            {
                Success = result,
                Message = result ? "Form submitted successfully" : "Failed to submit form",
                Data = result
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Failed to submit form",
                Errors = [ex.Message]
            });
        }
    }
}
```

### 📋 Task 1E.2: Update Program.cs
**Time:** 4 דקות

**Update:** `server/Program.cs`
```csharp
using Server.Services.Interfaces;
using Server.Services.Implementations;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register existing services
builder.Services.AddScoped<UserService>();

// Register new FormState services
builder.Services.AddScoped<IFormStateService, FormStateService>();

// Add CORS for frontend communication
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### 📋 Task 1E.3: Test API with Swagger
**Time:** 3 דקות

1. **Start the API:**
   ```bash
   cd server
   dotnet run
   ```

2. **Open Swagger UI:**
   Navigate to: `https://localhost:7071/swagger` (or your port)

3. **Test the endpoints:**
   - POST `/api/form/save-state` - Test with sample data
   - GET `/api/form/load-state/{sessionId}` - Test loading
   - PUT `/api/form/update-step` - Test step update
   - POST `/api/form/submit-final` - Test completion

**Sample test data for save-state:**
```json
{
  "sessionId": "test-session-123",
  "formData": {
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "050-1234567",
      "email": "john@example.com"
    },
    "jobInterest": {
      "categoryId": "software-guid",
      "roleIds": ["dev-guid-1", "dev-guid-2"],
      "locationId": "tel-aviv-guid",
      "skills": ["React", "Node.js"],
      "experienceLevel": "mid"
    },
    "notifications": {
      "email": true,
      "phone": false,
      "call": false,
      "sms": false,
      "whatsApp": false
    }
  },
  "currentStep": 2
}
```

---

## 🎯 Success Criteria

### ✅ Database:
- [ ] FormState table created successfully
- [ ] Indexes created and working
- [ ] Can insert/query XML data

### ✅ Code Structure:
- [ ] All DTOs created and compilable
- [ ] Service interface defined correctly
- [ ] Service implementation complete
- [ ] Controller updated with all endpoints
- [ ] Program.cs configured with DI and CORS

### ✅ Functionality:
- [ ] Can save form state as XML
- [ ] Can load form state from XML
- [ ] Can update current step
- [ ] Can mark form as completed
- [ ] All endpoints respond via Swagger
- [ ] CORS works with frontend (localhost:3000)

### ✅ Quality:
- [ ] No compilation errors
- [ ] XML serialization/deserialization works
- [ ] Proper error handling in controllers
- [ ] Database connections work correctly

---

## 📋 Expected Final Folder Structure

```
server/
├── Models/
│   ├── FormData.cs (existing)
│   └── DTOs/
│       ├── PersonalInfoDto.cs ✅
│       ├── JobInterestDto.cs ✅
│       ├── NotificationDto.cs ✅
│       └── FormStateDto.cs ✅
├── Services/
│   ├── FormService.cs (existing)
│   ├── UserService.cs (existing)
│   ├── Interfaces/
│   │   └── IFormStateService.cs ✅
│   └── Implementations/
│       └── FormStateService.cs ✅
├── Controllers/
│   ├── FormController.cs ✅ (updated)
│   └── UsersController.cs (existing)
└── Program.cs ✅ (updated)
```

---

## 🚀 Ready for Phase 2

After completing Phase 1, you'll have:
- ✅ Complete FormState XML storage system
- ✅ All necessary DTOs matching frontend
- ✅ Working API endpoints for form management
- ✅ CORS configured for frontend integration

**Phase 2 will focus on Reference Data APIs (Categories, Roles, Locations, Skills)**

---

**Created:** July 27, 2025  
**Project:** FormWizard Multi-Step Form  
**Phase:** 1 of 5  
**Updated:** With detailed task breakdown and corrected DTOs
