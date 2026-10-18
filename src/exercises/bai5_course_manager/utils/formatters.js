/**
 * Chuyển đổi số tiền thành định dạng tiền tệ VNĐ (ví dụ: 500.000 đ)
 * @param {number|string} amount Số tiền
 * @returns {string} Chuỗi hiển thị tiền tệ
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '0 đ';
  }
  const numericAmount = Math.round(Number(amount));
  return numericAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
};

/**
 * Định dạng chuỗi ngày thành DD/MM/YYYY
 * @param {string|Date} dateInput Chuỗi ngày tháng hoặc đối tượng Date
 * @returns {string}
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Lấy ngày hiện tại theo chuẩn YYYY-MM-DD (dùng khi tạo mới dữ liệu)
 * @returns {string}
 */
export const getCurrentDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
