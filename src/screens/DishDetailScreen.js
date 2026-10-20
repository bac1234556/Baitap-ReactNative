import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import FallbackImage from '../components/FallbackImage';
import localStorageService from '../services/localStorageService';
import syncManager from '../services/syncManager';
import showAlert from '../utils/alert';
import { MSSV, SYNC_STATUS } from '../config/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DishDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { dishId } = route.params;

  const [dish, setDish] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const loadDish = useCallback(async () => {
    try {
      const foundDish = await localStorageService.getDishById(dishId);
      if (!foundDish) {
        showAlert(t('common.error'), 'Dish not found', [
          { text: t('common.ok'), onPress: () => navigation.goBack() }
        ]);
        return;
      }
      setDish(foundDish);

      const categories = await localStorageService.getCategories();
      const cat = categories.find(
        (c) =>
          String(c.id) === String(foundDish.dishCategoryId) ||
          String(c.id) === String(foundDish.dishCategoryId).replace(`${MSSV}_cat_`, '') ||
          String(foundDish.dishCategoryId) === `${MSSV}_cat_${c.id}`
      );
      if (cat) {
        setCategoryName(cat.name);
      }
    } catch (e) {
      console.error('[Load Dish Detail Error]:', e);
    }
  }, [dishId, navigation, t]);

  useFocusEffect(
    useCallback(() => {
      loadDish();
    }, [loadDish])
  );

  // Đổi ảnh Thumbnail đại diện cho món ăn
  const handleSetThumbnail = async (selectedIndex) => {
    if (!dish || !dish.images || !dish.images[selectedIndex]) return;

    try {
      const updatedImages = dish.images.map((img, idx) => ({
        ...img.toJSON(),
        [`${MSSV}_IsThumbnail`]: idx === selectedIndex,
      }));

      const isOffline = !syncManager.getState().isOnline;
      const updatedDish = await localStorageService.updateDish(
        dish.id,
        {
          [`${MSSV}_Images`]: updatedImages,
        },
        isOffline
      );

      setDish(updatedDish);
      showAlert(
        t('common.success'),
        t('dishDetail.currentThumbnail') + ' updated!'
      );
    } catch (e) {
      showAlert(t('common.error'), e.message);
    }
  };

  const handleDeleteDish = () => {
    if (Platform.OS === 'web') {
      const ok = window.confirm(
        `${t('dishDetail.confirmDeleteTitle')}\n\n${t('dishDetail.confirmDeleteMsg', { name: dish?.name })}`
      );
      if (ok) {
        (async () => {
          try {
            const isOffline = !syncManager.getState().isOnline;
            await localStorageService.deleteDish(dish.id, isOffline);
            if (!isOffline) {
              syncManager.triggerAutoSync();
            }
            navigation.goBack();
          } catch (err) {
            alert(err.message);
          }
        })();
      }
      return;
    }

    Alert.alert(
      t('dishDetail.confirmDeleteTitle'),
      t('dishDetail.confirmDeleteMsg', { name: dish?.name }),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              const isOffline = !syncManager.getState().isOnline;
              await localStorageService.deleteDish(dish.id, isOffline);
              if (!isOffline) {
                syncManager.triggerAutoSync();
              }
              navigation.goBack();
            } catch (err) {
              Alert.alert(t('common.error'), err.message);
            }
          },
        },
      ]
    );
  };

  if (!dish) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const images = dish.images.length > 0 ? dish.images : [{ imageUrl: '', isThumbnail: true }];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header điều hướng */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.navTitle} numberOfLines={1}>
          {dish.name}
        </Text>

        <TouchableOpacity
          style={styles.editHeaderBtn}
          onPress={() =>
            navigation.navigate('DishForm', {
              mode: 'edit',
              dishId: dish.id,
            })
          }
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={18} color="#60A5FA" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CAROUSEL / GALLERY ẢNH */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setActiveImageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {images.map((img, idx) => (
              <View key={idx} style={styles.slide}>
                <FallbackImage
                  source={{ uri: img.imageUrl }}
                  style={styles.carouselImage}
                />
                {img.isThumbnail && (
                  <View style={styles.currentThumbBadge}>
                    <Ionicons name="star" size={12} color="#FBBF24" />
                    <Text style={styles.currentThumbText}>
                      {t('dishDetail.currentThumbnail')}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Dấu chấm chỉ số slide */}
          {images.length > 1 && (
            <View style={styles.paginationDots}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    activeImageIndex === idx && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Nút hành động đổi thumbnail cho ảnh đang xem */}
        {images.length > 0 && !images[activeImageIndex]?.isThumbnail && (
          <TouchableOpacity
            style={styles.setThumbAction}
            onPress={() => handleSetThumbnail(activeImageIndex)}
            activeOpacity={0.8}
          >
            <Ionicons name="star-outline" size={16} color="#38BDF8" />
            <Text style={styles.setThumbActionText}>
              {t('dishDetail.setAsThumbnail')}
            </Text>
          </TouchableOpacity>
        )}

        {/* NỘI DUNG CHI TIẾT */}
        <View style={styles.infoCard}>
          {/* Danh mục & Nhãn tốc độ */}
          <View style={styles.badgeRow}>
            {categoryName ? (
              <View style={styles.categoryPill}>
                <Ionicons name="pricetag-outline" size={12} color="#38BDF8" />
                <Text style={styles.categoryPillText}>{categoryName}</Text>
              </View>
            ) : null}

            {/* Nhãn Tốc độ: Quick (<= 15m) hoặc Regular (> 15m) */}
            <View
              style={[
                styles.speedPill,
                dish.isQuick ? styles.speedQuick : styles.speedRegular,
              ]}
            >
              <Ionicons
                name={dish.isQuick ? 'flash' : 'time-outline'}
                size={12}
                color="#FFFFFF"
              />
              <Text style={styles.speedPillText}>
                {dish.isQuick ? t('status.quick') : t('status.regular')}
              </Text>
            </View>

            {/* Trạng thái kinh doanh */}
            <View
              style={[
                styles.availPill,
                dish.isAvailable ? styles.availOn : styles.availOff,
              ]}
            >
              <Text style={styles.availPillText}>
                {dish.isAvailable
                  ? t('status.available')
                  : t('status.unavailable')}
              </Text>
            </View>
          </View>

          {/* Tên món & Giá */}
          <Text style={styles.titleText}>{dish.name}</Text>
          <Text style={styles.priceHighlight}>
            {Number(dish.price).toLocaleString('vi-VN')} ₫
          </Text>

          {/* Bảng thông số phụ */}
          <View style={styles.gridStats}>
            <View style={styles.statBox}>
              <Ionicons name="timer-outline" size={18} color="#94A3B8" />
              <Text style={styles.statLabel}>{t('dishDetail.prepTime')}</Text>
              <Text style={styles.statValue}>
                {dish.preparationTime} {t('dishList.prepTime', { minutes: '' }).trim()}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Ionicons name="cloud-done-outline" size={18} color="#94A3B8" />
              <Text style={styles.statLabel}>{t('dishDetail.syncStatus')}</Text>
              <Text style={styles.statValue}>
                {t(`status.${dish.syncStatus}`)}
              </Text>
            </View>
          </View>

          {/* Mô tả chi tiết */}
          <View style={styles.descSection}>
            <Text style={styles.sectionHeading}>
              {t('dishDetail.description')}
            </Text>
            <Text style={styles.descBody}>
              {dish.description || t('dishDetail.noDescription')}
            </Text>
          </View>

          {/* Danh sách ảnh thu nhỏ trong Gallery (Chạm để đổi Thumbnail) */}
          {images.length > 1 && (
            <View style={styles.galleryThumbSection}>
              <Text style={styles.sectionHeading}>
                {t('dishDetail.gallery', { count: images.length })}
              </Text>
              <Text style={styles.subNote}>
                {t('dishDetail.tapToThumbnail')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryScroll}
              >
                {images.map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.smallThumbCard,
                      img.isThumbnail && styles.smallThumbActive,
                    ]}
                    onPress={() => handleSetThumbnail(idx)}
                    activeOpacity={0.8}
                  >
                    <FallbackImage
                      source={{ uri: img.imageUrl }}
                      style={styles.smallThumbImage}
                    />
                    {img.isThumbnail && (
                      <View style={styles.smallStarBadge}>
                        <Ionicons name="star" size={10} color="#FBBF24" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Nút Xóa món */}
          <TouchableOpacity
            style={styles.deleteFullBtn}
            onPress={handleDeleteDish}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={styles.deleteFullText}>{t('dishDetail.delete')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginHorizontal: 12,
  },
  editHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  carouselContainer: {
    width: SCREEN_WIDTH,
    height: 260,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: 260,
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  currentThumbBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  currentThumbText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#10B981',
  },
  setThumbAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38BDF8',
    gap: 6,
  },
  setThumbActionText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#1E293B',
    margin: 16,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  categoryPillText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  speedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  speedQuick: {
    backgroundColor: '#059669',
  },
  speedRegular: {
    backgroundColor: '#2563EB',
  },
  speedPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  availPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  availOn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  availOff: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  availPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 28,
  },
  priceHighlight: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10B981',
    marginBottom: 16,
  },
  gridStats: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  descSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descBody: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 22,
  },
  galleryThumbSection: {
    marginBottom: 20,
  },
  subNote: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 10,
  },
  galleryScroll: {
    gap: 10,
  },
  smallThumbCard: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  smallThumbActive: {
    borderColor: '#FBBF24',
  },
  smallThumbImage: {
    width: '100%',
    height: '100%',
  },
  smallStarBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 2,
  },
  deleteFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 8,
    marginTop: 6,
  },
  deleteFullText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
