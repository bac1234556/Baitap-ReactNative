import { MSSV, SYNC_STATUS, PREPARATION_SPEED_THRESHOLD, FALLBACK_IMAGE_URL } from '../config/constants';
import DishImage from './DishImage';

/**
 * Model Món ăn (Dish)
 * Mọi trường đều bắt buộc có tiền tố {MSSV}_: BIT240036_
 */
export class Dish {
  constructor(props = {}) {
    const rawId = props[`${MSSV}_Id`] ?? props.id ?? props._id;
    const rawName = props[`${MSSV}_Name`] ?? props.name;
    const rawPrice = props[`${MSSV}_Price`] ?? props.price;
    const rawPrep = props[`${MSSV}_PreparationTime`] ?? props.preparationTime;
    const rawAvail = props[`${MSSV}_IsAvailable`] ?? props.isAvailable;
    const rawDesc = props[`${MSSV}_Description`] ?? props.description;
    const rawCatId = props[`${MSSV}_DishCategoryId`] ?? props.dishCategoryId;
    const rawCatName = props[`${MSSV}_CategoryName`] ?? props.categoryName;
    const rawSync = props[`${MSSV}_SyncStatus`] ?? props.syncStatus;
    const rawImages = props[`${MSSV}_Images`] ?? props.images ?? [];

    this[`${MSSV}_Id`] = String(rawId || Date.now());
    this[`${MSSV}_Name`] = rawName !== undefined && rawName !== null ? String(rawName).trim() : '';
    this[`${MSSV}_Price`] = Number(rawPrice) || 0;
    this[`${MSSV}_PreparationTime`] = Number(rawPrep) || 0;
    this[`${MSSV}_IsAvailable`] = rawAvail !== undefined ? Boolean(rawAvail) : true;
    this[`${MSSV}_Description`] = rawDesc !== undefined && rawDesc !== null ? String(rawDesc).trim() : '';
    this[`${MSSV}_DishCategoryId`] = String(rawCatId || '');
    this[`${MSSV}_CategoryName`] = String(rawCatName || '');
    this[`${MSSV}_SyncStatus`] = rawSync || SYNC_STATUS.SYNCED;

    // Chuẩn hóa danh sách ảnh DishImage và đảm bảo có đúng 1 thumbnail
    let parsedImages = Array.isArray(rawImages)
      ? rawImages.map((img) => (img instanceof DishImage ? img : DishImage.fromJSON(img))).filter(Boolean)
      : [];

    if (parsedImages.length > 0) {
      const hasThumb = parsedImages.some((img) => img.isThumbnail);
      if (!hasThumb) {
        parsedImages[0][`${MSSV}_IsThumbnail`] = true;
      }
    }

    this[`${MSSV}_Images`] = parsedImages;
  }

  // Getters tiện lợi cho UI
  get id() {
    return this[`${MSSV}_Id`];
  }

  get name() {
    return this[`${MSSV}_Name`];
  }

  get price() {
    return this[`${MSSV}_Price`];
  }

  get preparationTime() {
    return this[`${MSSV}_PreparationTime`];
  }

  get isAvailable() {
    return this[`${MSSV}_IsAvailable`];
  }

  get description() {
    return this[`${MSSV}_Description`];
  }

  get dishCategoryId() {
    return this[`${MSSV}_DishCategoryId`];
  }

  get categoryName() {
    return this[`${MSSV}_CategoryName`];
  }

  get syncStatus() {
    return this[`${MSSV}_SyncStatus`];
  }

  get images() {
    return this[`${MSSV}_Images`] || [];
  }

  // Kiểm tra thời gian chế biến nhanh (<= 15 phút)
  get isQuick() {
    return this.preparationTime <= PREPARATION_SPEED_THRESHOLD;
  }

  // Trả về nhãn tốc độ: Quick (<= 15m) hoặc Regular (> 15m)
  get speedTag() {
    return this.isQuick ? 'Quick' : 'Regular';
  }

  // Lấy link ảnh đại diện (Thumbnail) duy nhất
  get thumbnailUrl() {
    const thumb = this.images.find((img) => img.isThumbnail);
    return thumb?.imageUrl || this.images[0]?.imageUrl || FALLBACK_IMAGE_URL;
  }

  toJSON() {
    return {
      [`${MSSV}_Id`]: this[`${MSSV}_Id`],
      [`${MSSV}_Name`]: this[`${MSSV}_Name`],
      [`${MSSV}_Price`]: this[`${MSSV}_Price`],
      [`${MSSV}_PreparationTime`]: this[`${MSSV}_PreparationTime`],
      [`${MSSV}_IsAvailable`]: this[`${MSSV}_IsAvailable`],
      [`${MSSV}_Description`]: this[`${MSSV}_Description`],
      [`${MSSV}_DishCategoryId`]: this[`${MSSV}_DishCategoryId`],
      [`${MSSV}_CategoryName`]: this[`${MSSV}_CategoryName`],
      [`${MSSV}_SyncStatus`]: this[`${MSSV}_SyncStatus`],
      [`${MSSV}_Images`]: this.images.map((img) => img.toJSON()),
    };
  }

  static fromJSON(json) {
    if (!json) return null;
    return new Dish(json);
  }

  /**
   * Validate dữ liệu món ăn cơ bản
   * @param {Object} data
   * @param {Array<Dish>} existingDishes - danh sách món hiện có để kiểm tra trùng lặp
   * @param {string} currentDishId - id món đang chỉnh sửa (nếu có)
   * @returns {{ valid: boolean, errorKey?: string }}
   */
  static validate(data, existingDishes = [], currentDishId = null) {
    const name = data[`${MSSV}_Name`] ?? data.name;
    const price = Number(data[`${MSSV}_Price`] ?? data.price);
    const preparationTime = Number(data[`${MSSV}_PreparationTime`] ?? data.preparationTime);
    const categoryId = String(data[`${MSSV}_DishCategoryId`] ?? data.dishCategoryId ?? '');
    const images = data[`${MSSV}_Images`] ?? data.images ?? [];

    if (!name || !String(name).trim()) {
      return { valid: false, errorKey: 'valNameRequired' };
    }

    if (isNaN(price) || price <= 0) {
      return { valid: false, errorKey: 'valPricePositive' };
    }

    if (isNaN(preparationTime) || preparationTime <= 0 || !Number.isInteger(preparationTime)) {
      return { valid: false, errorKey: 'valPrepTimePositive' };
    }

    if (!categoryId.trim()) {
      return { valid: false, errorKey: 'valCategoryRequired' };
    }

    // Ràng buộc nghiệp vụ: Không cho phép trùng tên món ăn trong CÙNG một loại danh mục
    const cleanName = String(name).trim().toLowerCase();
    const isDuplicate = existingDishes.some((d) => {
      const dId = String(d[`${MSSV}_Id`] ?? d.id);
      if (currentDishId && dId === String(currentDishId)) return false;

      const dCat = String(d[`${MSSV}_DishCategoryId`] ?? d.dishCategoryId);
      const dName = String(d[`${MSSV}_Name`] ?? d.name).trim().toLowerCase();
      const dStatus = d[`${MSSV}_SyncStatus`] ?? d.syncStatus;

      // Bỏ qua bản ghi đã bị đánh dấu xóa offline
      if (dStatus === SYNC_STATUS.PENDING_DELETE) return false;

      return dCat === categoryId && dName === cleanName;
    });

    if (isDuplicate) {
      return { valid: false, errorKey: 'valDuplicateNameInCategory' };
    }

    return { valid: true };
  }
}

export default Dish;
