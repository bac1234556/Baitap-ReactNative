import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { courseService } from '../api/courseService';
import { categoryService } from '../api/categoryService';
import { formatCurrency } from '../utils/formatters';

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600';

export default function CourseListScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  // Lấy dữ liệu đồng thời cả khóa học và danh mục
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage('');

    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        courseService.getCourses(),
        categoryService.getCategories(),
      ]);
      setCourses(Array.isArray(coursesRes) ? coursesRes : []);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
    } catch (error) {
      setErrorMessage(error.message || 'Không thể tải danh sách dữ liệu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tự động làm mới khi quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Ánh xạ nhanh categoryId sang Category Name
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[String(cat.id)] = cat.name;
    });
    return map;
  }, [categories]);

  // Lọc khóa học theo title và category
  const filteredCourses = useMemo(() => {
    return courses.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        (item.title && item.title.toLowerCase().includes(searchQuery.trim().toLowerCase()));

      const matchesCategory =
        selectedCategoryId === 'all' ||
        String(item.categoryId) === String(selectedCategoryId);

      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategoryId]);

  // Render từng thẻ khóa học
  const renderCourseCard = ({ item }) => {
    const categoryName = categoryMap[String(item.categoryId)] || 'Khác';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
      >
        <Image
          source={{ uri: item.thumbnail || DEFAULT_THUMBNAIL }}
          style={styles.cardThumbnail}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{categoryName}</Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.infoRow}>
            <FontAwesome5 name="chalkboard-teacher" size={13} color="#64748B" />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.instructor || 'Chưa cập nhật'}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.priceText}>{formatCurrency(item.price)}</Text>
            <View style={styles.durationRow}>
              <FontAwesome5 name="clock" size={12} color="#64748B" />
              <Text style={styles.durationText}>{item.duration || 0} giờ</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Thanh công cụ trên cùng: Tìm kiếm & Nút Danh mục */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <FontAwesome5 name="search" size={15} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khóa học..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome5 name="times-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.categoryManageBtn}
          onPress={() => navigation.navigate('CategoryManage')}
          accessibilityLabel="Quản lý danh mục"
        >
          <FontAwesome5 name="folder-open" size={16} color="#2563EB" />
          <Text style={styles.categoryManageBtnText}>Danh mục</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Chips lọc theo danh mục */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              selectedCategoryId === 'all' && styles.chipActive,
            ]}
            onPress={() => setSelectedCategoryId('all')}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategoryId === 'all' && styles.chipTextActive,
              ]}
            >
              Tất cả ({courses.length})
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const count = courses.filter((c) => String(c.categoryId) === String(cat.id)).length;
            const isSelected = String(selectedCategoryId) === String(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedCategoryId(String(cat.id))}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {cat.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Nội dung danh sách / Trạng thái */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải danh sách khóa học...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerBox}>
          <FontAwesome5 name="exclamation-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Lỗi kết nối</Text>
          <Text style={styles.errorDescription}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData()}>
            <FontAwesome5 name="redo-alt" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCourseCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchData(true)}
              colors={['#2563EB']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <FontAwesome5 name="book-open" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Không có khóa học nào</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || selectedCategoryId !== 'all'
                  ? 'Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.'
                  : 'Chưa có khóa học nào. Hãy nhấn nút "+" bên dưới để thêm mới.'}
              </Text>
            </View>
          }
        />
      )}

      {/* FAB Nút thêm khóa học */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CourseForm')}
        accessibilityLabel="Thêm khóa học mới"
      >
        <FontAwesome5 name="plus" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  categoryManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  categoryManageBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  chipsWrapper: {
    paddingBottom: 8,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardThumbnail: {
    width: '100%',
    height: 160,
    backgroundColor: '#E2E8F0',
  },
  cardContent: {
    padding: 14,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#059669',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  durationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 12,
    marginBottom: 6,
  },
  errorDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
