import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import FallbackImage from '../components/FallbackImage';
import localStorageService from '../services/localStorageService';
import syncManager from '../services/syncManager';
import showAlert from '../utils/alert';
import { MSSV } from '../config/constants';

// Ảnh gợi ý mẫu để người dùng thêm nhanh khi làm bài kiểm tra
const PRESET_IMAGE_SUGGESTIONS = [
  {
    name: 'Phở Bò',
    url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bún Chả',
    url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Gỏi Cuốn',
    url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bò Bít Tết',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Đồ Tráng Miệng',
    url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
  },
];

export default function DishFormScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { mode = 'create', dishId } = route.params || {};

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [preparationTime, setPreparationTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [inputImageUrl, setInputImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Nạp danh mục & thông tin món nếu là chế độ Sửa (Edit)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedCats = await localStorageService.getCategories();
        setCategories(fetchedCats);

        if (mode === 'edit' && dishId) {
          const dish = await localStorageService.getDishById(dishId);
          if (dish) {
            setName(dish.name);
            setPrice(String(dish.price));
            setPreparationTime(String(dish.preparationTime));
            setIsAvailable(dish.isAvailable);
            setDescription(dish.description || '');
            setSelectedCategoryId(dish.dishCategoryId);

            const parsedImgs = (dish.images || []).map((img, idx) => ({
              url: img.imageUrl,
              isThumbnail: img.isThumbnail,
            }));
            setImages(parsedImgs);
          }
        } else if (fetchedCats.length > 0) {
          setSelectedCategoryId(fetchedCats[0].id);
        }
      } catch (err) {
        console.error('[Form Fetch Data Error]:', err);
      }
    };

    fetchData();
  }, [mode, dishId]);

  // Thêm một ảnh mới từ Input URL
  const handleAddImage = (urlToAdd = null) => {
    const url = (urlToAdd || inputImageUrl).trim();
    if (!url) {
      showAlert(t('common.error'), t('validation.valImageRequired'));
      return;
    }

    const isFirstImage = images.length === 0;
    const newImageItem = {
      url,
      isThumbnail: isFirstImage, // Ảnh đầu tiên tự động thành Thumbnail
    };

    setImages([...images, newImageItem]);
    if (!urlToAdd) {
      setInputImageUrl('');
    }
  };

  // Chọn 1 ảnh DUY NHẤT làm Thumbnail
  const handleSelectThumbnail = (targetIndex) => {
    const updated = images.map((img, idx) => ({
      ...img,
      isThumbnail: idx === targetIndex,
    }));
    setImages(updated);
  };

  // Xóa ảnh khỏi danh sách
  const handleRemoveImage = (targetIndex) => {
    const removingThumbnail = images[targetIndex]?.isThumbnail;
    const updated = images.filter((_, idx) => idx !== targetIndex);

    // Nếu vừa xóa ảnh thumbnail và danh sách vẫn còn ảnh khác, tự động chọn ảnh đầu làm thumbnail
    if (removingThumbnail && updated.length > 0) {
      updated[0].isThumbnail = true;
    }

    setImages(updated);
  };

  // Xử lý Lưu món ăn
  const handleSave = async () => {
    // 1. Kiểm tra validation cơ bản
    if (!name.trim()) {
      showAlert(t('common.error'), t('validation.valNameRequired'));
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      showAlert(t('common.error'), t('validation.valPricePositive'));
      return;
    }

    const numPrep = Number(preparationTime);
    if (isNaN(numPrep) || numPrep <= 0 || !Number.isInteger(numPrep)) {
      showAlert(t('common.error'), t('validation.valPrepTimePositive'));
      return;
    }

    if (!selectedCategoryId) {
      showAlert(t('common.error'), t('validation.valCategoryRequired'));
      return;
    }

    if (images.length === 0) {
      showAlert(t('common.error'), t('validation.valImageRequired'));
      return;
    }

    setSaving(true);

    try {
      // Đảm bảo có đúng 1 ảnh Thumbnail
      const hasThumb = images.some((img) => img.isThumbnail);
      const finalImages = images.map((img, idx) => ({
        [`${MSSV}_ImageUrl`]: img.url,
        [`${MSSV}_IsThumbnail`]: hasThumb ? img.isThumbnail : idx === 0,
      }));

      const catObj = categories.find(
        (c) =>
          String(c.id) === String(selectedCategoryId) ||
          String(c.id) === String(selectedCategoryId).replace(`${MSSV}_cat_`, '') ||
          String(selectedCategoryId) === `${MSSV}_cat_${c.id}`
      );
      const categoryName = catObj ? catObj.name : '';

      const dishPayload = {
        [`${MSSV}_Name`]: name.trim(),
        [`${MSSV}_Price`]: numPrice,
        [`${MSSV}_PreparationTime`]: numPrep,
        [`${MSSV}_IsAvailable`]: isAvailable,
        [`${MSSV}_Description`]: description.trim(),
        [`${MSSV}_DishCategoryId`]: selectedCategoryId,
        [`${MSSV}_CategoryName`]: categoryName,
        [`${MSSV}_Images`]: finalImages,
      };

      if (mode === 'edit' && dishId) {
        await localStorageService.updateDish(dishId, dishPayload);
      } else {
        await localStorageService.createDish(dishPayload);
      }

      // Kích hoạt đồng bộ ngầm ngay nếu đang online
      syncManager.triggerAutoSync();

      showAlert(t('common.success'), t('common.savedSuccess'), [
        {
          text: t('common.ok'),
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      // Bắt lỗi ràng buộc không trùng tên món ăn trong cùng danh mục
      if (err.code === 'valDuplicateNameInCategory') {
        showAlert(t('common.error'), t('validation.valDuplicateNameInCategory'));
      } else {
        showAlert(t('common.error'), err.message || 'Error saving dish');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header Form */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.navTitle}>
          {mode === 'edit' ? t('form.editTitle') : t('form.createTitle')}
        </Text>

        <TouchableOpacity
          style={[styles.saveHeaderBtn, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveHeaderText}>{t('form.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. CHỌN LOẠI MÓN ĂN (CATEGORY) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('form.categoryLabel')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillRow}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categorySelectPill,
                    isSelected && styles.categorySelectActive,
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={isSelected ? '#FFFFFF' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.categorySelectText,
                      isSelected && styles.categorySelectTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 2. TÊN MÓN ĂN */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('form.nameLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('form.namePlaceholder')}
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* 3. GIÁ TIỀN & THỜI GIAN CHẾ BIẾN (2 CỘT) */}
        <View style={styles.twoColRow}>
          <View style={[styles.formGroup, styles.colHalf]}>
            <Text style={styles.label}>{t('form.priceLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('form.pricePlaceholder')}
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          <View style={[styles.formGroup, styles.colHalf]}>
            <Text style={styles.label}>{t('form.prepTimeLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('form.prepTimePlaceholder')}
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={preparationTime}
              onChangeText={setPreparationTime}
            />
          </View>
        </View>

        {/* Ghi chú nhãn tốc độ tự động theo số phút */}
        {preparationTime ? (
          <View style={styles.speedHintBox}>
            <Ionicons
              name={Number(preparationTime) <= 15 ? 'flash' : 'time-outline'}
              size={14}
              color={Number(preparationTime) <= 15 ? '#10B981' : '#3B82F6'}
            />
            <Text style={styles.speedHintText}>
              {Number(preparationTime) <= 15
                ? 'Nhãn tốc độ: QUICK (≤ 15 phút)'
                : 'Nhãn tốc độ: REGULAR (> 15 phút)'}
            </Text>
          </View>
        ) : null}

        {/* 4. TRẠNG THÁI KINH DOANH (AVAILABLE) */}
        <View style={styles.switchBox}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchTitle}>{t('form.isAvailableLabel')}</Text>
            <Text style={styles.switchDesc}>{t('form.isAvailableDesc')}</Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            thumbColor={isAvailable ? '#10B981' : '#64748B'}
            trackColor={{ false: '#334155', true: '#065F46' }}
          />
        </View>

        {/* 5. MÔ TẢ MÓN ĂN */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('form.descLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('form.descPlaceholder')}
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* 6. QUẢN LÝ DANH SÁCH ẢNH (IMAGES & THUMBNAIL) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('form.imagesLabel')}</Text>
          <Text style={styles.subNote}>{t('form.thumbnailNote')}</Text>

          {/* Ô nhập URL ảnh */}
          <View style={styles.addImageRow}>
            <TextInput
              style={[styles.input, styles.urlInput]}
              placeholder={t('form.imageUrlPlaceholder')}
              placeholderTextColor="#64748B"
              value={inputImageUrl}
              onChangeText={setInputImageUrl}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.addImageBtn}
              onPress={() => handleAddImage()}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={16} color="#FFFFFF" />
              <Text style={styles.addImageBtnText}>{t('form.addImage')}</Text>
            </TouchableOpacity>
          </View>

          {/* Gợi ý ảnh nhanh */}
          <View style={styles.presetSection}>
            <Text style={styles.presetLabel}>{t('form.presetSuggestions')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetScroll}
            >
              {PRESET_IMAGE_SUGGESTIONS.map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetPill}
                  onPress={() => handleAddImage(preset.url)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetText}>{preset.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Danh sách các ảnh đã thêm */}
          <View style={styles.addedImagesList}>
            {images.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.imageItemRow,
                  item.isThumbnail && styles.imageItemThumbnailActive,
                ]}
              >
                <FallbackImage
                  source={{ uri: item.url }}
                  style={styles.imageItemThumb}
                />

                <View style={styles.imageItemInfo}>
                  <Text style={styles.imageItemUrl} numberOfLines={1}>
                    {item.url}
                  </Text>

                  <View style={styles.imageItemActions}>
                    {/* Nút chọn làm Thumbnail duy nhất */}
                    <TouchableOpacity
                      style={[
                        styles.thumbRadioBtn,
                        item.isThumbnail && styles.thumbRadioBtnActive,
                      ]}
                      onPress={() => handleSelectThumbnail(index)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={item.isThumbnail ? 'star' : 'star-outline'}
                        size={12}
                        color={item.isThumbnail ? '#FBBF24' : '#94A3B8'}
                      />
                      <Text
                        style={[
                          styles.thumbRadioText,
                          item.isThumbnail && styles.thumbRadioTextActive,
                        ]}
                      >
                        {item.isThumbnail
                          ? t('dishDetail.currentThumbnail')
                          : t('dishDetail.setAsThumbnail')}
                      </Text>
                    </TouchableOpacity>

                    {/* Nút Xóa ảnh */}
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => handleRemoveImage(index)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={13} color="#EF4444" />
                      <Text style={styles.removeImageText}>
                        {t('form.removeImage')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Nút Lưu Món Ăn Dưới Cùng */}
        <TouchableOpacity
          style={[styles.saveBigBtn, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveBigBtnText}>{t('form.save')}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
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
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    marginHorizontal: 12,
  },
  saveHeaderBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  saveHeaderText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subNote: {
    fontSize: 12,
    color: '#FBBF24',
    marginBottom: 8,
  },
  categoryPillRow: {
    gap: 8,
    paddingVertical: 4,
  },
  categorySelectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  categorySelectActive: {
    backgroundColor: '#059669',
    borderColor: '#10B981',
  },
  categorySelectText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  categorySelectTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    minHeight: 85,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },
  speedHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  speedHintText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  switchInfo: {
    flex: 1,
    paddingRight: 12,
  },
  switchTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  switchDesc: {
    color: '#64748B',
    fontSize: 12,
  },
  addImageRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  urlInput: {
    flex: 1,
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  addImageBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  presetSection: {
    marginBottom: 12,
  },
  presetLabel: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 6,
  },
  presetScroll: {
    gap: 6,
  },
  presetPill: {
    backgroundColor: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '600',
  },
  addedImagesList: {
    gap: 10,
  },
  imageItemRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  imageItemThumbnailActive: {
    borderColor: '#FBBF24',
    backgroundColor: '#1E293B',
  },
  imageItemThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  imageItemInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  imageItemUrl: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 6,
  },
  imageItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thumbRadioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  thumbRadioBtnActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  thumbRadioText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  thumbRadioTextActive: {
    color: '#FBBF24',
    fontWeight: '700',
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    gap: 3,
  },
  removeImageText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
  },
  saveBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
    gap: 8,
  },
  saveBigBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
