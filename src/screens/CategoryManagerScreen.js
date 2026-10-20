import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import localStorageService from '../services/localStorageService';
import syncManager from '../services/syncManager';
import showAlert from '../utils/alert';
import { MSSV } from '../config/constants';

export default function CategoryManagerScreen({ navigation }) {
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [dishCounts, setDishCounts] = useState({});
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const [fetchedCats, fetchedDishes] = await Promise.all([
        localStorageService.getCategories(),
        localStorageService.getDishes({ includeDeleted: false }),
      ]);

      setCategories(fetchedCats);

      // Đếm số món thuộc từng danh mục
      const counts = {};
      fetchedDishes.forEach((d) => {
        const catId = String(d.dishCategoryId);
        counts[catId] = (counts[catId] || 0) + 1;
        if (catId.startsWith(`${MSSV}_cat_`)) {
          const numId = catId.replace(`${MSSV}_cat_`, '');
          counts[numId] = (counts[numId] || 0) + 1;
        } else {
          counts[`${MSSV}_cat_${catId}`] = (counts[`${MSSV}_cat_${catId}`] || 0) + 1;
        }
      });
      setDishCounts(counts);
    } catch (err) {
      console.error('[Load Categories Error]:', err);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Thêm danh mục mới
  const handleAddCategory = async () => {
    if (!name.trim()) {
      showAlert(t('common.error'), t('validation.requireCategoryName'));
      return;
    }

    try {
      await localStorageService.createCategory({
        [`${MSSV}_Name`]: name.trim(),
        [`${MSSV}_Description`]: description.trim(),
      });

      setName('');
      setDescription('');
      setShowAddForm(false);
      await loadCategories();
      syncManager.triggerAutoSync();
      showAlert(t('common.success'), t('common.savedSuccess'));
    } catch (err) {
      showAlert(t('common.error'), err.message);
    }
  };

  /**
   * Xử lý Xóa danh mục kèm RÀNG BUỘC QUAN HỆ:
   * Chặn không cho xóa loại món đang có món ăn trực thuộc!
   */
  const handleDeleteCategory = (cat) => {
    const linkedCount = dishCounts[cat.id] || 0;

    // Ràng buộc quan hệ: Chặn xóa nếu còn món
    if (linkedCount > 0) {
      if (Platform.OS === 'web') {
        window.alert(
          `${t('categories.cannotDeleteTitle')}\n\n${t('categories.cannotDeleteMsg')}`
        );
      } else {
        Alert.alert(
          t('categories.cannotDeleteTitle'),
          t('categories.cannotDeleteMsg')
        );
      }
      return;
    }

    if (Platform.OS === 'web') {
      const ok = window.confirm(
        `${t('categories.confirmDeleteTitle')}\n\n${t('categories.confirmDeleteMsg', { name: cat.name })}`
      );
      if (ok) {
        (async () => {
          try {
            await localStorageService.deleteCategory(cat.id);
            await loadCategories();
            syncManager.triggerAutoSync();
            window.alert(t('common.deletedSuccess'));
          } catch (err) {
            window.alert(err.message);
          }
        })();
      }
      return;
    }

    Alert.alert(
      t('categories.confirmDeleteTitle'),
      t('categories.confirmDeleteMsg', { name: cat.name }),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await localStorageService.deleteCategory(cat.id);
              await loadCategories();
              syncManager.triggerAutoSync();
              Alert.alert(t('common.success'), t('common.deletedSuccess'));
            } catch (err) {
              if (err.code === 'ERR_CATEGORY_HAS_DISHES') {
                Alert.alert(
                  t('categories.cannotDeleteTitle'),
                  t('categories.cannotDeleteMsg')
                );
              } else {
                Alert.alert(t('common.error'), err.message);
              }
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.navTitle}>{t('categories.title')}</Text>

        <TouchableOpacity
          style={styles.toggleFormBtn}
          onPress={() => setShowAddForm(!showAddForm)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={showAddForm ? 'close' : 'add'}
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* Form thêm loại món mới */}
      {showAddForm && (
        <View style={styles.addFormCard}>
          <Text style={styles.formTitle}>{t('categories.addNew')}</Text>

          <TextInput
            style={styles.input}
            placeholder={t('categories.namePlaceholder')}
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={[styles.input, styles.descInput]}
            placeholder={t('categories.descPlaceholder')}
            placeholderTextColor="#64748B"
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleAddCategory}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={16} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{t('categories.save')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Danh sách danh mục */}
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const count = dishCounts[item.id] || 0;
          return (
            <View style={styles.catCard}>
              <View style={styles.catIconWrap}>
                <Ionicons name="restaurant" size={20} color="#38BDF8" />
              </View>

              <View style={styles.catInfo}>
                <View style={styles.catHeaderRow}>
                  <Text style={styles.catName}>{item.name}</Text>
                  <View style={styles.dishCountBadge}>
                    <Text style={styles.dishCountText}>
                      {count} {t('nav.dishes').toLowerCase()}
                    </Text>
                  </View>
                </View>

                {item.description ? (
                  <Text style={styles.catDesc}>{item.description}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteCategory(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          );
        }}
      />
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
  toggleFormBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFormCard: {
    backgroundColor: '#1E293B',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  descInput: {
    minHeight: 40,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    marginTop: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  catIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  catInfo: {
    flex: 1,
  },
  catHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  catName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dishCountBadge: {
    backgroundColor: '#0F172A',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dishCountText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  catDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  deleteBtn: {
    padding: 8,
  },
});
