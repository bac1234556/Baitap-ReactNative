import axios from 'axios';

// MockAPI Project Endpoint
export const API_BASE_URL = 'https://6ace03b6f338359cf1c2e0dc.mockapi.io/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Log hoặc thêm token nếu cần
apiClient.interceptors.request.use(
  (config) => {
    // Có thể bổ sung header/auth token ở đây
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý bắt lỗi cơ bản
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let errorMessage = 'Đã xảy ra lỗi kết nối với máy chủ.';

    if (error.response) {
      // Server phản hồi với status code ngoài khoảng 2xx
      const status = error.response.status;
      if (status === 404) {
        errorMessage = 'Không tìm thấy dữ liệu yêu cầu (404).';
      } else if (status >= 500) {
        errorMessage = 'Lỗi máy chủ nội bộ (Server Error). Vui lòng thử lại sau.';
      } else {
        errorMessage = error.response.data?.message || `Lỗi yêu cầu: ${status}`;
      }
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = 'Yêu cầu quá thời gian chờ (10s). Vui lòng kiểm tra lại mạng.';
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc Base URL.';
    }

    console.error('[API Error]:', errorMessage, error.message);
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
