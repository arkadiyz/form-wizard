using Server.Models.DTOs;

namespace Server.Services.Interfaces;

public interface IReferenceDataService
{
    // Categories
    Task<List<CategoryDto>> getCategoriesAsync(bool includeSubCategories = true);
    Task<CategoryDto?> getCategoryByIdAsync(Guid categoryId);

    // Roles
    Task<List<RoleDto>> getRolesAsync(RoleFilterRequest? filter = null);
    Task<List<RoleDto>> getRolesByCategoryAsync(Guid categoryId, bool includeSkills = false);
    Task<RoleDto?> getRoleByIdAsync(Guid roleId, bool includeSkills = false);

    // Locations
    Task<List<LocationDto>> getLocationsAsync(LocationFilterRequest? filter = null);
    Task<List<LocationDto>> getLocationsByTypeAsync(string locationType);
    Task<List<LocationDto>> getLocationsByParentAsync(Guid parentLocationId);
    Task<LocationDto?> getLocationByIdAsync(Guid locationId, bool includeSubLocations = false);

    // Skills
    Task<List<SkillDto>> getSkillsAsync(SkillFilterRequest? filter = null);
    Task<List<SkillDto>> getSkillsByCategoryAsync(Guid categoryId);
    Task<List<SkillDto>> getPopularSkillsAsync(int limit = 20);
    Task<List<SkillDto>> searchSkillsAsync(string searchTerm, int limit = 10);
    Task<SkillDto?> getSkillByIdAsync(Guid skillId);

    // Combined
    Task<ReferenceDataResponse> getAllReferenceDataAsync(ReferenceDataRequest request);

    // Cache management
    Task refreshCacheAsync();
    void clearCache();
}