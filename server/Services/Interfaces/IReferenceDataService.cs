using Server.Models.DTOs;

namespace Server.Services.Interfaces;

public interface IReferenceDataService
{
    // Task<bool> isEmailAvailableAsync(string email);

    // Categories
    Task<List<CategoryDto>> getCategoriesAsync();
    Task<CategoryDto?> getCategoryByIdAsync(Guid categoryId);

    // Roles
    Task<List<RoleDto>> getRolesAsync(RoleFilterRequest? filter = null);
    Task<List<RoleDto>> getRolesByCategoryAsync(Guid categoryId);
    Task<RoleDto?> getRoleByIdAsync(Guid roleId);

    // Locations
    Task<List<LocationDto>> getLocationsAsync(LocationFilterRequest? filter = null);
    Task<LocationDto?> getLocationByIdAsync(Guid locationId);

    // Skills
    Task<List<SkillDto>> getSkillsAsync(SkillFilterRequest? filter = null);
    Task<List<SkillDto>> getSkillsByCategoryAsync(Guid categoryId);
    Task<SkillDto?> getSkillByIdAsync(Guid skillId);

    // Skills Categories
    Task<List<SkillsCategoryDto>> getSkillsCategoriesAsync();
    Task<SkillsCategoryDto?> getSkillsCategoryByIdAsync(Guid categoryId);

    // Combined
    Task<ReferenceDataResponse> getAllReferenceDataAsync(ReferenceDataRequest request);

    // Cache management
    Task refreshCacheAsync();
    void clearCache();

}