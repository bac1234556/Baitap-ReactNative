import AsyncStorage from '@react-native-async-storage/async-storage';
import { MSSV, STORAGE_KEYS, SYNC_STATUS } from '../config/constants';
import DishCategory from '../models/DishCategory';
import Dish from '../models/Dish';
import DishImage from '../models/DishImage';

// DỮ LIỆU KHỞI TẠO MẪU (SEED DATA: Tối thiểu 3 categories & 5 dishes)
export const INITIAL_CATEGORIES = [
  new DishCategory({
    id: `${MSSV}_cat_1`,
    name: 'Món khai vị',
    description: 'Các món súp, salad và món cuốn kích thích vị giác trước bữa ăn',
  }),
  new DishCategory({
    id: `${MSSV}_cat_2`,
    name: 'Món chính',
    description: 'Các món cơm, phở, bún, bò và món mặn truyền thống đậm đà',
  }),
  new DishCategory({
    id: `${MSSV}_cat_3`,
    name: 'Tráng miệng & Đồ uống',
    description: 'Chè cung đình, hoa quả thanh mát, trà thảo mộc và nước ép tươi',
  }),
];

export const INITIAL_DISHES = [
  new Dish({
    id: `${MSSV}_dish_1`,
    name: 'Phở Bò Tái Nạm',
    price: 65000,
    preparationTime: 10, // <= 15m -> Quick
    isAvailable: true,
    description: 'Nước dùng ninh xương bò nguyên chất 12 giờ, ăn kèm bánh phở mềm và thịt bò tươi ngon.',
    dishCategoryId: `${MSSV}_cat_2`,
    syncStatus: SYNC_STATUS.SYNCED,
    images: [
      new DishImage({
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
        isThumbnail: true,
      }),
      new DishImage({
        imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80',
        isThumbnail: false,
      }),
    ],
  }),
  new Dish({
    id: `${MSSV}_dish_2`,
    name: 'Bún Chả Hà Nội',
    price: 55000,
    preparationTime: 20, // > 15m -> Regular
    isAvailable: true,
    description: 'Chả băm nướng than hoa thơm lừng, nước mắm pha chua ngọt gia truyền và bún rối trắng.',
    dishCategoryId: `${MSSV}_cat_2`,
    syncStatus: SYNC_STATUS.SYNCED,
    images: [
      new DishImage({
        imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
        isThumbnail: true,
      }),
      new DishImage({
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
        isThumbnail: false,
      }),
    ],
  }),
  new Dish({
    id: `${MSSV}_dish_3`,
    name: 'Gỏi Cuốn Tôm Thịt',
    price: 40000,
    preparationTime: 12, // <= 15m -> Quick
    isAvailable: true,
    description: 'Tôm tươi luộc, thịt ba chỉ, rau thơm, bún cuốn bánh tráng dẻo chấm tương bơ đậu phộng.',
    dishCategoryId: `${MSSV}_cat_1`,
    syncStatus: SYNC_STATUS.SYNCED,
    images: [
      new DishImage({
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
        isThumbnail: true,
      }),
      new DishImage({
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        isThumbnail: false,
      }),
    ],
  }),
  new Dish({
    id: `${MSSV}_dish_4`,
    name: 'Bò Lúc Lắc Khoai Tây',
    price: 120000,
    preparationTime: 25, // > 15m -> Regular
    isAvailable: true,
    description: 'Thịt thăn bò Úc xắt khối vuông đảo lửa lớn xém cạnh với ớt chuông, hành tây và sốt tiêu đen.',
    dishCategoryId: `${MSSV}_cat_2`,
    syncStatus: SYNC_STATUS.SYNCED,
    images: [
      new DishImage({
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        isThumbnail: true,
      }),
      new DishImage({
        imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
        isThumbnail: false,
      }),
    ],
  }),
  new Dish({
    id: `${MSSV}_dish_5`,
    name: 'Chè Hạt Sen Long Nhãn',
    price: 30000,
    preparationTime: 15, // <= 15m -> Quick
    isAvailable: false, // Dùng để kiểm tra bộ lọc Đang kinh doanh
    description: 'Hạt sen Huế bùi béo lồng vào cùi nhãn ngọt thơm, nước đường phèn hoa bưởi mát lạnh.',
    dishCategoryId: `${MSSV}_cat_3`,
    syncStatus: SYNC_STATUS.SYNCED,
    images: [
      new DishImage({
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
        isThumbnail: true,
      }),
      new DishImage({
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        isThumbnail: false,
      }),
    ],
  }),
];

/**
 * Service lưu trữ dữ liệu cục bộ (AsyncStorage) theo cơ chế Offline-First
 */
export const localStorageService = {
  /**
   * Khởi tạo dữ liệu mẫu nếu ứng dụng chạy lần đầu
   */
  initDatabase: async () => {
    try {
      const storedCats = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!storedCats) {
        const catJson = JSON.stringify(INITIAL_CATEGORIES.map((c) => c.toJSON()));
        await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, catJson);
      }

      const storedDishes = await AsyncStorage.getItem(STORAGE_KEYS.DISHES);
      if (!storedDishes) {
        const dishJson = JSON.stringify(INITIAL_DISHES.map((d) => d.toJSON()));
        await AsyncStorage.setItem(STORAGE_KEYS.DISHES, dishJson);
      }
    } catch (error) {
      console.error('[Database Init Error]:', error);
    }
  },

  // ================= CATEGORIES CRUD =================

  getCategories: async ({ includeDeleted = false } = {}) => {
    try {
      await localStorageService.initDatabase();
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!raw) return INITIAL_CATEGORIES;
      const parsed = JSON.parse(raw);
      const cats = parsed.map((item) => DishCategory.fromJSON(item));
      if (includeDeleted) return cats;
      return cats.filter((c) => c.syncStatus !== SYNC_STATUS.PENDING_DELETE);
    } catch (error) {
      console.error('[Get Categories Error]:', error);
      return INITIAL_CATEGORIES;
    }
  },

  createCategory: async (categoryData) => {
    const categories = await localStorageService.getCategories({ includeDeleted: true });
    const newCategory = new DishCategory({
      ...categoryData,
      id: categoryData[`${MSSV}_Id`] || categoryData.id || `local_${Date.now()}`,
      syncStatus: SYNC_STATUS.PENDING_CREATE,
    });
    categories.push(newCategory);
    await AsyncStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(categories.map((c) => c.toJSON()))
    );
    return newCategory;
  },

  updateCategory: async (id, categoryData) => {
    const categories = await localStorageService.getCategories({ includeDeleted: true });
    const targetIndex = categories.findIndex((c) => String(c.id) === String(id));
    if (targetIndex === -1) {
      throw new Error('CATEGORY_NOT_FOUND');
    }
    const current = categories[targetIndex];
    let nextSyncStatus = current.syncStatus;
    if (nextSyncStatus === SYNC_STATUS.SYNCED) {
      nextSyncStatus = SYNC_STATUS.PENDING_UPDATE;
    }
    const updated = new DishCategory({
      ...current.toJSON(),
      ...categoryData,
      id: current.id,
      syncStatus: nextSyncStatus,
    });
    categories[targetIndex] = updated;
    await AsyncStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(categories.map((c) => c.toJSON()))
    );
    return updated;
  },

  /**
   * Xóa danh mục kèm RÀNG BUỘC TOÀN VẸN QUAN HỆ:
   * Chặn không cho xóa loại món đang có món ăn trực thuộc!
   */
  deleteCategory: async (categoryId) => {
    const dishes = await localStorageService.getDishes({ includeDeleted: false });
    const hasLinkedDishes = dishes.some(
      (d) => String(d.dishCategoryId) === String(categoryId)
    );

    if (hasLinkedDishes) {
      const err = new Error('RELATIONAL_CONSTRAINT_VIOLATION');
      err.code = 'ERR_CATEGORY_HAS_DISHES';
      throw err;
    }

    const categories = await localStorageService.getCategories({ includeDeleted: true });
    const targetIndex = categories.findIndex((c) => String(c.id) === String(categoryId));
    if (targetIndex === -1) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    const currentCat = categories[targetIndex];
    if (currentCat.syncStatus === SYNC_STATUS.PENDING_CREATE) {
      categories.splice(targetIndex, 1);
    } else {
      categories[targetIndex][`${MSSV}_SyncStatus`] = SYNC_STATUS.PENDING_DELETE;
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(categories.map((c) => (c instanceof DishCategory ? c.toJSON() : c)))
    );
    return true;
  },

  updateCategorySyncSuccess: async (localId, serverId = null) => {
    const categories = await localStorageService.getCategories({ includeDeleted: true });
    const targetIndex = categories.findIndex((c) => String(c.id) === String(localId));
    if (targetIndex === -1) return;

    const currentCat = categories[targetIndex];
    if (currentCat.syncStatus === SYNC_STATUS.PENDING_DELETE) {
      categories.splice(targetIndex, 1);
    } else {
      const updatedJson = currentCat.toJSON();
      if (serverId) {
        updatedJson[`${MSSV}_Id`] = String(serverId);
      }
      updatedJson[`${MSSV}_SyncStatus`] = SYNC_STATUS.SYNCED;
      categories[targetIndex] = DishCategory.fromJSON(updatedJson);
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(categories.map((c) => (c instanceof DishCategory ? c.toJSON() : c)))
    );
  },

  getPendingSyncCategories: async () => {
    const categories = await localStorageService.getCategories({ includeDeleted: true });
    return categories.filter((c) => c.syncStatus !== SYNC_STATUS.SYNCED);
  },

  // ================= DISHES CRUD =================

  /**
   * Lấy danh sách món ăn từ Local DB
   * @param {{ includeDeleted?: boolean }} options
   */
  getDishes: async ({ includeDeleted = false } = {}) => {
    try {
      await localStorageService.initDatabase();
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.DISHES);
      if (!raw) return INITIAL_DISHES;
      const parsed = JSON.parse(raw);
      const dishes = parsed.map((item) => Dish.fromJSON(item));

      if (includeDeleted) {
        return dishes;
      }
      // Mặc định ẩn các món đã bị đánh dấu pending_delete
      return dishes.filter((d) => d.syncStatus !== SYNC_STATUS.PENDING_DELETE);
    } catch (error) {
      console.error('[Get Dishes Error]:', error);
      return INITIAL_DISHES;
    }
  },

  getDishById: async (id) => {
    const dishes = await localStorageService.getDishes({ includeDeleted: true });
    return dishes.find((d) => String(d.id) === String(id)) || null;
  },

  /**
   * Thêm món mới
   * Nếu đang offline: gán cờ pending_create
   */
  createDish: async (dishData, isOffline = false) => {
    const allDishes = await localStorageService.getDishes({ includeDeleted: true });

    // Validate dữ liệu & ràng buộc trùng tên trong cùng danh mục
    const valResult = Dish.validate(dishData, allDishes);
    if (!valResult.valid) {
      const err = new Error(valResult.errorKey);
      err.code = valResult.errorKey;
      throw err;
    }

    const newId = dishData[`${MSSV}_Id`] || dishData.id || `local_${Date.now()}`;
    const newDish = new Dish({
      ...dishData,
      id: newId,
      syncStatus: SYNC_STATUS.PENDING_CREATE,
    });

    allDishes.unshift(newDish);
    await AsyncStorage.setItem(
      STORAGE_KEYS.DISHES,
      JSON.stringify(allDishes.map((d) => d.toJSON()))
    );

    return newDish;
  },

  /**
   * Cập nhật món ăn
   */
  updateDish: async (id, dishData) => {
    const allDishes = await localStorageService.getDishes({ includeDeleted: true });
    const targetIndex = allDishes.findIndex((d) => String(d.id) === String(id));

    if (targetIndex === -1) {
      throw new Error('DISH_NOT_FOUND');
    }

    // Validate dữ liệu & ràng buộc trùng tên
    const valResult = Dish.validate(dishData, allDishes, id);
    if (!valResult.valid) {
      const err = new Error(valResult.errorKey);
      err.code = valResult.errorKey;
      throw err;
    }

    const currentDish = allDishes[targetIndex];
    let nextSyncStatus = currentDish.syncStatus;

    if (nextSyncStatus === SYNC_STATUS.SYNCED) {
      nextSyncStatus = SYNC_STATUS.PENDING_UPDATE;
    }

    const updatedDish = new Dish({
      ...currentDish.toJSON(),
      ...dishData,
      id: currentDish.id,
      syncStatus: nextSyncStatus,
    });

    allDishes[targetIndex] = updatedDish;
    await AsyncStorage.setItem(
      STORAGE_KEYS.DISHES,
      JSON.stringify(allDishes.map((d) => d.toJSON()))
    );

    return updatedDish;
  },

  /**
   * Xóa món ăn
   * - Nếu món mới tạo chưa lên server (pending_create) -> Xóa luôn khỏi Local
   * - Nếu món đã có trên server -> Đánh dấu pending_delete để đồng bộ xóa trên MockAPI
   */
  deleteDish: async (id) => {
    const allDishes = await localStorageService.getDishes({ includeDeleted: true });
    const targetIndex = allDishes.findIndex((d) => String(d.id) === String(id));

    if (targetIndex === -1) {
      throw new Error('DISH_NOT_FOUND');
    }

    const currentDish = allDishes[targetIndex];

    if (currentDish.syncStatus === SYNC_STATUS.PENDING_CREATE) {
      // Chưa từng đẩy lên server -> Xóa luôn khỏi local
      allDishes.splice(targetIndex, 1);
    } else {
      // Đã có trên server -> Đánh dấu pending_delete
      allDishes[targetIndex][`${MSSV}_SyncStatus`] = SYNC_STATUS.PENDING_DELETE;
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.DISHES,
      JSON.stringify(allDishes.map((d) => (d instanceof Dish ? d.toJSON() : d)))
    );

    return true;
  },

  /**
   * Cập nhật trạng thái sau khi đồng bộ thành công lên server
   */
  updateDishSyncSuccess: async (localId, serverId = null) => {
    const allDishes = await localStorageService.getDishes({ includeDeleted: true });
    const targetIndex = allDishes.findIndex((d) => String(d.id) === String(localId));

    if (targetIndex === -1) return;

    const currentDish = allDishes[targetIndex];

    if (currentDish.syncStatus === SYNC_STATUS.PENDING_DELETE) {
      // Đã xóa trên server thành công -> xóa hẳn khỏi local
      allDishes.splice(targetIndex, 1);
    } else {
      // Đã tạo hoặc sửa thành công -> cập nhật synced và map server ID
      const updatedJson = currentDish.toJSON();
      if (serverId) {
        updatedJson[`${MSSV}_Id`] = String(serverId);
      }
      updatedJson[`${MSSV}_SyncStatus`] = SYNC_STATUS.SYNCED;
      allDishes[targetIndex] = Dish.fromJSON(updatedJson);
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.DISHES,
      JSON.stringify(allDishes.map((d) => (d instanceof Dish ? d.toJSON() : d)))
    );
  },

  /**
   * Lấy danh sách các món đang chờ đồng bộ
   */
  getPendingSyncDishes: async () => {
    const allDishes = await localStorageService.getDishes({ includeDeleted: true });
    return allDishes.filter((d) => d.syncStatus !== SYNC_STATUS.SYNCED);
  },

  /**
   * Đặt lại dữ liệu gốc ban đầu (Hữu ích khi chấm bài / reset test)
   */
  resetToDefaultSeedData: async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(INITIAL_CATEGORIES.map((c) => c.toJSON()))
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.DISHES,
      JSON.stringify(INITIAL_DISHES.map((d) => d.toJSON()))
    );
  },
};

export default localStorageService;
