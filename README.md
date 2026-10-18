# Baitap-ReactNative

Kho bài tập & Ứng dụng thực hành lập trình di động với React Native & Expo SDK 52.

Demo video bài 4:
https://drive.google.com/file/d/1O4bLlrZZ4MXLWPMN3DQxtk3-ZnhuRvAD/view?usp=sharing

---

## 📁 Cấu trúc thư mục dự án

```text
MyApp/
├── App.js                                # Màn hình Menu Hub chọn bài tập tương tác
├── app.json                              # Cấu hình Expo
├── package.json                          # Dependencies & Scripts
├── locales/                              # Cấu hình đa ngôn ngữ ứng dụng
└── src/
    └── exercises/                        # Toàn bộ bài tập được tổ chức theo module
        ├── index.js                      # Central export cho các bài tập
        ├── bai2_layout/                  # Bài 2: Flexbox & Layout cơ bản
        │   └── index.js
        ├── bai3_login_validation/        # Bài 3: Form Đăng nhập & Regex MSSV
        │   └── index.js
        ├── bai4_student_manager/         # Bài 4: Quản lý Sinh viên (CRUD, AsyncStorage, i18n, ImagePicker)
        │   └── index.js
        └── bai5_course_manager/          # Bài 5: Quản lý Khóa học & Danh mục (Axios API, Video)
            ├── api/                      # Service gọi MockAPI (course, category)
            ├── navigation/               # Navigation Stack riêng cho Bài 5
            ├── screens/                  # Các màn hình CourseList, Detail, Form, Category
            ├── utils/                    # Format tiền tệ, ngày tháng
            └── index.js                  # Entry point cho Bài 5
```

---

## 🚀 Hướng dẫn cài đặt và chạy

1. Cài đặt các gói phụ thuộc:
```bash
npm install
```

2. Khởi chạy ứng dụng:
```bash
npx expo start
```

3. Thao tác trên ứng dụng:
- Khi khởi động, app sẽ hiển thị **Menu chọn bài tập (Dashboard)**.
- Chạm vào bài tập bất kỳ để mở bài tập đó.
- Nút **"Về Menu"** ở góc trên bên phải cho phép quay lại danh sách bất kỳ lúc nào.
