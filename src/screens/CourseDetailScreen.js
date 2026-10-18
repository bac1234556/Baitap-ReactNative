import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { courseService } from '../api/courseService';
import { categoryService } from '../api/categoryService';
import { formatCurrency, formatDate } from '../utils/formatters';

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600';

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params || {};

  const [course, setCourse] = useState(null);
  const [categoryName, setCategoryName] = useState('Khác');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Trạng thái Modal phát video
  const [isTrailerModalVisible, setIsTrailerModalVisible] = useState(false);
  const videoRef = useRef(null);

  // Lấy chi tiết khóa học và tên danh mục
  const fetchDetail = async () => {
    if (!courseId) {
      setErrorMessage('Không tìm thấy mã khóa học.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);

      // Lấy danh mục tương ứng
      if (courseData.categoryId) {
        try {
          const cat = await categoryService.getCategoryById(courseData.categoryId);
          setCategoryName(cat?.name || 'Khác');
        } catch {
          setCategoryName('Chưa phân loại');
        }
      }
    } catch (error) {
      setErrorMessage(error.message || 'Không thể tải chi tiết khóa học.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [courseId])
  );

  // Mở trình phát video
  const handleOpenTrailer = () => {
    if (!course?.trailerUrl || !course.trailerUrl.trim()) {
      Alert.alert('Thông báo', 'Khóa học này hiện chưa có video trailer giới thiệu.');
      return;
    }
    setIsTrailerModalVisible(true);
  };

  // Đóng video và dừng phát
  const handleCloseTrailer = async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.pauseAsync();
      }
    } catch (e) {
      console.log('Error pausing video:', e);
    }
    setIsTrailerModalVisible(false);
  };

  // Xử lý Xóa khóa học
  const executeDelete = async () => {
    setDeleting(true);
    try {
      await courseService.deleteCourse(courseId);
      Alert.alert('Thành công', 'Đã xóa khóa học thành công!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể xóa khóa học.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = () => {
    const confirmMsg = `Bạn có chắc chắn muốn xóa khóa học "${course?.title}" không?`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        executeDelete();
      }
    } else {
      Alert.alert('Xác nhận xóa', confirmMsg, [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: executeDelete,
        },
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.centerText}>Đang tải chi tiết khóa học...</Text>
      </View>
    );
  }

  if (errorMessage || !course) {
    return (
      <View style={styles.centerContainer}>
        <FontAwesome5 name="exclamation-triangle" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Lỗi</Text>
        <Text style={styles.centerText}>{errorMessage || 'Khóa học không tồn tại.'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Thumbnail và nút mở Trailer */}
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: course.thumbnail || DEFAULT_THUMBNAIL }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          {course.trailerUrl ? (
            <TouchableOpacity
              style={styles.playTrailerOverlayBtn}
              activeOpacity={0.8}
              onPress={handleOpenTrailer}
            >
              <View style={styles.playIconCircle}>
                <FontAwesome5 name="play" size={20} color="#FFFFFF" style={{ marginLeft: 3 }} />
              </View>
              <Text style={styles.playTrailerText}>Xem Trailer</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Thông tin khóa học */}
        <View style={styles.body}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{categoryName}</Text>
          </View>

          <Text style={styles.title}>{course.title}</Text>

          {/* Hộp học phí */}
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Học phí trọn gói:</Text>
            <Text style={styles.priceValue}>{formatCurrency(course.price)}</Text>
          </View>

          {/* Thông tin vắn tắt (Grid) */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <FontAwesome5 name="chalkboard-teacher" size={18} color="#2563EB" />
              <Text style={styles.metaLabel}>Giảng viên</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {course.instructor || 'Chưa rõ'}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <FontAwesome5 name="clock" size={18} color="#059669" />
              <Text style={styles.metaLabel}>Thời lượng</Text>
              <Text style={styles.metaValue}>{course.duration || 0} giờ</Text>
            </View>

            <View style={styles.metaItem}>
              <FontAwesome5 name="calendar-alt" size={18} color="#D97706" />
              <Text style={styles.metaLabel}>Ngày tạo</Text>
              <Text style={styles.metaValue}>{formatDate(course.createdAt)}</Text>
            </View>
          </View>

          {/* Nút Xem Trailer riêng biệt nếu muốn bấm to rõ */}
          {course.trailerUrl ? (
            <TouchableOpacity
              style={styles.trailerSecondaryBtn}
              onPress={handleOpenTrailer}
            >
              <FontAwesome5 name="video" size={16} color="#2563EB" />
              <Text style={styles.trailerSecondaryBtnText}>Phát video Trailer giới thiệu</Text>
            </TouchableOpacity>
          ) : null}

          {/* Mô tả khóa học */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả khóa học</Text>
            <Text style={styles.descriptionText}>
              {course.description && course.description.trim()
                ? course.description
                : 'Chưa có thông tin mô tả chi tiết cho khóa học này.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 2 Nút thao tác cố định ở thanh đáy */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => navigation.navigate('CourseForm', { course })}
        >
          <FontAwesome5 name="edit" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.actionBtnText}>Chỉnh sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <FontAwesome5 name="trash" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.actionBtnText}>Xóa khóa học</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal Video Player Trailer */}
      <Modal
        visible={isTrailerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseTrailer}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                Trailer: {course.title}
              </Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleCloseTrailer}>
                <FontAwesome5 name="times" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.videoWrapper}>
              <Video
                ref={videoRef}
                style={styles.videoPlayer}
                source={{ uri: course.trailerUrl || '' }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
                shouldPlay={true}
              />
            </View>

            <Text style={styles.videoHint}>
              Sử dụng các nút điều khiển trên video để dừng/phát hoặc tua.
            </Text>
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
  scrollContent: {
    paddingBottom: 110,
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    height: 230,
    backgroundColor: '#0F172A',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playTrailerOverlayBtn: {
    position: 'absolute',
    alignSelf: 'center',
    top: '35%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    gap: 10,
  },
  playIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTrailerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  body: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryBadgeText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 30,
    marginBottom: 16,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 15,
    color: '#065F46',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#059669',
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metaItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: 4,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  trailerSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 24,
  },
  trailerSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#3B82F6',
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  centerText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 10,
  },
  backBtn: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 550,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  closeBtn: {
    padding: 6,
  },
  videoWrapper: {
    width: '100%',
    height: 250,
    backgroundColor: '#000000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoHint: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
