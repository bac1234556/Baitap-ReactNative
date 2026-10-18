import apiClient from './client';

let localCategories = [
  { id: '1', name: 'Lập trình Web', description: 'HTML, CSS, JavaScript, ReactJS, NodeJS' },
  { id: '2', name: 'Lập trình Di động', description: 'React Native, Flutter, iOS, Android' },
  { id: '3', name: 'Trí tuệ nhân tạo (AI)', description: 'Machine Learning, Deep Learning, Prompt Engineering' },
];

/**
 * Service quản lý Danh mục (Categories) kết nối MockAPI.io (kèm Fallback khi MockAPI chưa tạo Resource)
 */
export const categoryService = {
  /**
   * Lấy danh sách tất cả danh mục
   * @returns {Promise<Array>}
   */
  getCategories: async () => {
    try {
      return await apiClient.get('/categories');
    } catch (err) {
      if (err.message?.includes('404')) {
        console.warn('[MockAPI] Resource /categories chưa có trên MockAPI. Sử dụng dữ liệu mẫu.');
        return localCategories;
      }
      throw err;
    }
  },

  /**
   * Lấy chi tiết danh mục theo id
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  getCategoryById: async (id) => {
    try {
      return await apiClient.get(`/categories/${id}`);
    } catch (err) {
      if (err.message?.includes('404')) {
        return localCategories.find((c) => String(c.id) === String(id)) || null;
      }
      throw err;
    }
  },

  /**
   * Tạo danh mục mới
   * @param {Object} data { name, description }
   * @returns {Promise<Object>}
   */
  createCategory: async (data) => {
    try {
      return await apiClient.post('/categories', data);
    } catch (err) {
      if (err.message?.includes('404')) {
        const newCat = { ...data, id: Date.now().toString() };
        localCategories.push(newCat);
        return newCat;
      }
      throw err;
    }
  },

  /**
   * Cập nhật thông tin danh mục
   * @param {string|number} id
   * @param {Object} data { name, description }
   * @returns {Promise<Object>}
   */
  updateCategory: async (id, data) => {
    try {
      return await apiClient.put(`/categories/${id}`, data);
    } catch (err) {
      if (err.message?.includes('404')) {
        localCategories = localCategories.map((c) => (String(c.id) === String(id) ? { ...c, ...data } : c));
        return { ...data, id };
      }
      throw err;
    }
  },

  /**
   * Xóa danh mục theo id
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  deleteCategory: async (id) => {
    try {
      return await apiClient.delete(`/categories/${id}`);
    } catch (err) {
      if (err.message?.includes('404')) {
        localCategories = localCategories.filter((c) => String(c.id) !== String(id));
        return { success: true };
      }
      throw err;
    }
  },
};

export default categoryService;
