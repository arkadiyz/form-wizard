using Dapper;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Data.SqlClient;
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
    private const string SkillsCategoriesCacheKey = "skillsCategories";

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

    // Categories
    public async Task<List<CategoryDto>> getCategoriesAsync()
    {
        return await _cache.GetOrCreateAsync(CategoriesCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CacheExpirationMinutes);

            using var connection = new SqlConnection(_connectionString);
            const string sql = "SELECT id, name, createdAt FROM Categories ORDER BY name";

            var categories = await connection.QueryAsync<CategoryDto>(sql);
            return categories.ToList();
        }) ?? new List<CategoryDto>();
    }

    public async Task<CategoryDto?> getCategoryByIdAsync(Guid categoryId)
    {
        var categories = await getCategoriesAsync();
        return categories.FirstOrDefault(c => c.id == categoryId);
    }

    // Roles
    public async Task<List<RoleDto>> getRolesAsync(RoleFilterRequest? filter = null)
    {
        var cacheKey = $"{RolesCacheKey}_{filter?.categoryId}";

        return await _cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CacheExpirationMinutes);

            using var connection = new SqlConnection(_connectionString);
            var sql = "SELECT id, categoryId, name, createdAt FROM Roles WHERE 1=1";
            var parameters = new DynamicParameters();

            if (filter?.categoryId.HasValue == true)
            {
                sql += " AND categoryId = @categoryId";
                parameters.Add("categoryId", filter.categoryId.Value);
            }

            sql += " ORDER BY name";

            var roles = await connection.QueryAsync<RoleDto>(sql, parameters);
            return roles.ToList();
        }) ?? new List<RoleDto>();
    }

    public async Task<List<RoleDto>> getRolesByCategoryAsync(Guid categoryId)
    {
        var filter = new RoleFilterRequest { categoryId = categoryId };
        return await getRolesAsync(filter);
    }

    public async Task<RoleDto?> getRoleByIdAsync(Guid roleId)
    {
        var roles = await getRolesAsync();
        return roles.FirstOrDefault(r => r.id == roleId);
    }

    // Locations
    public async Task<List<LocationDto>> getLocationsAsync(LocationFilterRequest? filter = null)
    {
        return await _cache.GetOrCreateAsync(LocationsCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CacheExpirationMinutes);

            using var connection = new SqlConnection(_connectionString);
            const string sql = "SELECT id, name, createdAt FROM Locations ORDER BY name";

            var locations = await connection.QueryAsync<LocationDto>(sql);
            return locations.ToList();
        }) ?? new List<LocationDto>();
    }

    public async Task<LocationDto?> getLocationByIdAsync(Guid locationId)
    {
        var locations = await getLocationsAsync();
        return locations.FirstOrDefault(l => l.id == locationId);
    }

    // Skills
    public async Task<List<SkillDto>> getSkillsAsync(SkillFilterRequest? filter = null)
    {
        var cacheKey = $"{SkillsCacheKey}_{filter?.categoryId}_{filter?.searchTerm}";

        return await _cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CacheExpirationMinutes);

            using var connection = new SqlConnection(_connectionString);
            var sql = "SELECT id, categoryId, name, createdAt FROM Skills WHERE 1=1";
            var parameters = new DynamicParameters();

            if (filter?.categoryId.HasValue == true)
            {
                sql += " AND categoryId = @categoryId";
                parameters.Add("categoryId", filter.categoryId.Value);
            }

            if (!string.IsNullOrEmpty(filter?.searchTerm))
            {
                sql += " AND name LIKE @searchTerm";
                parameters.Add("searchTerm", $"%{filter.searchTerm}%");
            }

            sql += " ORDER BY name";

            if (filter?.limit.HasValue == true)
            {
                sql = $"SELECT TOP ({filter.limit.Value}) * FROM ({sql}) AS LimitedResults";
            }

            var skills = await connection.QueryAsync<SkillDto>(sql, parameters);
            return skills.ToList();
        }) ?? new List<SkillDto>();
    }

    public async Task<List<SkillDto>> getSkillsByCategoryAsync(Guid categoryId)
    {
        var filter = new SkillFilterRequest { categoryId = categoryId };
        return await getSkillsAsync(filter);
    }

    public async Task<SkillDto?> getSkillByIdAsync(Guid skillId)
    {
        var skills = await getSkillsAsync();
        return skills.FirstOrDefault(s => s.id == skillId);
    }

    // Skills Categories
    public async Task<List<SkillsCategoryDto>> getSkillsCategoriesAsync()
    {
        return await _cache.GetOrCreateAsync(SkillsCategoriesCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CacheExpirationMinutes);

            using var connection = new SqlConnection(_connectionString);
            const string sql = "SELECT id, name, createdAt FROM SkillsCategories ORDER BY name";

            var skillsCategories = await connection.QueryAsync<SkillsCategoryDto>(sql);
            return skillsCategories.ToList();
        }) ?? new List<SkillsCategoryDto>();
    }

    public async Task<SkillsCategoryDto?> getSkillsCategoryByIdAsync(Guid categoryId)
    {
        var skillsCategories = await getSkillsCategoriesAsync();
        return skillsCategories.FirstOrDefault(sc => sc.id == categoryId);
    }

    // Combined
    public async Task<ReferenceDataResponse> getAllReferenceDataAsync(ReferenceDataRequest request)
    {
        var response = new ReferenceDataResponse();

        if (request.includeCategories)
            response.categories = await getCategoriesAsync();

        if (request.includeRoles)
            response.roles = await getRolesAsync();

        if (request.includeLocations)
            response.locations = await getLocationsAsync();

        if (request.includeSkills)
            response.skills = await getSkillsAsync();

        if (request.includeSkillsCategories)
            response.skillsCategories = await getSkillsCategoriesAsync();

        return response;
    }

    // Cache management
    public async Task refreshCacheAsync()
    {
        clearCache();
        // Pre-warm cache
        await Task.WhenAll(
            getCategoriesAsync(),
            getRolesAsync(),
            getLocationsAsync(),
            getSkillsAsync(),
            getSkillsCategoriesAsync()
        );
    }

    public void clearCache()
    {
        _cache.Remove(CategoriesCacheKey);
        _cache.Remove(RolesCacheKey);
        _cache.Remove(LocationsCacheKey);
        _cache.Remove(SkillsCacheKey);
        _cache.Remove(SkillsCategoriesCacheKey);
    }


}