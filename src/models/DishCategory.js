import { MSSV, SYNC_STATUS } from '../config/constants';

/**
 * Model Loại món ăn (DishCategory)
 * Mọi trường đều có tiền tố MSSV: BIT240036_
 */
export class DishCategory {
  constructor(props = {}) {
    const rawId = props[`${MSSV}_Id`] ?? props.id ?? props._id;
    const rawName = props[`${MSSV}_Name`] ?? props.name;
    const rawDesc = props[`${MSSV}_Description`] ?? props.description;
    const rawSync = props[`${MSSV}_SyncStatus`] ?? props.syncStatus;

    this[`${MSSV}_Id`] = String(rawId || Date.now());
    this[`${MSSV}_Name`] = rawName ? String(rawName).trim() : '';
    this[`${MSSV}_Description`] = rawDesc ? String(rawDesc).trim() : '';
    this[`${MSSV}_SyncStatus`] = rawSync || SYNC_STATUS.SYNCED;
  }

  // Getter tiện lợi để đọc trường
  get id() {
    return this[`${MSSV}_Id`];
  }

  get name() {
    return this[`${MSSV}_Name`];
  }

  get description() {
    return this[`${MSSV}_Description`];
  }

  get syncStatus() {
    return this[`${MSSV}_SyncStatus`];
  }

  // Chuyển sang JSON object chuẩn
  toJSON() {
    return {
      [`${MSSV}_Id`]: this[`${MSSV}_Id`],
      [`${MSSV}_Name`]: this[`${MSSV}_Name`],
      [`${MSSV}_Description`]: this[`${MSSV}_Description`],
      [`${MSSV}_SyncStatus`]: this[`${MSSV}_SyncStatus`],
    };
  }

  // Tạo đối tượng từ dữ liệu lưu trữ / API
  static fromJSON(json) {
    if (!json) return null;
    return new DishCategory(json);
  }

  // Validate thông tin danh mục
  static validate(data) {
    const name = data[`${MSSV}_Name`] ?? data.name;
    if (!name || !String(name).trim()) {
      return { valid: false, errorKey: 'requireCategoryName' };
    }
    return { valid: true };
  }
}

export default DishCategory;
