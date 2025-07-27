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
                if (!string.IsNullOrEmpty(role.RequiredSkills?.ToString()))
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
                if (!string.IsNullOrEmpty(skill.ProficiencyLevels?.ToString()))
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
}