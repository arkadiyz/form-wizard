# 🎯 Phase 2 Prompt - Reference Data APIs

**הנה הפרומט המסודר והמדויק ל-Phase 2:**

---

## 📋 Phase 2 Mission Statement

Create comprehensive Reference Data APIs to replace mock data and provide real backend support for Categories, Roles, Locations, and Skills. This phase enables dynamic data loading for the form wizard with proper database storage and caching.

**Duration:** 60 minutes  
**Priority:** High (Required for dynamic form data)

---

## 🎯 Phase 2 Objectives

1. ✅ Create Reference Data tables in database
2. ✅ Create Reference DTOs and Response models
3. ✅ Implement Reference Data services
4. ✅ Create Reference Data controller
5. ✅ Seed initial data for testing
6. ✅ Add caching for performance

---

## 📊 Phase 2 Deliverables

### Database Tables:

- `Categories` table with hierarchical support
- `Roles` table with category relationships
- `Locations` table with hierarchy (country/city)
- `Skills` table with categories and levels

### Models & DTOs:

- `CategoryDto.cs`
- `RoleDto.cs`
- `LocationDto.cs`
- `SkillDto.cs`
- `ReferenceDataResponse.cs`

### Services:

- `IReferenceDataService.cs` interface
- `ReferenceDataService.cs` implementation

### API Endpoints:

- `GET /api/reference/categories`
- `GET /api/reference/roles/{categoryId?}`
- `GET /api/reference/locations`
- `GET /api/reference/skills/{categoryId?}`
- `GET /api/reference/all` (combined endpoint)

### Configuration:

- Memory caching for reference data
- Database seeding

---

# ⚡ Phase 2 - Detailed Task Breakdown

## 🔴 Step 2A: Database Schema (20 דקות)

### 📋 Task 2A.1: Create Users Table

**Time:** 4 דקות

```sql
-- Execute in SQL Server Management Studio
USE form_wizard_db;

CREATE TABLE Users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    firstName NVARCHAR(50) NOT NULL,
    lastName NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    createdAt DATETIME2 DEFAULT GETUTCDATE(),
    updatedAt DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Users_Email ON Users(email);
```

### 📋 Task 2A.2: Create SkillsCategories Table

**Time:** 3 דקות

```sql
CREATE TABLE SkillsCategories (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    createdAt DATETIME2 DEFAULT GETUTCDATE()
);
```

### 📋 Task 2A.3: Create Skills Table

**Time:** 3 דקות

```sql
CREATE TABLE Skills (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    categoryId UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(200) NOT NULL,
    createdAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (categoryId) REFERENCES SkillsCategories(id)
);

CREATE INDEX IX_Skills_CategoryId ON Skills(categoryId);
```

### 📋 Task 2A.4: Create Locations Table

**Time:** 3 דקות

```sql
CREATE TABLE Locations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL UNIQUE,
    createdAt DATETIME2 DEFAULT GETUTCDATE()
);
```

### 📋 Task 2A.5: Create Categories Table

**Time:** 3 דקות

```sql
CREATE TABLE Categories (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL UNIQUE,
    createdAt DATETIME2 DEFAULT GETUTCDATE()
);
```

### 📋 Task 2A.6: Create Roles Table

**Time:** 2 דקות

```sql
CREATE TABLE Roles (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    categoryId UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(100) NOT NULL,
    createdAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (categoryId) REFERENCES Categories(id)
);

CREATE INDEX IX_Roles_CategoryId ON Roles(categoryId);
```

### 📋 Task 2A.7: Create UserNotifications Table

**Time:** 2 דקות

```sql
CREATE TABLE UserNotifications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    userId UNIQUEIDENTIFIER NOT NULL,
    isEmailEnabled BIT DEFAULT 1,
    isPhoneEnabled BIT DEFAULT 0,
    isCallEnabled BIT DEFAULT 0,
    isSmsEnabled BIT DEFAULT 0,
    isWhatsappEnabled BIT DEFAULT 0,
    createdAt DATETIME2 DEFAULT GETUTCDATE(),
    updatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id)
);

CREATE INDEX IX_UserNotifications_UserId ON UserNotifications(userId);
```

---

## 🟡 Step 2B: DTOs Creation (15 דקות)

### 📋 Task 2B.1: Create CategoryDto

**Time:** 3 דקות

**File:** `server/Models/DTOs/CategoryDto.cs`

```csharp
namespace Server.Models.DTOs;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayNameEn { get; set; } = string.Empty;
    public string DisplayNameHe { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentCategoryId { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public List<CategoryDto> SubCategories { get; set; } = new();
    public int RoleCount { get; set; } // Count of active roles in this category
}
```

### 📋 Task 2B.2: Create RoleDto

**Time:** 4 דקות

**File:** `server/Models/DTOs/RoleDto.cs`

```csharp
namespace Server.Models.DTOs;

public class RoleDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DisplayNameEn { get; set; } = string.Empty;
    public string DisplayNameHe { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<Guid> RequiredSkillIds { get; set; } = new();
    public List<SkillDto> RequiredSkills { get; set; } = new(); // Populated when needed
    public decimal? SalaryRangeMin { get; set; }
    public decimal? SalaryRangeMax { get; set; }
    public string? ExperienceLevel { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public class RoleFilterRequest
{
    public Guid? CategoryId { get; set; }
    public string? ExperienceLevel { get; set; }
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public List<Guid> RequiredSkillIds { get; set; } = new();
    public bool IncludeSkills { get; set; } = false;
}
```

### 📋 Task 2B.3: Create LocationDto

**Time:** 3 דקות

**File:** `server/Models/DTOs/LocationDto.cs`

```csharp
namespace Server.Models.DTOs;

public class LocationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayNameEn { get; set; } = string.Empty;
    public string DisplayNameHe { get; set; } = string.Empty;
    public string LocationType { get; set; } = string.Empty; // country, state, city, district
    public Guid? ParentLocationId { get; set; }
    public string? ParentLocationName { get; set; }
    public string? CountryCode { get; set; }
    public string? Coordinates { get; set; }
    public string? Timezone { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public List<LocationDto> SubLocations { get; set; } = new();
}

public class LocationFilterRequest
{
    public string? LocationType { get; set; } // Filter by type
    public Guid? ParentLocationId { get; set; } // Get children of specific location
    public string? CountryCode { get; set; } // Filter by country
    public bool IncludeSubLocations { get; set; } = false;
}
```

### 📋 Task 2B.4: Create SkillDto

**Time:** 3 דקות

**File:** `server/Models/DTOs/SkillDto.cs`

```csharp
namespace Server.Models.DTOs;

public class SkillDto
{
    public Guid Id { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayNameEn { get; set; } = string.Empty;
    public string DisplayNameHe { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SkillType { get; set; } // technical, soft, language, certification
    public List<string> ProficiencyLevels { get; set; } = new();
    public bool IsPopular { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public class SkillFilterRequest
{
    public Guid? CategoryId { get; set; }
    public string? SkillType { get; set; }
    public bool? IsPopular { get; set; }
    public string? SearchTerm { get; set; } // Search in name/description
    public int? Limit { get; set; } // Limit results for autocomplete
}
```

### 📋 Task 2B.5: Create Combined Response DTOs

**Time:** 2 דקות

**File:** `server/Models/DTOs/ReferenceDataDto.cs`

```csharp
namespace Server.Models.DTOs;

public class ReferenceDataResponse
{
    public List<CategoryDto> Categories { get; set; } = new();
    public List<RoleDto> Roles { get; set; } = new();
    public List<LocationDto> Locations { get; set; } = new();
    public List<SkillDto> Skills { get; set; } = new();
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    public string Version { get; set; } = "1.0";
}

public class ReferenceDataRequest
{
    public bool IncludeCategories { get; set; } = true;
    public bool IncludeRoles { get; set; } = true;
    public bool IncludeLocations { get; set; } = true;
    public bool IncludeSkills { get; set; } = true;
    public bool IncludeSubItems { get; set; } = true; // Include subcategories, sublocations
    public string? Language { get; set; } = "en"; // en, he
}
```

---

## 🟢 Step 2C: Service Interface (10 דקות)

### 📋 Task 2C.1: Create IReferenceDataService

**Time:** 10 דקות

**File:** `server/Services/Interfaces/IReferenceDataService.cs`

```csharp
using Server.Models.DTOs;

namespace Server.Services.Interfaces;

public interface IReferenceDataService
{
    // Categories
    Task<List<CategoryDto>> GetCategoriesAsync(bool includeSubCategories = true);
    Task<CategoryDto?> GetCategoryByIdAsync(Guid categoryId);

    // Roles
    Task<List<RoleDto>> GetRolesAsync(RoleFilterRequest? filter = null);
    Task<List<RoleDto>> GetRolesByCategoryAsync(Guid categoryId, bool includeSkills = false);
    Task<RoleDto?> GetRoleByIdAsync(Guid roleId, bool includeSkills = false);

    // Locations
    Task<List<LocationDto>> GetLocationsAsync(LocationFilterRequest? filter = null);
    Task<List<LocationDto>> GetLocationsByTypeAsync(string locationType);
    Task<List<LocationDto>> GetLocationsByParentAsync(Guid parentLocationId);
    Task<LocationDto?> GetLocationByIdAsync(Guid locationId, bool includeSubLocations = false);

    // Skills
    Task<List<SkillDto>> GetSkillsAsync(SkillFilterRequest? filter = null);
    Task<List<SkillDto>> GetSkillsByCategoryAsync(Guid categoryId);
    Task<List<SkillDto>> GetPopularSkillsAsync(int limit = 20);
    Task<List<SkillDto>> SearchSkillsAsync(string searchTerm, int limit = 10);
    Task<SkillDto?> GetSkillByIdAsync(Guid skillId);

    // Combined
    Task<ReferenceDataResponse> GetAllReferenceDataAsync(ReferenceDataRequest request);

    // Cache management
    Task RefreshCacheAsync();
    void ClearCache();
}
```

---

## 🔵 Step 2D: Service Implementation (15 דקות)

### 📋 Task 2D.1: Create ReferenceDataService Structure

**Time:** 3 דקות

**File:** `server/Services/Implementations/ReferenceDataService.cs`

```csharp
using Dapper;
using Microsoft.Extensions.Caching.Memory;
using System.Data.SqlClient;
using System.Text.Json;
using Server.Models.DTOs;
using Server.Services.Interfaces;

namespace Server.Services.Implementations;

public class ReferenceDataService : IReferenceDataService
{
    private readonly string _connectionString;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ReferenceDataService> _logger;

    private const int CacheExpirationMinutes = 30;
    private const string CategoriesCacheKey = "categories";
    private const string RolesCacheKey = "roles";
    private const string LocationsCacheKey = "locations";
    private const string SkillsCacheKey = "skills";

    public ReferenceDataService(
        IConfiguration configuration,
        IMemoryCache cache,
        ILogger<ReferenceDataService> logger)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found.");
        _cache = cache;
        _logger = logger;
    }

    // TODO: Implement all methods
}
```

### 📋 Task 2D.2: Implement Categories Methods

**Time:** 4 דקות

**Add to ReferenceDataService:**

```csharp
public async Task<List<CategoryDto>> GetCategoriesAsync(bool includeSubCategories = true)
{
    return await _cache.GetOrCreateAsync(CategoriesCacheKey, async entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CacheExpirationMinutes);

        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            SELECT c.id, c.name, c.displayNameEn, c.displayNameHe, c.description,
                   c.parentCategoryId, c.sortOrder, c.isActive,
                   COUNT(r.id) as RoleCount
            FROM Categories c
            LEFT JOIN Roles r ON r.categoryId = c.id AND r.isActive = 1
            WHERE c.isActive = 1
            GROUP BY c.id, c.name, c.displayNameEn, c.displayNameHe, c.description,
                     c.parentCategoryId, c.sortOrder, c.isActive
            ORDER BY c.sortOrder, c.displayNameEn";

        var categories = await connection.QueryAsync<CategoryDto>(sql);
        var categoryList = categories.ToList();

        if (includeSubCategories)
        {
            // Build hierarchy
            var categoryMap = categoryList.ToDictionary(c => c.Id);
            var rootCategories = new List<CategoryDto>();

            foreach (var category in categoryList)
            {
                if (category.ParentCategoryId == null)
                {
                    rootCategories.Add(category);
                }
                else if (categoryMap.TryGetValue(category.ParentCategoryId.Value, out var parent))
                {
                    parent.SubCategories.Add(category);
                }
            }

            return rootCategories;
        }

        return categoryList;
    }) ?? new List<CategoryDto>();
}

public async Task<CategoryDto?> GetCategoryByIdAsync(Guid categoryId)
{
    var categories = await GetCategoriesAsync(false);
    return categories.FirstOrDefault(c => c.Id == categoryId);
}
```

### 📋 Task 2D.3: Implement Roles Methods

**Time:** 4 דקות

**Add to ReferenceDataService:**

```csharp
public async Task<List<RoleDto>> GetRolesAsync(RoleFilterRequest? filter = null)
{
    var cacheKey = $"{RolesCacheKey}_{filter?.CategoryId}_{filter?.ExperienceLevel}";

    return await _cache.GetOrCreateAsync(cacheKey, async entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CacheExpirationMinutes);

        using var connection = new SqlConnection(_connectionString);

        var sql = @"
            SELECT r.id, r.categoryId, c.displayNameEn as CategoryName,
                   r.name, r.displayNameEn, r.displayNameHe, r.description,
                   r.requiredSkills, r.salaryRangeMin, r.salaryRangeMax,
                   r.experienceLevel, r.sortOrder, r.isActive
            FROM Roles r
            INNER JOIN Categories c ON c.id = r.categoryId
            WHERE r.isActive = 1 AND c.isActive = 1";

        var parameters = new DynamicParameters();

        if (filter?.CategoryId.HasValue == true)
        {
            sql += " AND r.categoryId = @CategoryId";
            parameters.Add("CategoryId", filter.CategoryId.Value);
        }

        if (!string.IsNullOrEmpty(filter?.ExperienceLevel))
        {
            sql += " AND r.experienceLevel = @ExperienceLevel";
            parameters.Add("ExperienceLevel", filter.ExperienceLevel);
        }

        if (filter?.MinSalary.HasValue == true)
        {
            sql += " AND r.salaryRangeMin >= @MinSalary";
            parameters.Add("MinSalary", filter.MinSalary.Value);
        }

        if (filter?.MaxSalary.HasValue == true)
        {
            sql += " AND r.salaryRangeMax <= @MaxSalary";
            parameters.Add("MaxSalary", filter.MaxSalary.Value);
        }

        sql += " ORDER BY r.sortOrder, r.displayNameEn";

        var roles = await connection.QueryAsync<RoleDto>(sql, parameters);
        var rolesList = roles.ToList();

        // Parse required skills JSON
        foreach (var role in rolesList)
        {
            if (!string.IsNullOrEmpty(role.RequiredSkills.ToString()))
            {
                try
                {
                    var skillIds = JsonSerializer.Deserialize<List<Guid>>(role.RequiredSkills.ToString() ?? "[]");
                    role.RequiredSkillIds = skillIds ?? new List<Guid>();
                }
                catch
                {
                    role.RequiredSkillIds = new List<Guid>();
                }
            }
        }

        return rolesList;
    }) ?? new List<RoleDto>();
}

public async Task<List<RoleDto>> GetRolesByCategoryAsync(Guid categoryId, bool includeSkills = false)
{
    var filter = new RoleFilterRequest { CategoryId = categoryId, IncludeSkills = includeSkills };
    return await GetRolesAsync(filter);
}

public async Task<RoleDto?> GetRoleByIdAsync(Guid roleId, bool includeSkills = false)
{
    var roles = await GetRolesAsync();
    return roles.FirstOrDefault(r => r.Id == roleId);
}
```

### 📋 Task 2D.4: Implement Locations and Skills Methods (Basic)

**Time:** 4 דקות

**Add to ReferenceDataService:**

```csharp
public async Task<List<LocationDto>> GetLocationsAsync(LocationFilterRequest? filter = null)
{
    return await _cache.GetOrCreateAsync(LocationsCacheKey, async entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CacheExpirationMinutes);

        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            SELECT l.id, l.name, l.displayNameEn, l.displayNameHe,
                   l.locationType, l.parentLocationId, l.countryCode,
                   l.coordinates, l.timezone, l.sortOrder, l.isActive,
                   p.displayNameEn as ParentLocationName
            FROM Locations l
            LEFT JOIN Locations p ON p.id = l.parentLocationId
            WHERE l.isActive = 1
            ORDER BY l.sortOrder, l.displayNameEn";

        var locations = await connection.QueryAsync<LocationDto>(sql);
        return locations.ToList();
    }) ?? new List<LocationDto>();
}

public async Task<List<LocationDto>> GetLocationsByTypeAsync(string locationType)
{
    var locations = await GetLocationsAsync();
    return locations.Where(l => l.LocationType.Equals(locationType, StringComparison.OrdinalIgnoreCase)).ToList();
}

public async Task<List<LocationDto>> GetLocationsByParentAsync(Guid parentLocationId)
{
    var locations = await GetLocationsAsync();
    return locations.Where(l => l.ParentLocationId == parentLocationId).ToList();
}

public async Task<LocationDto?> GetLocationByIdAsync(Guid locationId, bool includeSubLocations = false)
{
    var locations = await GetLocationsAsync();
    return locations.FirstOrDefault(l => l.Id == locationId);
}

public async Task<List<SkillDto>> GetSkillsAsync(SkillFilterRequest? filter = null)
{
    return await _cache.GetOrCreateAsync(SkillsCacheKey, async entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CacheExpirationMinutes);

        using var connection = new SqlConnection(_connectionString);

        const string sql = @"
            SELECT s.id, s.categoryId, c.displayNameEn as CategoryName,
                   s.name, s.displayNameEn, s.displayNameHe, s.description,
                   s.skillType, s.proficiencyLevels, s.isPopular,
                   s.sortOrder, s.isActive
            FROM Skills s
            LEFT JOIN Categories c ON c.id = s.categoryId
            WHERE s.isActive = 1
            ORDER BY s.isPopular DESC, s.sortOrder, s.displayNameEn";

        var skills = await connection.QueryAsync<SkillDto>(sql);
        var skillsList = skills.ToList();

        // Parse proficiency levels JSON
        foreach (var skill in skillsList)
        {
            if (!string.IsNullOrEmpty(skill.ProficiencyLevels.ToString()))
            {
                try
                {
                    var levels = JsonSerializer.Deserialize<List<string>>(skill.ProficiencyLevels.ToString() ?? "[]");
                    skill.ProficiencyLevels = levels ?? new List<string>();
                }
                catch
                {
                    skill.ProficiencyLevels = new List<string> { "beginner", "intermediate", "advanced" };
                }
            }
        }

        return skillsList;
    }) ?? new List<SkillDto>();
}

public async Task<List<SkillDto>> GetSkillsByCategoryAsync(Guid categoryId)
{
    var skills = await GetSkillsAsync();
    return skills.Where(s => s.CategoryId == categoryId).ToList();
}

public async Task<List<SkillDto>> GetPopularSkillsAsync(int limit = 20)
{
    var skills = await GetSkillsAsync();
    return skills.Where(s => s.IsPopular).Take(limit).ToList();
}

public async Task<List<SkillDto>> SearchSkillsAsync(string searchTerm, int limit = 10)
{
    var skills = await GetSkillsAsync();
    return skills
        .Where(s => s.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                   s.DisplayNameEn.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
        .Take(limit)
        .ToList();
}

public async Task<SkillDto?> GetSkillByIdAsync(Guid skillId)
{
    var skills = await GetSkillsAsync();
    return skills.FirstOrDefault(s => s.Id == skillId);
}

public async Task<ReferenceDataResponse> GetAllReferenceDataAsync(ReferenceDataRequest request)
{
    var response = new ReferenceDataResponse();

    if (request.IncludeCategories)
        response.Categories = await GetCategoriesAsync(request.IncludeSubItems);

    if (request.IncludeRoles)
        response.Roles = await GetRolesAsync();

    if (request.IncludeLocations)
        response.Locations = await GetLocationsAsync();

    if (request.IncludeSkills)
        response.Skills = await GetSkillsAsync();

    return response;
}

public async Task RefreshCacheAsync()
{
    ClearCache();
    // Pre-warm cache
    await Task.WhenAll(
        GetCategoriesAsync(),
        GetRolesAsync(),
        GetLocationsAsync(),
        GetSkillsAsync()
    );
}

public void ClearCache()
{
    _cache.Remove(CategoriesCacheKey);
    _cache.Remove(RolesCacheKey);
    _cache.Remove(LocationsCacheKey);
    _cache.Remove(SkillsCacheKey);
}
```

---

## ⚪ Step 2E: Controller & Configuration (5 דקות)

### 📋 Task 2E.1: Create ReferenceController

**Time:** 3 דקות

**File:** `server/Controllers/ReferenceController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using Server.Models.DTOs;
using Server.Services.Interfaces;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReferenceController : ControllerBase
{
    private readonly IReferenceDataService _referenceDataService;

    public ReferenceController(IReferenceDataService referenceDataService)
    {
        _referenceDataService = referenceDataService;
    }

    [HttpGet("categories")]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetCategories(
        [FromQuery] bool includeSubCategories = true)
    {
        try
        {
            var categories = await _referenceDataService.GetCategoriesAsync(includeSubCategories);
            return Ok(new ApiResponse<List<CategoryDto>>
            {
                Success = true,
                Message = "Categories retrieved successfully",
                Data = categories
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<List<CategoryDto>>
            {
                Success = false,
                Message = "Failed to retrieve categories",
                Errors = [ex.Message]
            });
        }
    }

    [HttpGet("roles")]
    public async Task<ActionResult<ApiResponse<List<RoleDto>>>> GetRoles(
        [FromQuery] Guid? categoryId = null,
        [FromQuery] string? experienceLevel = null,
        [FromQuery] bool includeSkills = false)
    {
        try
        {
            var filter = new RoleFilterRequest
            {
                CategoryId = categoryId,
                ExperienceLevel = experienceLevel,
                IncludeSkills = includeSkills
            };

            var roles = await _referenceDataService.GetRolesAsync(filter);
            return Ok(new ApiResponse<List<RoleDto>>
            {
                Success = true,
                Message = "Roles retrieved successfully",
                Data = roles
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<List<RoleDto>>
            {
                Success = false,
                Message = "Failed to retrieve roles",
                Errors = [ex.Message]
            });
        }
    }

    [HttpGet("locations")]
    public async Task<ActionResult<ApiResponse<List<LocationDto>>>> GetLocations()
    {
        try
        {
            var locations = await _referenceDataService.GetLocationsAsync();
            return Ok(new ApiResponse<List<LocationDto>>
            {
                Success = true,
                Message = "Locations retrieved successfully",
                Data = locations
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<List<LocationDto>>
            {
                Success = false,
                Message = "Failed to retrieve locations",
                Errors = [ex.Message]
            });
        }
    }

    [HttpGet("skills")]
    public async Task<ActionResult<ApiResponse<List<SkillDto>>>> GetSkills(
        [FromQuery] Guid? categoryId = null,
        [FromQuery] bool popularOnly = false,
        [FromQuery] string? search = null,
        [FromQuery] int limit = 50)
    {
        try
        {
            List<SkillDto> skills;

            if (!string.IsNullOrEmpty(search))
            {
                skills = await _referenceDataService.SearchSkillsAsync(search, limit);
            }
            else if (popularOnly)
            {
                skills = await _referenceDataService.GetPopularSkillsAsync(limit);
            }
            else if (categoryId.HasValue)
            {
                skills = await _referenceDataService.GetSkillsByCategoryAsync(categoryId.Value);
            }
            else
            {
                var filter = new SkillFilterRequest { Limit = limit };
                skills = await _referenceDataService.GetSkillsAsync(filter);
            }

            return Ok(new ApiResponse<List<SkillDto>>
            {
                Success = true,
                Message = "Skills retrieved successfully",
                Data = skills
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<List<SkillDto>>
            {
                Success = false,
                Message = "Failed to retrieve skills",
                Errors = [ex.Message]
            });
        }
    }

    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<ReferenceDataResponse>>> GetAllReferenceData()
    {
        try
        {
            var request = new ReferenceDataRequest();
            var data = await _referenceDataService.GetAllReferenceDataAsync(request);

            return Ok(new ApiResponse<ReferenceDataResponse>
            {
                Success = true,
                Message = "Reference data retrieved successfully",
                Data = data
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<ReferenceDataResponse>
            {
                Success = false,
                Message = "Failed to retrieve reference data",
                Errors = [ex.Message]
            });
        }
    }

    [HttpPost("refresh-cache")]
    public async Task<ActionResult<ApiResponse<bool>>> RefreshCache()
    {
        try
        {
            await _referenceDataService.RefreshCacheAsync();
            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Message = "Cache refreshed successfully",
                Data = true
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = "Failed to refresh cache",
                Errors = [ex.Message]
            });
        }
    }
}
```

### 📋 Task 2E.2: Update Program.cs

**Time:** 2 דקות

**Update:** `server/Program.cs`

```csharp
// Add after existing services
builder.Services.AddScoped<IReferenceDataService, ReferenceDataService>();

// Add memory caching
builder.Services.AddMemoryCache();
```

---

## 🎯 Success Criteria

### ✅ Database:

- [ ] All reference tables created successfully
- [ ] Indexes created and working
- [ ] Foreign key relationships established

### ✅ Code Structure:

- [ ] All reference DTOs created
- [ ] Service interface complete
- [ ] Service implementation with caching
- [ ] Controller with all endpoints
- [ ] Program.cs updated

### ✅ Functionality:

- [ ] Can retrieve categories with hierarchy
- [ ] Can filter roles by category/experience
- [ ] Can retrieve locations with parent relationships
- [ ] Can search and filter skills
- [ ] Combined endpoint works
- [ ] Caching works correctly
- [ ] All endpoints respond via Swagger

---

**Ready for Phase 3: Data Seeding & Testing**
