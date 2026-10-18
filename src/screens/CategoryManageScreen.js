import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  RefreshControl,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { categoryService } from '../api/categoryService';
import { courseService } from '../api/courseService';

export default function CategoryManageScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modal Thêm/Sửa
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = Thêm mới
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Nạp danh sách danh mục
  const fetchCategories = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage('');

    try {
      const data = await categoryService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || 'Không thể tải danh sách danh mục.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Mở modal thêm mới
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setModalError('');
    setModalVisible(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setName(category.name || '');
    setDescription(category.description || '');
    setModalError('');
    setModalVisible(true);
  };

  // Lưu danh mục (Thêm hoặc Cập nhật)
  const handleSave = async () => {
    if (!name.trim()) {
      setModalError('Tên danh mục không được để trống.');
      return;
    }

    setSaving(true);
    setModalError('');
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
      };

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, payload);
      } else {
        await categoryService.createCategory(payload);
      }

      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      setModalError(error.message || 'Không thể lưu danh mục.');
    } finally {
      setSaving(false);
    }
  };

  // Xóa danh mục kèm KIỂM TRA RÀNG BUỘC TOÀN VẸN
  const handleDeleteCategory = async (category) => {
    setDeletingId(category.id);
    try {
      // 1. Fetch danh sách khóa học để kiểm tra
      const coursesRes = await courseService.getCourses();
      const courses = Array.isArray(coursesRes) ? coursesRes : [];

      // 2. Kiểm tra nếu có bất kỳ khóa học nào thuộc danh mục này
      const relatedCourses = courses.filter((c) => String(c.categoryId) === String(category.id));

      if (relatedCourses.length > 0) {
        setDeletingId(null);
        Alert.alert(
          'Không thể xóa',
          `Danh mục "${category.name}" đang có ${relatedCourses.length} khóa học, vui lòng chuyển hoặc xóa khóa học trước.`
        );
        return;
      }

      // 3. Nếu không có khóa học nào, hiển thị cảnh báo xác nhận xóa
      const confirmMsg = `Bạn có chắc chắn muốn xóa danh mục "${category.name}" không?`;

      const performDelete = async () => {
        try {
          await categoryService.deleteCategory(category.id);
          Alert.alert('Thành công', 'Đã xóa danh mục thành công!');
          fetchCategories();
        } catch (err) {
          Alert.alert('Lỗi', err.message || 'Không thể xóa danh mục.');
        } finally {
          setDeletingId(null);
        }
      };

      if (Platform.OS === 'web') {
        if (window.confirm(confirmMsg)) {
          performDelete();
        } else {
          setDeletingId(null);
        }
      } else {
        Alert.alert('Xác nhận xóa', confirmMsg, [
          {
            text: 'Hủy',
            style: 'cancel',
            onPress: () => setDeletingId(null),
          },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: performDelete,
          },
        ]);
      }
    } catch (error) {
      setDeletingId(null);
      Alert.alert('Lỗi', 'Không thể kiểm tra ràng buộc khóa học: ' + error.message);
    }
  };

  const renderItem = ({ item }) => {
    const isDeleting = deletingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.categoryDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : (
            <Text style={styles.categoryNoDesc}>Chưa có mô tả</Text>
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => handleOpenEdit(item)}
            accessibilityLabel="Chỉnh sửa danh mục"
          >
            <FontAwesome5 name="pen" size={14} color="#2563EB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteCategory(item)}
            disabled={isDeleting}
            accessibilityLabel="Xóa danh mục"
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <FontAwesome5 name="trash-alt" size={14} color="#EF4444" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Nút Thêm mới ở thanh tiêu đề phụ */}
      <View style={styles.headerBar}>
        <Text style={styles.headerSub}>Tổng số: {categories.length} danh mục</Text>
        <TouchableOpacity style={styles.addCategoryBtn} onPress={handleOpenAdd}>
          <FontAwesome5 name="plus" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addCategoryBtnText}>Thêm danh mục</Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung danh sách */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải danh mục...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerBox}>
          <FontAwesome5 name="exclamation-circle" size={44} color="#EF4444" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchCategories()}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchCategories(true)}
              colors={['#2563EB']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <FontAwesome5 name="folder-open" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>Chưa có danh mục nào.</Text>
              <Text style={styles.emptySubText}>
                Bấm vào nút "Thêm danh mục" phía trên để tạo danh mục đầu tiên.
              </Text>
            </View>
          }
        />
      )}

      {/* Modal Thêm / Chỉnh sửa danh mục */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome5 name="times" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            {modalError ? <Text style={styles.modalErrorText}>{modalError}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Tên danh mục <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="VD: Lập trình Mobile, Trí tuệ nhân tạo..."
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  setModalError('');
                }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Mô tả ngắn gọn về nhóm khóa học..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerSub: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  addCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCategoryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  categoryNoDesc: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  retryBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 14,
  },
  emptySubText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalErrorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 70,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    minWidth: 90,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
