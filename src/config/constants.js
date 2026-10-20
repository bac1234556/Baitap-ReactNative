/**
 * CẤU HÌNH HỆ THỐNG VÀ TIỀN TỐ MSSV BẮT BUỘC
 * Mã sinh viên: BIT240036
 * Tên sinh viên: Lê Việt Bắc
 */

export const MSSV = 'BIT240036';

// Khóa lưu trữ Local Storage (AsyncStorage)
export const STORAGE_KEYS = {
  CATEGORIES: `@${MSSV}_DishCategory_table`,
  DISHES: `@${MSSV}_Dish_table`,
  LANGUAGE: `@${MSSV}_App_Language`,
  API_BASE_URL: `@${MSSV}_Api_Base_Url`,
};

// Trạng thái đồng bộ Offline-First
export const SYNC_STATUS = {
  SYNCED: 'synced',
  PENDING_CREATE: 'pending_create',
  PENDING_UPDATE: 'pending_update',
  PENDING_DELETE: 'pending_delete',
};

// Ngưỡng phân loại thời gian chế biến (phút)
export const PREPARATION_SPEED_THRESHOLD = 15; // <= 15m là Quick, > 15m là Regular

// Endpoint mặc định MockAPI.io (Có thể tùy biến trong màn hình Cài đặt)
export const DEFAULT_MOCKAPI_URL = 'https://6ad73db795e98f36aef21aca.mockapi.io/api/v1';

/**
 * CẤU HÌNH 2 RESOURCE RIÊNG BIỆT TRÊN MOCKAPI.IO:
 * 1. BIT240036_DishCategory (Quản lý Danh mục món ăn)
 * 2. BIT240036_Dish (Quản lý Món ăn)
 */
export const API_ENDPOINTS = {
  DISH: `/${MSSV}_Dish`,
  DISH_CATEGORY: `/${MSSV}_DishCategory`,
};

// Ảnh mặc định khi link ảnh người dùng nhập bị lỗi / broken
export const FALLBACK_IMAGE_URL =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
