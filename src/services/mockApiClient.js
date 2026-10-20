import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MSSV, DEFAULT_MOCKAPI_URL, STORAGE_KEYS, API_ENDPOINTS } from '../config/constants';

let currentBaseUrl = DEFAULT_MOCKAPI_URL;

const axiosInstance = axios.create({
  baseURL: currentBaseUrl,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const mockApiClient = {
  /**
   * Khởi tạo và nạp Base URL nếu người dùng đã lưu
   */
  init: async () => {
    try {
      const savedUrl = await AsyncStorage.getItem(STORAGE_KEYS.API_BASE_URL);
      if (savedUrl) {
        currentBaseUrl = savedUrl;
        axiosInstance.defaults.baseURL = savedUrl;
      }
    } catch (e) {
      console.warn('[MockAPI Init]:', e);
    }
  },

  getBaseUrl: () => currentBaseUrl,

  setBaseUrl: async (url) => {
    const cleanUrl = url ? url.trim() : DEFAULT_MOCKAPI_URL;
    currentBaseUrl = cleanUrl;
    axiosInstance.defaults.baseURL = cleanUrl;
    await AsyncStorage.setItem(STORAGE_KEYS.API_BASE_URL, cleanUrl);
  },

  // ================= REMOTE API DISH OPERATIONS =================

  /**
   * Lấy danh sách món từ MockAPI
   */
  fetchDishes: async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.DISH);
      return res.data;
    } catch (err) {
      console.warn('[MockAPI fetchDishes]:', err.message);
      throw err;
    }
  },

  /**
   * Tạo mới món ăn trên MockAPI (POST)
   */
  createDishRemote: async (dishData) => {
    try {
      const payload = dishData.toJSON ? dishData.toJSON() : dishData;
      // Khi gửi lên server, loại bỏ ID local nếu có tiền tố local_
      const postBody = { ...payload };
      if (String(postBody[`${MSSV}_Id`]).startsWith('local_')) {
        delete postBody[`${MSSV}_Id`];
      }
      postBody[`${MSSV}_SyncStatus`] = SYNC_STATUS.SYNCED;

      const res = await axiosInstance.post(API_ENDPOINTS.DISH, postBody);
      return res.data;
    } catch (err) {
      console.warn('[MockAPI createDishRemote]:', err.message);
      throw err;
    }
  },

  /**
   * Cập nhật món ăn trên MockAPI (PUT)
   */
  updateDishRemote: async (id, dishData) => {
    try {
      const payload = dishData.toJSON ? dishData.toJSON() : dishData;
      const putBody = { ...payload };
      putBody[`${MSSV}_SyncStatus`] = SYNC_STATUS.SYNCED;
      const res = await axiosInstance.put(`${API_ENDPOINTS.DISH}/${id}`, putBody);
      return res.data;
    } catch (err) {
      console.warn('[MockAPI updateDishRemote]:', err.message);
      throw err;
    }
  },

  /**
   * Xóa món ăn trên MockAPI (DELETE)
   */
  deleteDishRemote: async (id) => {
    try {
      const res = await axiosInstance.delete(`${API_ENDPOINTS.DISH}/${id}`);
      return res.data;
    } catch (err) {
      console.warn('[MockAPI deleteDishRemote]:', err.message);
      throw err;
    }
  },

  // ================= REMOTE API CATEGORY OPERATIONS =================

  /**
   * Lấy danh sách danh mục từ MockAPI
   */
  fetchCategories: async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.DISH_CATEGORY);
      return res.data;
    } catch (err) {
      console.warn('[MockAPI fetchCategories]:', err.message);
      throw err;
    }
  },

  /**
   * Tạo mới danh mục trên MockAPI (POST)
   */
  createCategoryRemote: async (categoryData) => {
    try {
      const payload = categoryData.toJSON ? categoryData.toJSON() : categoryData;
      const postBody = { ...payload };
      if (String(postBody[`${MSSV}_Id`]).startsWith('local_') || String(postBody[`${MSSV}_Id`]).includes('_cat_')) {
        delete postBody[`${MSSV}_Id`];
      }
      postBody[`${MSSV}_SyncStatus`] = SYNC_STATUS.SYNCED;

      const res = await axiosInstance.post(API_ENDPOINTS.DISH_CATEGORY, postBody);
      return res.data;
    } catch (err) {
      console.warn('[MockAPI createCategoryRemote]:', err.message);
      throw err;
    }
  },

  /**
   * Cập nhật danh mục trên MockAPI (PUT)
   */
  updateCategoryRemote: async (id, categoryData) => {
    try {
      const payload = categoryData.toJSON ? categoryData.toJSON() : categoryData;
      const putBody = { ...payload };
      putBody[`${MSSV}_SyncStatus`] = SYNC_STATUS.SYNCED;
      const res = await axiosInstance.put(`${API_ENDPOINTS.DISH_CATEGORY}/${id}`, putBody);
      return res.data;
    } catch (err) {
      console.warn('[MockAPI updateCategoryRemote]:', err.message);
      throw err;
    }
  },

  /**
   * Xóa danh mục trên MockAPI (DELETE)
   */
  deleteCategoryRemote: async (id) => {
    try {
      const res = await axiosInstance.delete(`${API_ENDPOINTS.DISH_CATEGORY}/${id}`);
      return res.data;
    } catch (err) {
      console.warn('[MockAPI deleteCategoryRemote]:', err.message);
      throw err;
    }
  },
};

export default mockApiClient;
