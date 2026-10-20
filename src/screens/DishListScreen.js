import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import NetworkStatusBar from '../components/NetworkStatusBar';
import DishCard from '../components/DishCard';
import MultiFilterModal from '../components/MultiFilterModal';
import EmptyState from '../components/EmptyState';
import localStorageService from '../services/localStorageService';
import syncManager from '../services/syncManager';
import { MSSV } from '../config/constants';

export default function DishListScreen({ navigation }) {
  const { t } = useTranslation();

  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Trạng thái tìm kiếm & Bộ lọc (Được giữ nguyên khi chuyển màn hình)
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    onlyAvailable: false,
    minPrice: null,
    maxPrice: null,
    sortBy: 'default',
  });

  // Tải dữ liệu từ Local DB mỗi khi màn hình được Focus
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedDishes, fetchedCats] = await Promise.all([
        localStorageService.getDishes({ includeDeleted: false }),
        localStorageService.getCategories(),
      ]);
      setDishes(fetchedDishes);
      setCategories(fetchedCats);
    } catch (err) {
      console.error('[Load Data Error]:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Đăng ký tự động reload dữ liệu khi syncManager có cập nhật
  useEffect(() => {
    const unsub = syncManager.subscribe(() => {
      loadData();
    });
    return () => unsub();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    syncManager.triggerAutoSync();
    loadData();
  };

  // Map Category ID -> Tên Category để hiển thị nhanh
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
      const strId = String(cat.id);
      if (strId.startsWith(`${MSSV}_cat_`)) {
        const numId = strId.replace(`${MSSV}_cat_`, '');
        map[numId] = cat.name;
      } else {
        map[`${MSSV}_cat_${strId}`] = cat.name;
      }
    });
    return map;
  }, [categories]);

  // Xử lý Xóa món ăn
  const handleDeleteDish = async (dishId) => {
    try {
      const isOffline = !syncManager.getState().isOnline;
      await localStorageService.deleteDish(dishId, isOffline);
      await loadData();
      Alert.alert(t('common.success'), t('common.deletedSuccess'));
      // Nếu online, kích hoạt auto sync ngay
      if (!isOffline) {
        syncManager.triggerAutoSync();
      }
    } catch (err) {
      Alert.alert(t('common.error'), err.message);
    }
  };

  // Áp dụng ĐA BỘ LỌC (Multi-filter) & Sắp xếp đồng thời
  const filteredDishes = useMemo(() => {
    // Hàm chuẩn hóa tiếng Việt bỏ dấu phục vụ tìm kiếm thông minh
    const normalizeVi = (str) =>
      String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .trim();

    return dishes
      .filter((dish) => {
        // 1. Tìm kiếm theo một phần tên món (case-insensitive & không dấu)
        if (searchQuery.trim() !== '') {
          const rawQuery = searchQuery.trim().toLowerCase();
          const normQuery = normalizeVi(searchQuery);

          const rawName = dish.name.toLowerCase();
          const normName = normalizeVi(dish.name);

          const matchName =
            rawName.includes(rawQuery) || normName.includes(normQuery);
          if (!matchName) return false;
        }

        // 2. Lọc theo danh mục
        if (filters.category) {
          const targetCat = String(filters.category);
          const dishCat = String(dish.dishCategoryId);
          const match =
            dishCat === targetCat ||
            dishCat === `${MSSV}_cat_${targetCat}` ||
            targetCat === `${MSSV}_cat_${dishCat}`;
          if (!match) return false;
        }

        // 3. Lọc theo trạng thái đang bán (chỉ hiện món available khi bật cờ này)
        if (filters.onlyAvailable && !dish.isAvailable) {
          return false;
        }

        // 4. Lọc theo khoảng giá: Min Price - Max Price
        const price = Number(dish.price);
        if (filters.minPrice !== null && price < filters.minPrice) {
          return false;
        }
        if (filters.maxPrice !== null && price > filters.maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sắp xếp
        if (filters.sortBy === 'price_asc') {
          return Number(a.price) - Number(b.price);
        }
        if (filters.sortBy === 'price_desc') {
          return Number(b.price) - Number(a.price);
        }
        if (filters.sortBy === 'time_asc') {
          return Number(a.preparationTime) - Number(b.preparationTime);
        }
        return 0; // default giữ nguyên thứ tự mới nhất
      });
  }, [dishes, searchQuery, filters]);

  // Đếm số lượng bộ lọc đang kích hoạt
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.onlyAvailable) count++;
    if (filters.minPrice !== null) count++;
    if (filters.maxPrice !== null) count++;
    if (filters.sortBy !== 'default') count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      category: '',
      onlyAvailable: false,
      minPrice: null,
      maxPrice: null,
      sortBy: 'default',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Thanh trạng thái Mạng & Đồng bộ Offline-First */}
      <NetworkStatusBar onDataChanged={loadData} />

      {/* Header chính: Tiêu đề + Các nút quản lý */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('appTitle')}</Text>
          <Text style={styles.headerSubtitle}>
            {t('dishList.totalDishes', { count: filteredDishes.length })}
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          {/* Nút sang trang Quản lý Danh mục */}
          <TouchableOpacity
            style={styles.categoryNavBtn}
            onPress={() => navigation.navigate('CategoryManager')}
            activeOpacity={0.8}
          >
            <Ionicons name="folder-open-outline" size={16} color="#38BDF8" />
            <Text style={styles.categoryNavText}>{t('nav.categories')}</Text>
          </TouchableOpacity>

          {/* Nút Thêm Món Ăn Mới */}
          <TouchableOpacity
            style={styles.addDishBtn}
            onPress={() => navigation.navigate('DishForm', { mode: 'create' })}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addDishText}>{t('nav.addDish')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Thanh tìm kiếm & Nút mở Modal Lọc */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('dishList.searchPlaceholder')}
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Nút mở Modal Bộ lọc nâng cao */}
        <TouchableOpacity
          style={[
            styles.filterTriggerBtn,
            activeFilterCount > 0 && styles.filterTriggerActive,
          ]}
          onPress={() => setIsFilterModalOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={activeFilterCount > 0 ? '#10B981' : '#CBD5E1'}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Thanh cuộn ngang các Danh mục để lọc nhanh */}
      <View style={styles.categoryTabs}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsContent}
          data={[{ id: '', name: t('filterModal.allCategories') }, ...categories]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = filters.category === item.id;
            return (
              <TouchableOpacity
                style={[styles.categoryTabPill, isSelected && styles.tabActive]}
                onPress={() => setFilters((prev) => ({ ...prev, category: item.id }))}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.tabText, isSelected && styles.tabTextActive]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Hiển thị dải Filter đang bật & nút Reset nhanh */}
      {(activeFilterCount > 0 || searchQuery.length > 0) ? (
        <View style={styles.activeFilterBar}>
          <Text style={styles.activeFilterLabel}>
            {t('dishList.activeFilters')}: {activeFilterCount}
          </Text>
          <TouchableOpacity onPress={handleResetFilters}>
            <Text style={styles.clearFilterText}>{t('dishList.clearFilter')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Danh sách món ăn */}
      <FlatList
        data={filteredDishes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
        renderItem={({ item }) => (
          <DishCard
            dish={item}
            categoryName={categoryMap[item.dishCategoryId]}
            onPress={() => navigation.navigate('DishDetail', { dishId: item.id })}
            onEdit={() =>
              navigation.navigate('DishForm', {
                mode: 'edit',
                dishId: item.id,
              })
            }
            onDelete={handleDeleteDish}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            actionLabel={t('dishList.addFirstDish')}
            onAction={() =>
              navigation.navigate('DishForm', { mode: 'create' })
            }
          />
        }
      />

      {/* Modal Đa bộ lọc & Sắp xếp */}
      <MultiFilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        categories={categories}
        currentFilters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryNavText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  addDishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  },
  addDishText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  filterTriggerBtn: {
    width: 42,
    height: 42,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
  },
  filterTriggerActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#10B981',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  categoryTabs: {
    paddingVertical: 6,
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTabPill: {
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  activeFilterLabel: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  clearFilterText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
});
