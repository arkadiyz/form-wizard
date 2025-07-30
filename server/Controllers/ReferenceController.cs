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
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> getCategories()
    {
        try
        {
            var categories = await _referenceDataService.getCategoriesAsync();
            return Ok(new ApiResponse<List<CategoryDto>>
            {
                success = true,
                message = "Categories retrieved successfully",
                data = categories
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<List<CategoryDto>>
            {
                success = false,
                message = "Failed to retrieve categories",
                errors = [ex.Message]
            });
        }
    }

    [HttpGet("roles")]
    public async Task<ActionResult<ApiResponse<List<RoleDto>>>> getRoles(
        [FromQuery] Guid? categoryId = null)
    {
        try
        {
            var filter = new RoleFilterRequest { categoryId = categoryId };
            var roles = await _referenceDataService.getRolesAsync(filter);
            
            return Ok(new ApiResponse<List<RoleDto>>
            {
                success = true,
                message = "Roles retrieved successfully",
                data = roles
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<List<RoleDto>>
            {
                success = false,
                message = "Failed to retrieve roles",
                errors = [ex.Message]
            });
        }
    }

    [HttpGet("locations")]
    public async Task<ActionResult<ApiResponse<List<LocationDto>>>> getLocations()
    {
        try
        {
            var locations = await _referenceDataService.getLocationsAsync();
            return Ok(new ApiResponse<List<LocationDto>>
            {
                success = true,
                message = "Locations retrieved successfully",
                data = locations
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<List<LocationDto>>
            {
                success = false,
                message = "Failed to retrieve locations",
                errors = [ex.Message]
            });
        }
    }

    [HttpGet("skills")]
    public async Task<ActionResult<ApiResponse<List<SkillDto>>>> getSkills(
        [FromQuery] Guid? categoryId = null,
        [FromQuery] string? search = null,
        [FromQuery] int limit = 50)
    {
        try
        {
            var filter = new SkillFilterRequest
            {
                categoryId = categoryId,
                searchTerm = search,
                limit = limit
            };
            
            var skills = await _referenceDataService.getSkillsAsync(filter);
            return Ok(new ApiResponse<List<SkillDto>>
            {
                success = true,
                message = "Skills retrieved successfully",
                data = skills
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<List<SkillDto>>
            {
                success = false,
                message = "Failed to retrieve skills",
                errors = [ex.Message]
            });
        }
    }

    [HttpGet("skills-categories")]
    public async Task<ActionResult<ApiResponse<List<SkillsCategoryDto>>>> getSkillsCategories()
    {
        try
        {
            var skillsCategories = await _referenceDataService.getSkillsCategoriesAsync();
            return Ok(new ApiResponse<List<SkillsCategoryDto>>
            {
                success = true,
                message = "Skills categories retrieved successfully",
                data = skillsCategories
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<List<SkillsCategoryDto>>
            {
                success = false,
                message = "Failed to retrieve skills categories",
                errors = [ex.Message]
            });
        }
    }

    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<ReferenceDataResponse>>> getAllReferenceData()
    {
        try
        {
            var request = new ReferenceDataRequest();
            var data = await _referenceDataService.getAllReferenceDataAsync(request);

            return Ok(new ApiResponse<ReferenceDataResponse>
            {
                success = true,
                message = "Reference data retrieved successfully",
                data = data
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<ReferenceDataResponse>
            {
                success = false,
                message = "Failed to retrieve reference data",
                errors = [ex.Message]
            });
        }
    }

    [HttpPost("refresh-cache")]
    public async Task<ActionResult<ApiResponse<bool>>> refreshCache()
    {
        try
        {
            await _referenceDataService.refreshCacheAsync();
            return Ok(new ApiResponse<bool>
            {
                success = true,
                message = "Cache refreshed successfully",
                data = true
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<bool>
            {
                success = false,
                message = "Failed to refresh cache",
                errors = [ex.Message]
            });
        }
    }
}