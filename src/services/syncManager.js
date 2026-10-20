import NetInfo from '@react-native-community/netinfo';
import { MSSV, SYNC_STATUS } from '../config/constants';
import localStorageService from './localStorageService';
import mockApiClient from './mockApiClient';

class SyncManager {
  constructor() {
    this.isOnline = true;
    this.isSyncing = false;
    this.simulatedOffline = false;
    this.listeners = new Set();
    this.unsubscribeNetInfo = null;
    this.lastSyncTime = null;
    this.syncError = null;
  }

  /**
   * Khởi động bộ lắng nghe trạng thái kết nối mạng
   */
  init() {
    if (this.unsubscribeNetInfo) {
      return;
    }

    mockApiClient.init();

    // Đăng ký lắng nghe sự kiện mạng
    this.unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const reachable = state.isInternetReachable ?? state.isConnected ?? true;
      this.handleNetworkChange(reachable);
    });

    // Kiểm tra trạng thái mạng hiện tại ngay khi khởi động
    NetInfo.fetch().then((state) => {
      const reachable = state.isInternetReachable ?? state.isConnected ?? true;
      this.handleNetworkChange(reachable);
      if (reachable && !this.simulatedOffline) {
        this.checkAndSeedMockApi();
      }
    });
  }

  /**
   * Tự động khởi tạo dữ liệu mẫu lên MockAPI nếu MockAPI hiện đang trống ([])
   */
  async checkAndSeedMockApi() {
    if (!this.isOnline || this.simulatedOffline) return;

    // 1. Kiểm tra & Seed Danh mục (Category)
    try {
      const remoteCategories = await mockApiClient.fetchCategories();
      if (Array.isArray(remoteCategories) && remoteCategories.length === 0) {
        console.log('[SyncManager] MockAPI Danh mục trống. Đang tự động nạp các danh mục mẫu...');
        const localCats = await localStorageService.getCategories({ includeDeleted: false });
        for (const cat of localCats) {
          try {
            const res = await mockApiClient.createCategoryRemote(cat);
            const serverId = res[`${MSSV}_Id`] || res.id;
            await localStorageService.updateCategorySyncSuccess(cat.id, serverId);
          } catch (e) {
            console.warn('[SyncManager Seed Cat Item]:', e.message);
          }
        }
        console.log('[SyncManager] Đã nạp thành công các danh mục mẫu lên MockAPI!');
      }
    } catch (catErr) {
      // Nếu MockAPI chưa có Resource BIT240036_DishCategory (404), ghi nhận cảnh báo
      console.warn('[SyncManager Category Check]:', catErr.message);
    }

    // 2. Kiểm tra & Seed Món ăn (Dish)
    try {
      const remoteDishes = await mockApiClient.fetchDishes();
      if (Array.isArray(remoteDishes) && remoteDishes.length === 0) {
        console.log('[SyncManager] MockAPI Món ăn trống. Đang tự động nạp các món ăn mẫu lên MockAPI...');
        const localDishes = await localStorageService.getDishes({ includeDeleted: false });
        for (const dish of localDishes) {
          try {
            const res = await mockApiClient.createDishRemote(dish);
            const serverId = res[`${MSSV}_Id`] || res.id;
            await localStorageService.updateDishSyncSuccess(dish.id, serverId);
          } catch (e) {
            console.warn('[SyncManager Seed Dish Item]:', e.message);
          }
        }
        console.log('[SyncManager] Đã nạp thành công các món ăn mẫu lên MockAPI!');
        this.notify();
      }
    } catch (e) {
      console.warn('[checkAndSeedMockApi Dishes]:', e.message);
    }
  }

  /**
   * Đăng ký callback khi có thay đổi trạng thái đồng bộ
   */
  subscribe(callback) {
    this.listeners.add(callback);
    // Gửi ngay trạng thái hiện tại
    callback(this.getState());
    return () => this.listeners.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((callback) => {
      try {
        callback(state);
      } catch (err) {
        console.error('[SyncManager notify error]:', err);
      }
    });
  }

  getState() {
    return {
      isOnline: this.simulatedOffline ? false : this.isOnline,
      isSyncing: this.isSyncing,
      simulatedOffline: this.simulatedOffline,
      lastSyncTime: this.lastSyncTime,
      syncError: this.syncError,
    };
  }

  /**
   * Bật/tắt chế độ giả lập Mất mạng (rất hữu ích khi giáo viên/học viên chấm demo)
   */
  toggleSimulatedOffline() {
    this.simulatedOffline = !this.simulatedOffline;
    if (!this.simulatedOffline && this.isOnline) {
      // Khi bật lại online, tự động kích hoạt đồng bộ
      this.triggerAutoSync();
    }
    this.notify();
  }

  handleNetworkChange(isNetworkConnected) {
    const previouslyOnline = this.isOnline;
    this.isOnline = isNetworkConnected;

    this.notify();

    // Khi CÓ mạng trở lại (Online): Tự động phát hiện và quét bản ghi đẩy lên MockAPI
    if (!previouslyOnline && this.isOnline && !this.simulatedOffline) {
      console.log('[SyncManager] Kết nối mạng phục hồi. Bắt đầu tự động đồng bộ...');
      this.triggerAutoSync();
    }
  }

  /**
   * Kích hoạt quy trình tự động đồng bộ tuần tự 2 Resource (Categories trước, Dishes sau)
   */
  async triggerAutoSync() {
    if (this.isSyncing) return;
    if (!this.isOnline || this.simulatedOffline) return;

    this.isSyncing = true;
    this.syncError = null;
    this.notify();

    try {
      let syncedCount = 0;

      // ================= PHẦN 1: ĐỒNG BỘ DANH MỤC (CATEGORIES) =================
      try {
        const pendingCats = await localStorageService.getPendingSyncCategories();
        for (const cat of pendingCats) {
          const catId = cat.id;
          const syncStatus = cat.syncStatus;
          try {
            if (syncStatus === SYNC_STATUS.PENDING_CREATE) {
              const remoteRes = await mockApiClient.createCategoryRemote(cat);
              const serverId = remoteRes[`${MSSV}_Id`] || remoteRes.id;
              await localStorageService.updateCategorySyncSuccess(catId, serverId);
              syncedCount++;
            } else if (syncStatus === SYNC_STATUS.PENDING_UPDATE) {
              await mockApiClient.updateCategoryRemote(catId, cat);
              await localStorageService.updateCategorySyncSuccess(catId);
              syncedCount++;
            } else if (syncStatus === SYNC_STATUS.PENDING_DELETE) {
              try {
                await mockApiClient.deleteCategoryRemote(catId);
              } catch (delErr) {
                console.warn('[SyncManager Cat Delete]:', delErr.message);
              }
              await localStorageService.updateCategorySyncSuccess(catId);
              syncedCount++;
            }
          } catch (itemCatErr) {
            console.warn(`[SyncManager Cat item ${catId}]:`, itemCatErr.message);
          }
        }
      } catch (catSyncErr) {
        console.warn('[SyncManager Categories sync error]:', catSyncErr.message);
      }

      // ================= PHẦN 2: ĐỒNG BỘ MÓN ĂN (DISHES) =================
      const pendingDishes = await localStorageService.getPendingSyncDishes();

      for (const dish of pendingDishes) {
        const dishId = dish.id;
        const syncStatus = dish.syncStatus;

        try {
          if (syncStatus === SYNC_STATUS.PENDING_CREATE) {
            // Đẩy bản ghi tạo mới lên MockAPI
            const remoteResult = await mockApiClient.createDishRemote(dish);
            const serverId = remoteResult[`${MSSV}_Id`] || remoteResult.id;
            await localStorageService.updateDishSyncSuccess(dishId, serverId);
            syncedCount++;
          } else if (syncStatus === SYNC_STATUS.PENDING_UPDATE) {
            // Cập nhật bản ghi trên MockAPI
            await mockApiClient.updateDishRemote(dishId, dish);
            await localStorageService.updateDishSyncSuccess(dishId);
            syncedCount++;
          } else if (syncStatus === SYNC_STATUS.PENDING_DELETE) {
            // Xóa bản ghi trên MockAPI
            try {
              await mockApiClient.deleteDishRemote(dishId);
            } catch (delErr) {
              console.warn('[SyncManager Delete]:', delErr.message);
            }
            await localStorageService.updateDishSyncSuccess(dishId);
            syncedCount++;
          }
        } catch (itemErr) {
          console.error(`[SyncManager Error on dish ${dishId}]:`, itemErr.message);
        }
      }

      this.lastSyncTime = new Date();
      this.isSyncing = false;
      this.notify();

      return { success: true, count: syncedCount };
    } catch (error) {
      console.error('[SyncManager Fatal Sync Error]:', error);
      this.syncError = error.message;
      this.isSyncing = false;
      this.notify();
      return { success: false, error: error.message };
    }
  }

  /**
   * Đồng bộ thủ công khi người dùng chạm nút "Đồng bộ ngay"
   */
  async syncNow() {
    return await this.triggerAutoSync();
  }
}

export const syncManager = new SyncManager();
export default syncManager;
