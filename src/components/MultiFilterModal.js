import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function MultiFilterModal({
  visible,
  onClose,
  categories = [],
  currentFilters,
  onApply,
}) {
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState(
    currentFilters.category || ''
  );
  const [onlyAvailable, setOnlyAvailable] = useState(
    Boolean(currentFilters.onlyAvailable)
  );
  const [minPrice, setMinPrice] = useState(
    currentFilters.minPrice !== null && currentFilters.minPrice !== undefined
      ? String(currentFilters.minPrice)
      : ''
  );
  const [maxPrice, setMaxPrice] = useState(
    currentFilters.maxPrice !== null && currentFilters.maxPrice !== undefined
      ? String(currentFilters.maxPrice)
      : ''
  );
  const [sortBy, setSortBy] = useState(currentFilters.sortBy || 'default');

  // Cập nhật khi filter bên ngoài thay đổi
  useEffect(() => {
    if (visible) {
      setSelectedCategory(currentFilters.category || '');
      setOnlyAvailable(Boolean(currentFilters.onlyAvailable));
      setMinPrice(
        currentFilters.minPrice !== null && currentFilters.minPrice !== undefined
          ? String(currentFilters.minPrice)
          : ''
      );
      setMaxPrice(
        currentFilters.maxPrice !== null && currentFilters.maxPrice !== undefined
          ? String(currentFilters.maxPrice)
          : ''
      );
      setSortBy(currentFilters.sortBy || 'default');
    }
  }, [visible, currentFilters]);

  const handleApply = () => {
    const minVal = minPrice.trim() !== '' ? Number(minPrice) : null;
    const maxVal = maxPrice.trim() !== '' ? Number(maxPrice) : null;

    // Bắt lỗi khoảng giá
    if (minVal !== null && (isNaN(minVal) || minVal < 0)) {
      Alert.alert(t('common.error'), t('validation.valMinPriceNegative'));
      return;
    }

    if (maxVal !== null && (isNaN(maxVal) || maxVal < 0)) {
      Alert.alert(t('common.error'), t('validation.valMaxPriceNegative'));
      return;
    }

    if (minVal !== null && maxVal !== null && minVal > maxVal) {
      Alert.alert(t('common.error'), t('validation.valMinGreaterThanMax'));
      return;
    }

    onApply({
      category: selectedCategory,
      onlyAvailable,
      minPrice: minVal,
      maxPrice: maxVal,
      sortBy,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory('');
    setOnlyAvailable(false);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header Modal */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('filterModal.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. LỌC THEO DANH MỤC */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filterModal.category')}</Text>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    selectedCategory === '' && styles.chipActive,
                  ]}
                  onPress={() => setSelectedCategory('')}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategory === '' && styles.chipTextActive,
                    ]}
                  >
                    {t('filterModal.allCategories')}
                  </Text>
                </TouchableOpacity>

                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      selectedCategory === cat.id && styles.chipActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedCategory === cat.id && styles.chipTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 2. LỌC THEO TRẠNG THÁI KINH DOANH */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.sectionTitle}>
                    {t('filterModal.availability')}
                  </Text>
                  <Text style={styles.subText}>
                    {t('filterModal.onlyAvailable')}
                  </Text>
                </View>
                <Switch
                  value={onlyAvailable}
                  onValueChange={setOnlyAvailable}
                  thumbColor={onlyAvailable ? '#10B981' : '#64748B'}
                  trackColor={{ false: '#334155', true: '#065F46' }}
                />
              </View>
            </View>

            {/* 3. LỌC THEO KHOẢNG GIÁ */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('filterModal.priceRange')}
              </Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputBox}>
                  <Text style={styles.priceLabel}>
                    {t('filterModal.minPrice')}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                </View>

                <Text style={styles.priceDivider}>—</Text>

                <View style={styles.priceInputBox}>
                  <Text style={styles.priceLabel}>
                    {t('filterModal.maxPrice')}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="200,000"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>
              </View>
            </View>

            {/* 4. SẮP XẾP */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('filterModal.sortBy')}</Text>

              {[
                { key: 'default', label: t('filterModal.sortDefault') },
                { key: 'price_asc', label: t('filterModal.sortPriceAsc') },
                { key: 'price_desc', label: t('filterModal.sortPriceDesc') },
                { key: 'time_asc', label: t('filterModal.sortTimeAsc') },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.radioRow}
                  onPress={() => setSortBy(item.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {sortBy === item.key && (
                      <View style={styles.radioInnerCircle} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.radioLabel,
                      sortBy === item.key && styles.radioLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer nút hành động */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.resetBtnText}>
                {t('filterModal.reset')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>
                {t('filterModal.apply')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  subText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#1E293B',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#059669',
    borderColor: '#10B981',
  },
  chipText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInputBox: {
    flex: 1,
  },
  priceLabel: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  priceDivider: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 18,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  radioLabel: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  radioLabelActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  resetBtnText: {
    color: '#CBD5E1',
    fontWeight: '700',
    fontSize: 14,
  },
  applyBtn: {
    flex: 2,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
