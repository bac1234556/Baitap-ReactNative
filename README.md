# BÀI KIỂM TRA GIỮA KỲ: ỨNG DỤNG QUẢN LÝ MÓN ĂN
### Project: `BIT240036_FoodManager`
- **Sinh viên thực hiện**: Lê Việt Bắc
- **Mã số sinh viên (MSSV)**: `BIT240036`
- **Công nghệ**: React Native (Expo SDK 52) / JavaScript / AsyncStorage + MockAPI.io
- **Video demo**: [demo_BIT240036_FoodManager.mp4](./demo_BIT240036_FoodManager.mp4) | [Xem trên Google Drive](https://drive.google.com/file/d/1jHkb7DAx4vQHr7O7BwBx2dGoRHIG2Igb/view?usp=sharing)


---

## 🌟 TỔNG QUAN DỰ ÁN
Ứng dụng di động "Quản lý món ăn" được thiết kế và xây dựng theo chuẩn kiến trúc **Offline-First**, tự động đồng bộ hai chiều với **MockAPI.io REST API**, tích hợp hệ thống đa ngôn ngữ (**i18n: English / Tiếng Việt**), bộ lọc đa tiêu chí (**Multi-Filter**) và xử lý ràng buộc toàn vẹn cơ sở dữ liệu.

---

## 🗄️ 1. MÔ HÌNH DỮ LIỆU & QUY TẮC ĐẶT TÊN BẮT BUỘC
Toàn bộ tên Bảng và tên Trường đều tuân thủ nghiêm ngặt tiền tố **`BIT240036_`**:

### 1. Bảng Loại món ăn (`BIT240036_DishCategory`):
- `BIT240036_Id`: Khóa chính định danh duy nhất (String)
- `BIT240036_Name`: Tên loại món ăn (String, Not Null)
- `BIT240036_Description`: Mô tả nhóm món ăn (String)

### 2. Bảng Món ăn (`BIT240036_Dish`):
- `BIT240036_Id`: Khóa chính (String)
- `BIT240036_Name`: Tên món ăn (String, Not Null)
- `BIT240036_Price`: Đơn giá (Double/Float, > 0)
- `BIT240036_PreparationTime`: Thời gian chế biến tính bằng phút (Int, > 0)
- `BIT240036_IsAvailable`: Trạng thái kinh doanh (Boolean, mặc định true)
- `BIT240036_Description`: Mô tả chi tiết món ăn (String)
- `BIT240036_DishCategoryId`: Khóa ngoại tham chiếu `BIT240036_DishCategory.BIT240036_Id`
- `BIT240036_SyncStatus`: Trạng thái đồng bộ (`'synced' | 'pending_create' | 'pending_update' | 'pending_delete'`)
- `BIT240036_Images`: Mảng danh sách ảnh nhúng

### 3. Danh sách ảnh (`BIT240036_DishImage`):
- `BIT240036_ImageUrl`: Đường dẫn URL ảnh (String)
- `BIT240036_IsThumbnail`: Cờ đánh dấu ảnh đại diện (Boolean, **duy nhất 1 ảnh** có giá trị true trên mỗi món)

### 4. Dữ liệu khởi tạo (Seed Data):
- **03 danh mục mẫu**: Món khai vị, Món chính, Tráng miệng & Đồ uống.
- **05 món ăn mẫu**: Phở Bò Tái Nạm (10m - Quick), Bún Chả Hà Nội (20m - Regular), Gỏi Cuốn Tôm Thịt (12m - Quick), Bò Lúc Lắc (25m - Regular), Chè Hạt Sen (15m - Quick, trạng thái ngừng bán để kiểm tra bộ lọc).

---

## ⚡ 2. CÁC TÍNH NĂNG VÀ NGHIỆP VỤ ĐÃ HIỆN THỰC

### 2.1. Quản lý Món ăn (CRUD)
- **Danh sách món ăn (Dish List)**:
  - Hiển thị ảnh đại diện (Thumbnail) với cơ chế Fallback chống ảnh lỗi.
  - Tên món, đơn giá tiền tệ VNĐ.
  - Thời gian chế biến kèm nhãn tốc độ:
    - **"Quick" (Nhanh)** màu xanh lá nếu ≤ 15 phút.
    - **"Regular" (Tiêu chuẩn)** màu xanh lam nếu > 15 phút.
  - Huy hiệu trạng thái kinh doanh (Đang bán / Ngừng bán).
  - Huy hiệu trạng thái đồng bộ (Synced / Pending Create / Pending Update / Pending Delete).
- **Chi tiết món ăn (Dish Detail)**:
  - Gallery / Carousel lướt ảnh ngang mượt mà kèm phân trang chấm tròn.
  - **Chạm vào bất kỳ ảnh nào để chuyển đổi ảnh đại diện (Thumbnail)** ngay tức thì.
  - Hiển thị đầy đủ thông số kỹ thuật, mô tả và nút Sửa / Xóa.
- **Thêm & Sửa món (Form Create / Edit)**:
  - Chọn danh mục trực quan từ dữ liệu local.
  - Nhập tên, đơn giá, thời gian làm món, switch trạng thái kinh doanh, mô tả.
  - Thêm nhiều URL ảnh, chọn duy nhất 1 ảnh làm Thumbnail, có sẵn gợi ý ảnh mẫu tiện lợi khi test.
- **Xác nhận xóa**: Hộp thoại cảnh báo Alert xác nhận trước khi thực hiện xóa món.

### 2.2. Tìm kiếm, Lọc và Sắp xếp nâng cao (Multi-filter)
Kết hợp đồng thời 4 tiêu chí:
1. Tìm kiếm theo một phần tên món (không phân biệt hoa/thường).
2. Lọc theo loại danh mục (`BIT240036_DishCategoryId`).
3. Lọc theo trạng thái kinh doanh (`BIT240036_IsAvailable == true`).
4. Lọc theo khoảng giá (Min Price - Max Price) có kiểm tra tính hợp lệ (Min ≤ Max, không âm).
5. Sắp xếp: Giá tăng dần / Giá giảm dần / Thời gian chế biến nhanh nhất / Mặc định.
- **Giữ nguyên trạng thái (Filter State Retention)**: Khi chuyển sang màn hình Chi tiết hoặc Form rồi quay lại, toàn bộ bộ lọc và kết quả tìm kiếm vẫn giữ nguyên.

### 2.3. Ràng buộc toàn vẹn & Validation
- Kiểm tra dữ liệu bắt buộc: Tên không rỗng, Giá > 0, Thời gian > 0, Danh mục bắt buộc.
- **Ràng buộc nghiệp vụ**: Không cho phép trùng tên món ăn trong **CÙNG một loại danh mục**.
- **Ràng buộc quan hệ (Foreign Key Constraint)**: Chặn không cho xóa loại món đang có món ăn trực thuộc!
- Xử lý ngoại lệ UI: Empty State khi danh sách trống; Fallback Image hiển thị khi link ảnh hỏng.

### 2.4. Đa ngôn ngữ (i18n)
- Mặc định là **English**, có nút chuyển đổi sang **Tiếng Việt** (EN / VI) trên thanh trạng thái.
- Tự động áp dụng trên toàn bộ nhãn, nút bấm, nhãn tốc độ (Quick/Regular), thông báo lỗi và validation.
- Lưu trữ ngôn ngữ người dùng đã chọn vào AsyncStorage để không bị reset khi chuyển trang hoặc khởi động lại app.

### 2.5. Cơ chế Offline-First & Tự động đồng bộ (Auto-Sync)
- Tích hợp `@react-native-community/netinfo` để lắng nghe trạng thái kết nối mạng theo thời gian thực.
- Có nút chuyển đổi **"Giả lập Offline" (Simulate Offline)** ngay trên giao diện để thuận tiện chấm thi trên máy ảo/web mà không cần tắt WiFi.
- **Khi MẤT mạng (Offline)**: Thao tác Thêm / Sửa / Xóa vẫn diễn ra bình thường trên Local Storage; đánh dấu cờ `BIT240036_SyncStatus` (`pending_create`, `pending_update`, `pending_delete`).
- **Khi CÓ mạng trở lại (Online)**: Hệ thống tự động phát hiện (Auto listener) và đẩy tuần tự các bản ghi chưa đồng bộ lên MockAPI mà **KHÔNG cần người dùng nhấn nút đồng bộ**.
- Cung cấp thêm nút **"Đồng bộ ngay" (Sync Now)** để kiểm tra thao tác thủ công.

---

## 📂 3. CẤU TRÚC THƯ MỤC SOURCE CODE

```text
BIT240036_FoodManager/
├── package.json                          # Cấu hình gói và dependencies
├── index.js                              # Entry point khởi chạy module
├── README.md                             # Hướng dẫn chi tiết dự án
└── src/
    ├── config/
    │   └── constants.js                  # Tiền tố BIT240036_, keys và cấu hình hệ thống
    ├── models/
    │   ├── DishCategory.js               # Model BIT240036_DishCategory
    │   ├── Dish.js                       # Model BIT240036_Dish & tính nhãn Quick/Regular
    │   └── DishImage.js                  # Model BIT240036_DishImage & quản lý Thumbnail
    ├── services/
    │   ├── localStorageService.js        # Quản lý AsyncStorage & kiểm tra ràng buộc quan hệ
    │   ├── mockApiClient.js              # Client giao tiếp MockAPI.io REST API
    │   └── syncManager.js                # Lắng nghe mạng & tự động đồng bộ tuần tự
    ├── i18n/
    │   ├── index.js                      # Cấu hình i18next & lưu ngôn ngữ vào AsyncStorage
    │   ├── en.json                       # Từ điển tiếng Anh (mặc định)
    │   └── vi.json                       # Từ điển tiếng Việt
    ├── navigation/
    │   └── FoodNavigator.js              # Stack Navigator (DishList, Detail, Form, Categories)
    ├── screens/
    │   ├── DishListScreen.js             # Màn hình danh sách, đa bộ lọc, tìm kiếm, nhãn tốc độ
    │   ├── DishDetailScreen.js           # Chi tiết món, carousel gallery, đổi thumbnail
    │   ├── DishFormScreen.js             # Form Thêm/Sửa, quản lý ảnh, validation chống trùng tên
    │   └── CategoryManagerScreen.js      # Quản lý loại món & chặn xóa danh mục có món trực thuộc
    └── components/
        ├── NetworkStatusBar.js           # Thanh trạng thái mạng, giả lập offline & nút đổi ngôn ngữ
        ├── DishCard.js                   # Thẻ hiển thị món ăn, nhãn tốc độ, trạng thái đồng bộ
        ├── MultiFilterModal.js           # Hộp thoại đa bộ lọc kết hợp & sắp xếp
        ├── FallbackImage.js              # Component hiển thị ảnh chống lỗi broken URL
        └── EmptyState.js                 # Hiển thị khi danh sách trống
```

---

## 🚀 4. HƯỚNG DẪN CHẠY DỰ ÁN ĐỘC LẬP

Dự án là một ứng dụng React Native (Expo) hoàn toàn độc lập, tách biệt khỏi các bài tập 1, 2, 3, 4, 5.

### 4.1. Khởi chạy ứng dụng:
Mở Terminal tại thư mục dự án và chạy lệnh:

```bash
cd "d:\Android_projects\Bài kiểm tra giữa kì\BIT240036_FoodManager"
npm start
```
hoặc:
```bash
npx expo start
```

### 4.2. Trải nghiệm trên các nền tảng:
- **Trình duyệt Web**: Nhấn phím `w` trong terminal để mở trực tiếp trên Chrome/Edge.
- **Thiết bị thật (Android / iOS)**: Mở ứng dụng **Expo Go** và quét mã QR hiển thị trong terminal.
- **Máy ảo Android**: Nhấn phím `a` để chạy trên Android Emulator.

