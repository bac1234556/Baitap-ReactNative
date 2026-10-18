import apiClient from './client';

let localCourses = [
  {
    id: '1',
    title: 'Lập trình React Native từ cơ bản đến nâng cao',
    instructor: 'Nguyễn Văn A',
    categoryId: '2',
    price: 599000,
    duration: 35,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Khóa học thực chiến xây dựng ứng dụng di động đa nền tảng với React Native, Expo, Redux và kết nối REST API.',
    createdAt: '2026-03-01',
  },
  {
    id: '2',
    title: 'Xây dựng Web hiện đại với React & Tailwind CSS',
    instructor: 'Trần Thị B',
    categoryId: '1',
    price: 450000,
    duration: 28,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    description: 'Học cách thiết kế và phát triển giao diện website chuẩn responsive, tối ưu SEO và trải nghiệm người dùng.',
    createdAt: '2026-03-05',
  },
  {
    id: '3',
    title: 'Nhập môn Trí tuệ nhân tạo & Ứng dụng AI',
    instructor: 'Lê Hoàng C',
    categoryId: '3',
    price: 750000,
    duration: 40,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Tìm hiểu về các mô hình AI hiện đại, Prompt Engineering và tích hợp AI APIs vào ứng dụng thực tế.',
    createdAt: '2026-03-10',
  },
];

/**
 * Service quản lý Khóa học (Courses) kết nối MockAPI.io (kèm Fallback khi MockAPI chưa tạo Resource)
 */
export const courseService = {
  /**
   * Lấy danh sách tất cả khóa học
   * @returns {Promise<Array>}
   */
  getCourses: async () => {
    try {
      return await apiClient.get('/courses');
    } catch (err) {
      if (err.message?.includes('404')) {
        console.warn('[MockAPI] Resource /courses chưa có trên MockAPI. Sử dụng dữ liệu mẫu.');
        return localCourses;
      }
      throw err;
    }
  },

  /**
   * Lấy chi tiết khóa học theo id
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  getCourseById: async (id) => {
    try {
      return await apiClient.get(`/courses/${id}`);
    } catch (err) {
      if (err.message?.includes('404')) {
        return localCourses.find((c) => String(c.id) === String(id)) || null;
      }
      throw err;
    }
  },

  /**
   * Tạo khóa học mới
   * @param {Object} data { title, instructor, categoryId, price, duration, thumbnail, trailerUrl, description, createdAt }
   * @returns {Promise<Object>}
   */
  createCourse: async (data) => {
    try {
      return await apiClient.post('/courses', data);
    } catch (err) {
      if (err.message?.includes('404')) {
        const newCourse = { ...data, id: Date.now().toString() };
        localCourses.push(newCourse);
        return newCourse;
      }
      throw err;
    }
  },

  /**
   * Cập nhật thông tin khóa học
   * @param {string|number} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  updateCourse: async (id, data) => {
    try {
      return await apiClient.put(`/courses/${id}`, data);
    } catch (err) {
      if (err.message?.includes('404')) {
        localCourses = localCourses.map((c) => (String(c.id) === String(id) ? { ...c, ...data } : c));
        return { ...data, id };
      }
      throw err;
    }
  },

  /**
   * Xóa khóa học theo id
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  deleteCourse: async (id) => {
    try {
      return await apiClient.delete(`/courses/${id}`);
    } catch (err) {
      if (err.message?.includes('404')) {
        localCourses = localCourses.filter((c) => String(c.id) !== String(id));
        return { success: true };
      }
      throw err;
    }
  },
};

export default courseService;
