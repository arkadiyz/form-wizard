import { httpService } from './http.service';

// API Response Types
interface ApiResponseItem {
  id: string;
  name: string;
  categoryId?: string;
  category?: string;
  skillCategoryId?: string;
}

export interface CategoryOption {
  id: string;
  label: string;
  value: string;
}

export interface RoleOption {
  id: string;
  label: string;
  value: string;
  categoryId: string;
}

export interface LocationOption {
  id: string;
  label: string;
  value: string;
}

export interface SkillOption {
  id: string;
  label: string;
  value: string;
  category: 'mandatory' | 'advantage';
  skillCategoryId?: string;
}

export const referenceDataService = {
  // Search roles by categories and text
  searchRolesByCategoriesAndText: async (
    categoryIds: string[],
    searchText: string = '',
  ): Promise<RoleOption[]> => {
    try {
      const requestBody = {
        categoryIds,
        searchText: searchText.trim(),
      };

      const response = await httpService.post('/reference/roles/search', requestBody);
      return response.data.map((item: ApiResponseItem) => ({
        id: item.id,
        label: item.name,
        value: item.id,
        categoryId: item.categoryId || '',
      }));
    } catch (error) {
      throw new Error('Failed to search roles');
    }
  },

  // Get all categories
  getCategories: async (): Promise<CategoryOption[]> => {
    try {
      const response = await httpService.get<{ data: ApiResponseItem[] }>('/reference/categories');

      return response.data.map((item: ApiResponseItem) => ({
        id: item.id,
        label: item.name,
        value: item.id,
      }));
    } catch (error) {
      throw new Error('Failed to load categories');
    }
  },

  // Get roles by multiple categories
  getRolesByCategories: async (categoryIds: string[]): Promise<RoleOption[]> => {
    try {
      // If no categories provided, get all roles
      if (categoryIds.length === 0) {
        const response = await httpService.get<{ data: ApiResponseItem[] }>('/reference/roles');

        return response.data.map((item: ApiResponseItem) => ({
          id: item.id,
          label: item.name,
          value: item.id,
          categoryId: item.categoryId || '',
        }));
      }

      // Call API for each category and combine results
      const rolePromises = categoryIds.map((categoryId) => {
        return httpService.get<{ data: ApiResponseItem[] }>(`/reference/roles/${categoryId}`);
      });

      const responses = await Promise.all(rolePromises);

      // Combine all roles and remove duplicates
      const allRoles: RoleOption[] = [];
      const seenIds = new Set<string>();

      responses.forEach((response, index) => {
        response.data.forEach((item: ApiResponseItem) => {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            allRoles.push({
              id: item.id,
              label: item.name,
              value: item.id,
              categoryId: item.categoryId || categoryIds[index],
            });
          }
        });
      });

      return allRoles;
    } catch (error) {
      throw new Error('Failed to load roles');
    }
  },

  // Get roles by category
  getRolesByCategory: async (categoryId: string): Promise<RoleOption[]> => {
    try {
      const response = await httpService.get<{ data: ApiResponseItem[] }>(
        `/reference/roles/${categoryId}`,
      );

      return response.data.map((item: ApiResponseItem) => ({
        id: item.id,
        label: item.name,
        value: item.id,
        categoryId: item.categoryId || categoryId,
      }));
    } catch (error) {
      throw new Error('Failed to load roles');
    }
  },

  // Get all locations
  getLocations: async (): Promise<LocationOption[]> => {
    try {
      const response = await httpService.get<{ data: ApiResponseItem[] }>('/reference/locations');

      return response.data.map((item: ApiResponseItem) => ({
        id: item.id,
        label: item.name,
        value: item.id,
      }));
    } catch (error) {
      throw new Error('Failed to load locations');
    }
  },

  // Get skills by category
  getSkillsByCategory: async (skillCategoryId?: string): Promise<SkillOption[]> => {
    try {
      const url = skillCategoryId ? `/reference/skills/${skillCategoryId}` : '/reference/skills';
      const response = await httpService.get<{ data: ApiResponseItem[] }>(url);

      const mappedSkills = response.data.map((item: ApiResponseItem) => ({
        id: item.id,
        label: item.name,
        value: item.id,
        category: (item.category as 'mandatory' | 'advantage') || 'advantage',
        skillCategoryId: item.skillCategoryId,
      }));

      return mappedSkills;
    } catch (error) {
      throw new Error('Failed to load skills');
    }
  },
};
