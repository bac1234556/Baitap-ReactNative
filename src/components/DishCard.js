import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import FallbackImage from './FallbackImage';
import { SYNC_STATUS } from '../config/constants';

export default function DishCard({
  dish,
  categoryName,
  onPress,
  onEdit,
  onDelete,
}) {
  const { t } = useTranslation();

  const handleConfirmDelete = () => {
    if (Platform.OS === 'web') {
      const ok = window.confirm(
        `${t('dishDetail.confirmDeleteTitle')}\n\n${t('dishDetail.confirmDeleteMsg', { name: dish.name })}`
      );
      if (ok) {
        onDelete(dish.id);
      }
      return;
    }

    Alert.alert(
      t('dishDetail.confirmDeleteTitle'),
      t('dishDetail.confirmDeleteMsg', { name: dish.name }),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: () => onDelete(dish.id),
        },
      ]
    );
  };

  // Định dạng đơn giá tiền tệ
  const formattedPrice = Number(dish.price).toLocaleString('vi-VN');

  // Màu sắc & Nhãn của Sync Status
  const renderSyncBadge = () => {
    switch (dish.syncStatus) {
      case SYNC_STATUS.PENDING_CREATE:
        return (
          <View style={[styles.syncBadge, styles.syncPendingCreate]}>
            <Ionicons name="cloud-upload-outline" size={10} color="#D97706" />
            <Text style={styles.syncTextPendingCreate}>
              {t('status.pending_create')}
            </Text>
          </View>
        );
      case SYNC_STATUS.PENDING_UPDATE:
        return (
          <View style={[styles.syncBadge, styles.syncPendingUpdate]}>
            <Ionicons name="sync-outline" size={10} color="#2563EB" />
            <Text style={styles.syncTextPendingUpdate}>
              {t('status.pending_update')}
            </Text>
          </View>
        );
      case SYNC_STATUS.PENDING_DELETE:
        return (
          <View style={[styles.syncBadge, styles.syncPendingDelete]}>
            <Ionicons name="trash-outline" size={10} color="#DC2626" />
            <Text style={styles.syncTextPendingDelete}>
              {t('status.pending_delete')}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Cột trái: Ảnh Thumbnail + Nhãn Tốc Độ */}
      <View style={styles.imageWrapper}>
        <FallbackImage
          source={{ uri: dish.thumbnailUrl }}
          style={styles.thumbnail}
        />

        {/* Nhãn Tốc độ: Quick (<= 15m) hoặc Regular (> 15m) */}
        <View
          style={[
            styles.speedBadge,
            dish.isQuick ? styles.speedQuick : styles.speedRegular,
          ]}
        >
          <Ionicons
            name={dish.isQuick ? 'flash' : 'time-outline'}
            size={10}
            color="#FFFFFF"
          />
          <Text style={styles.speedText}>
            {dish.isQuick
              ? t('dishList.speedQuick')
              : t('dishList.speedRegular')}
          </Text>
        </View>

        {/* Trạng thái kinh doanh */}
        <View
          style={[
            styles.availDotBadge,
            dish.isAvailable ? styles.bgAvail : styles.bgUnavail,
          ]}
        >
          <Text style={styles.availDotText}>
            {dish.isAvailable ? t('status.available') : t('status.unavailable')}
          </Text>
        </View>
      </View>

      {/* Cột phải: Thông tin món ăn */}
      <View style={styles.infoWrapper}>
        <View style={styles.headerRow}>
          {categoryName ? (
            <Text style={styles.categoryText} numberOfLines={1}>
              {categoryName}
            </Text>
          ) : null}
          {renderSyncBadge()}
        </View>

        <Text style={styles.dishName} numberOfLines={2}>
          {dish.name}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.priceText}>{formattedPrice} ₫</Text>

          <View style={styles.timeRow}>
            <Ionicons name="timer-outline" size={13} color="#94A3B8" />
            <Text style={styles.timeText}>
              {dish.preparationTime} {t('dishList.prepTime', { minutes: '' }).trim()}
            </Text>
          </View>
        </View>

        {/* Nút thao tác nhanh: Sửa & Xóa */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={(e) => {
              e.stopPropagation();
              onEdit(dish);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={12} color="#60A5FA" />
            <Text style={styles.editText}>{t('dishDetail.edit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleConfirmDelete();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={12} color="#F87171" />
            <Text style={styles.deleteText}>{t('dishDetail.delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrapper: {
    width: 105,
    height: 105,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  speedBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 3,
  },
  speedQuick: {
    backgroundColor: '#059669', // Xanh lục đậm nổi bật
  },
  speedRegular: {
    backgroundColor: '#2563EB', // Xanh lam
  },
  speedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  availDotBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  bgAvail: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  bgUnavail: {
    backgroundColor: 'rgba(100, 116, 139, 0.9)',
  },
  availDotText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  infoWrapper: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 6,
    gap: 3,
  },
  syncPendingCreate: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
  },
  syncTextPendingCreate: {
    color: '#D97706',
    fontSize: 9,
    fontWeight: '700',
  },
  syncPendingUpdate: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  syncTextPendingUpdate: {
    color: '#3B82F6',
    fontSize: 9,
    fontWeight: '700',
  },
  syncPendingDelete: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
  },
  syncTextPendingDelete: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '700',
  },
  dishName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
    marginBottom: 4,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  editText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '600',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  deleteText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '600',
  },
});
