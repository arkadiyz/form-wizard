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

      console.log('🔍 Searching roles with:', requestBody);
      const response = await httpService.post('/reference/roles/search', requestBody);
      return response.data.map((item: ApiResponseItem) => ({
        id: item.id,
        label: item.name,
        value: item.id,
        categoryId: item.categoryId || '',
      }));
    } catch (error) {
      console.error('❌ Error searching roles:', error);
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
      console.error('Error fetching categories:', error);
      throw new Error('Failed to load categories');
    }
  },

  // Get roles by multiple categories
  getRolesByCategories: async (categoryIds: string[]): Promise<RoleOption[]> => {
    try {
      console.log('🔍 getRolesByCategories called with:', categoryIds);

      // If no categories provided, get all roles
      if (categoryIds.length === 0) {
        console.log('🔍 No categories provided, getting all roles');
        const response = await httpService.get<{ data: ApiResponseItem[] }>('/reference/roles');
        console.log('📥 Got all roles response:', response.data.length);

        return response.data.map((item: ApiResponseItem) => ({
          id: item.id,
          label: item.name,
          value: item.id,
          categoryId: item.categoryId || '',
        }));
      }

      // Call API for each category and combine results
      const rolePromises = categoryIds.map((categoryId) => {
        console.log('🔍 Making API call for category:', categoryId);
        return httpService.get<{ data: ApiResponseItem[] }>(`/reference/roles/${categoryId}`);
      });

      const responses = await Promise.all(rolePromises);
      console.log('📥 Got responses:', responses.length);

      // Combine all roles and remove duplicates
      const allRoles: RoleOption[] = [];
      const seenIds = new Set<string>();

      responses.forEach((response, index) => {
        console.log(`📥 Response ${index} has ${response.data.length} roles`);
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

      console.log('📤 Final combined roles:', allRoles.length);
      return allRoles;
    } catch (error) {
      console.error('❌ Error fetching roles for multiple categories:', error);
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
      console.error('Error fetching roles:', error);
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
      console.error('Error fetching locations:', error);
      throw new Error('Failed to load locations');
    }
  },

  // Get skills by category
  getSkillsByCategory: async (skillCategoryId?: string): Promise<SkillOption[]> => {
    try {
      // Debug: let's see what URL we're calling and what we get back
      const url = skillCategoryId ? `/reference/skills/${skillCategoryId}` : '/reference/skills';
      console.log('🔍 Calling skills API:', url);

      const response = await httpService.get<{ data: ApiResponseItem[] }>(url);
      console.log('📥 Skills API response:', response);
      console.log('📥 First skill example:', response.data[0]);

      const mappedSkills = response.data.map((item: ApiResponseItem) => ({
        id: item.id,
        label: item.name,
        value: item.id,
        category: (item.category as 'mandatory' | 'advantage') || 'advantage',
        skillCategoryId: item.skillCategoryId,
      }));

      console.log('📤 Mapped skills example:', mappedSkills[0]);
      console.log('📊 Categories found:', [...new Set(response.data.map((s) => s.category))]);

      return mappedSkills;
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw new Error('Failed to load skills');
    }
  },
};
