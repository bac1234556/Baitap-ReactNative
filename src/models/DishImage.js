import { MSSV } from '../config/constants';

/**
 * Model Danh sách ảnh món ăn (DishImage)
 * Mọi trường đều có tiền tố MSSV: BIT240036_
 */
export class DishImage {
  constructor(props = {}) {
    const rawUrl = props[`${MSSV}_ImageUrl`] ?? props.imageUrl ?? props.url;
    const rawThumb = props[`${MSSV}_IsThumbnail`] ?? props.isThumbnail;

    this[`${MSSV}_ImageUrl`] = rawUrl ? String(rawUrl).trim() : '';
    this[`${MSSV}_IsThumbnail`] = Boolean(rawThumb);
  }

  get imageUrl() {
    return this[`${MSSV}_ImageUrl`];
  }

  get isThumbnail() {
    return this[`${MSSV}_IsThumbnail`];
  }

  toJSON() {
    return {
      [`${MSSV}_ImageUrl`]: this[`${MSSV}_ImageUrl`],
      [`${MSSV}_IsThumbnail`]: this[`${MSSV}_IsThumbnail`],
    };
  }

  static fromJSON(json) {
    if (!json) return null;
    return new DishImage(json);
  }
}

export default DishImage;
