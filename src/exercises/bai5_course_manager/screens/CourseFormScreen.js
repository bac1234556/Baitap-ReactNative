import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { courseService } from '../api/courseService';
import { categoryService } from '../api/categoryService';
import { getCurrentDateString } from '../utils/formatters';

const SAMPLE_THUMBNAILS = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600',
];

const SAMPLE_TRAILERS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
];

export default function CourseFormScreen({ route, navigation }) {
  const existingCourse = route.params?.course;
  const isEdit = !!existingCourse;

  // Form states
  const [title, setTitle] = useState(existingCourse?.title || '');
  const [instructor, setInstructor] = useState(existingCourse?.instructor || '');
  const [categoryId, setCategoryId] = useState(existingCourse?.categoryId ? String(existingCourse.categoryId) : '');
  const [price, setPrice] = useState(existingCourse?.price !== undefined ? String(existingCourse.price) : '');
  const [duration, setDuration] = useState(existingCourse?.duration !== undefined ? String(existingCourse.duration) : '');
  const [thumbnail, setThumbnail] = useState(existingCourse?.thumbnail || '');
  const [trailerUrl, setTrailerUrl] = useState(existingCourse?.trailerUrl || '');
  const [description, setDescription] = useState(existingCourse?.description || '');

  // Trạng thái preview ảnh & danh mục
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Trạng thái lưu
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Lấy danh sách danh mục để chọn
  useEffect(() => {
    const fetchCats = async () => {
      setLoadingCategories(true);
      try {
        const data = await categoryService.getCategories();
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
        // Nếu tạo mới và chưa chọn danh mục thì mặc định chọn cái đầu tiên nếu có
        if (!isEdit && list.length > 0 && !categoryId) {
          setCategoryId(String(list[0].id));
        }
      } catch (err) {
        console.error('Không thể tải danh mục', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, [isEdit]);

  // Tìm tên danh mục đang chọn
  const selectedCategoryName = categories.find((c) => String(c.id) === String(categoryId))?.name || 'Chọn danh mục';

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tên khóa học.';
    }

    if (!instructor.trim()) {
      newErrors.instructor = 'Vui lòng nhập tên giảng viên.';
    }

    if (!categoryId) {
      newErrors.categoryId = 'Vui lòng chọn danh mục khóa học.';
    }

    if (!price.trim()) {
      newErrors.price = 'Vui lòng nhập học phí.';
    } else {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        newErrors.price = 'Học phí phải là số hợp lệ và không được âm (>= 0).';
      }
    }

    if (!duration.trim()) {
      newErrors.duration = 'Vui lòng nhập thời lượng khóa học.';
    } else {
      const numDuration = Number(duration);
      if (isNaN(numDuration) || numDuration <= 0) {
        newErrors.duration = 'Thời lượng phải là số lớn hơn 0.';
      }
    }

    if (!thumbnail.trim()) {
      newErrors.thumbnail = 'Vui lòng nhập URL ảnh thumbnail.';
    } else if (!/^https?:\/\/.+/i.test(thumbnail.trim())) {
      newErrors.thumbnail = 'URL ảnh phải bắt đầu bằng http:// hoặc https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Lưu khóa học
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        instructor: instructor.trim(),
        categoryId: categoryId,
        price: Number(price),
        duration: Number(duration),
        thumbnail: thumbnail.trim(),
        trailerUrl: trailerUrl.trim(),
        description: description.trim(),
      };

      if (isEdit) {
        await courseService.updateCourse(existingCourse.id, payload);
        Alert.alert('Thành công', 'Cập nhật khóa học thành công!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        payload.createdAt = getCurrentDateString();
        await courseService.createCourse(payload);
        Alert.alert('Thành công', 'Thêm khóa học mới thành công!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu khóa học.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header chỉ báo chế độ */}
          <View style={styles.formCard}>
            {/* 1. Tên khóa học */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Tên khóa học <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="VD: Lập trình React Native toàn diện"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={(val) => {
                  setTitle(val);
                  setErrors((prev) => ({ ...prev, title: '' }));
                }}
              />
              {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
            </View>

            {/* 2. Giảng viên */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Giảng viên phụ trách <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.instructor && styles.inputError]}
                placeholder="VD: Nguyễn Văn A"
                placeholderTextColor="#94A3B8"
                value={instructor}
                onChangeText={(val) => {
                  setInstructor(val);
                  setErrors((prev) => ({ ...prev, instructor: '' }));
                }}
              />
              {errors.instructor ? <Text style={styles.errorText}>{errors.instructor}</Text> : null}
            </View>

            {/* 3. Danh mục (Dropdown Selector) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Danh mục khóa học <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.selectBox, errors.categoryId && styles.inputError]}
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text style={categoryId ? styles.selectTextActive : styles.selectTextPlaceholder}>
                  {selectedCategoryName}
                </Text>
                <FontAwesome5 name="chevron-down" size={14} color="#64748B" />
              </TouchableOpacity>
              {errors.categoryId ? (
                <Text style={styles.errorText}>{errors.categoryId}</Text>
              ) : null}
            </View>

            {/* 4. Giá tiền & Thời lượng (2 cột) */}
            <View style={styles.rowFields}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>
                  Học phí (VNĐ) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.price && styles.inputError]}
                  placeholder="500000"
                  placeholderTextColor="#94A3B8"
                  value={price}
                  keyboardType="numeric"
                  onChangeText={(val) => {
                    setPrice(val);
                    setErrors((prev) => ({ ...prev, price: '' }));
                  }}
                />
                {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>
                  Thời lượng (Giờ) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.duration && styles.inputError]}
                  placeholder="30"
                  placeholderTextColor="#94A3B8"
                  value={duration}
                  keyboardType="numeric"
                  onChangeText={(val) => {
                    setDuration(val);
                    setErrors((prev) => ({ ...prev, duration: '' }));
                  }}
                />
                {errors.duration ? <Text style={styles.errorText}>{errors.duration}</Text> : null}
              </View>
            </View>

            {/* 5. URL Ảnh Thumbnail & Preview */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                URL Ảnh Thumbnail <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.thumbnail && styles.inputError]}
                placeholder="https://images.unsplash.com/..."
                placeholderTextColor="#94A3B8"
                value={thumbnail}
                autoCapitalize="none"
                onChangeText={(val) => {
                  setThumbnail(val);
                  setImageLoadError(false);
                  setErrors((prev) => ({ ...prev, thumbnail: '' }));
                }}
              />
              {errors.thumbnail ? (
                <Text style={styles.errorText}>{errors.thumbnail}</Text>
              ) : null}

              {/* Gợi ý URL mẫu */}
              <View style={styles.quickFillRow}>
                <Text style={styles.quickFillLabel}>Chọn nhanh ảnh mẫu:</Text>
                {SAMPLE_THUMBNAILS.map((url, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.quickFillBadge}
                    onPress={() => {
                      setThumbnail(url);
                      setImageLoadError(false);
                      setErrors((prev) => ({ ...prev, thumbnail: '' }));
                    }}
                  >
                    <Text style={styles.quickFillText}>Mẫu {idx + 1}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Khung Image Preview trực tiếp */}
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>Xem trước hình ảnh:</Text>
                {thumbnail.trim() && !imageLoadError ? (
                  <Image
                    source={{ uri: thumbnail.trim() }}
                    style={styles.previewImage}
                    resizeMode="cover"
                    onError={() => setImageLoadError(true)}
                  />
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <FontAwesome5 name="image" size={32} color="#CBD5E1" />
                    <Text style={styles.previewPlaceholderText}>
                      {imageLoadError
                        ? 'Không thể tải ảnh từ URL trên. Vui lòng kiểm tra lại.'
                        : 'Nhập đường dẫn ảnh hợp lệ để xem trước'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* 6. URL Video Trailer */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>URL Video Trailer (MP4)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://.../video.mp4"
                placeholderTextColor="#94A3B8"
                value={trailerUrl}
                autoCapitalize="none"
                onChangeText={setTrailerUrl}
              />
              {/* Gợi ý Video mẫu */}
              <View style={styles.quickFillRow}>
                <Text style={styles.quickFillLabel}>Chọn nhanh video mẫu:</Text>
                {SAMPLE_TRAILERS.map((url, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.quickFillBadge}
                    onPress={() => setTrailerUrl(url)}
                  >
                    <Text style={styles.quickFillText}>Video {idx + 1}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 7. Mô tả */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mô tả chi tiết</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập nội dung mô tả lộ trình và nội dung khóa học..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Nút Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <FontAwesome5
                    name={isEdit ? 'save' : 'plus-circle'}
                    size={17}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitBtnText}>
                    {isEdit ? 'Lưu thay đổi' : 'Tạo khóa học mới'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Chọn Danh Mục */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn danh mục khóa học</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <FontAwesome5 name="times" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            {loadingCategories ? (
              <ActivityIndicator size="small" color="#2563EB" style={{ margin: 20 }} />
            ) : categories.length === 0 ? (
              <Text style={styles.emptyCategoriesText}>
                Chưa có danh mục nào. Hãy tạo danh mục trước!
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {categories.map((cat) => {
                  const isSelected = String(cat.id) === String(categoryId);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryOption, isSelected && styles.categoryOptionSelected]}
                      onPress={() => {
                        setCategoryId(String(cat.id));
                        setErrors((prev) => ({ ...prev, categoryId: '' }));
                        setCategoryModalVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          isSelected && styles.categoryOptionTextSelected,
                        ]}
                      >
                        {cat.name}
                      </Text>
                      {isSelected && <FontAwesome5 name="check" size={14} color="#2563EB" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 90,
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectTextActive: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  selectTextPlaceholder: {
    fontSize: 15,
    color: '#94A3B8',
  },
  quickFillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  quickFillLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  quickFillBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quickFillText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    alignSelf: 'flex-start',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
  },
  previewPlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  previewPlaceholderText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyCategoriesText: {
    padding: 20,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  categoryOptionText: {
    fontSize: 15,
    color: '#334155',
  },
  categoryOptionTextSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
});
