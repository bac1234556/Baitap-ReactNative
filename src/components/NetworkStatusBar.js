import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage } from '../i18n';
import syncManager from '../services/syncManager';
import localStorageService from '../services/localStorageService';
import { MSSV } from '../config/constants';

export default function NetworkStatusBar({ onDataChanged }) {
  const { t, i18n } = useTranslation();
  const [syncState, setSyncState] = useState(syncManager.getState());
  const [pendingCount, setPendingCount] = useState(0);

  const currentLang = i18n.language || 'en';

  useEffect(() => {
    // Đăng ký theo dõi trạng thái đồng bộ
    const unsubscribe = syncManager.subscribe((state) => {
      setSyncState(state);
      refreshPendingCount();
    });

    refreshPendingCount();
    return () => unsubscribe();
  }, []);

  const refreshPendingCount = async () => {
    try {
      const pending = await localStorageService.getPendingSyncDishes();
      setPendingCount(pending.length);
    } catch (e) {
      console.warn('[refreshPendingCount]:', e);
    }
  };

  const handleToggleLanguage = async () => {
    const nextLang = currentLang === 'en' ? 'vi' : 'en';
    await changeAppLanguage(nextLang);
  };

  const handleToggleSimulate = () => {
    syncManager.toggleSimulatedOffline();
    refreshPendingCount();
    if (onDataChanged) onDataChanged();
  };

  const handleManualSync = async () => {
    if (!syncState.isOnline) {
      Alert.alert(
        t('status.offline'),
        t('status.offline') === 'Offline'
          ? 'Cannot sync while offline. Please turn off simulated offline or check network.'
          : 'Không thể đồng bộ khi mất mạng. Vui lòng tắt giả lập offline hoặc kết nối mạng.'
      );
      return;
    }

    const res = await syncManager.syncNow();
    await refreshPendingCount();
    if (onDataChanged) onDataChanged();

    if (res.success) {
      Alert.alert(
        t('common.success'),
        res.count > 0
          ? `${t('status.allSynced')} (${res.count})`
          : t('status.allSynced')
      );
    } else {
      Alert.alert(t('common.error'), res.error || 'Sync failed');
    }
  };

  const isOnline = syncState.isOnline && !syncState.simulatedOffline;

  return (
    <View style={styles.container}>
      {/* Hàng trên: Thông tin MSSV và Nút Đổi Ngôn Ngữ */}
      <View style={styles.topBar}>
        <View style={styles.studentBadge}>
          <Ionicons name="school" size={14} color="#60A5FA" />
          <Text style={styles.studentText}>{MSSV} • Lê Việt Bắc</Text>
        </View>

        <View style={styles.topActions}>
          {/* Nút chuyển đổi EN / VI */}
          <TouchableOpacity
            style={styles.langButton}
            onPress={handleToggleLanguage}
            activeOpacity={0.8}
          >
            <Ionicons name="globe-outline" size={14} color="#E2E8F0" />
            <Text style={styles.langText}>
              {currentLang.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hàng dưới: Trạng thái Mạng + Auto-Sync + Giả lập Offline */}
      <View
        style={[
          styles.networkRow,
          isOnline ? styles.bgOnline : styles.bgOffline,
        ]}
      >
        <View style={styles.networkStatusLeft}>
          <View
            style={[
              styles.statusDot,
              isOnline ? styles.dotOnline : styles.dotOffline,
            ]}
          />
          <Text style={styles.networkText}>
            {syncState.simulatedOffline
              ? t('status.simulatedOffline')
              : isOnline
              ? t('status.online')
              : t('status.offline')}
          </Text>

          {/* Badge số lượng đang chờ đồng bộ */}
          {pendingCount > 0 && (
            <View style={styles.pendingBadge}>
              <Ionicons name="cloud-upload-outline" size={12} color="#FFFFFF" />
              <Text style={styles.pendingText}>
                {t('status.pendingSync', { count: pendingCount })}
              </Text>
            </View>
          )}

          {pendingCount === 0 && isOnline && (
            <View style={styles.syncedBadge}>
              <Ionicons name="checkmark-circle-outline" size={12} color="#10B981" />
              <Text style={styles.syncedText}>{t('status.allSynced')}</Text>
            </View>
          )}
        </View>

        <View style={styles.networkActions}>
          {/* Nút Giả lập Offline để test tính năng Offline-First */}
          <TouchableOpacity
            style={[
              styles.actionPill,
              syncState.simulatedOffline ? styles.pillActive : styles.pillInactive,
            ]}
            onPress={handleToggleSimulate}
            activeOpacity={0.8}
          >
            <Ionicons
              name={syncState.simulatedOffline ? 'wifi-outline' : 'airplane-outline'}
              size={12}
              color="#FFFFFF"
            />
            <Text style={styles.pillText}>
              {syncState.simulatedOffline ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>

          {/* Nút Đồng bộ thủ công */}
          <TouchableOpacity
            style={[styles.syncButton, !isOnline && styles.btnDisabled]}
            onPress={handleManualSync}
            disabled={syncState.isSyncing || !isOnline}
            activeOpacity={0.8}
          >
            {syncState.isSyncing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="sync-outline" size={13} color="#FFFFFF" />
                <Text style={styles.syncButtonText}>{t('status.syncNow')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
  },
  studentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  studentText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    gap: 5,
  },
  langText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  bgOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  bgOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  networkStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: '#10B981',
  },
  dotOffline: {
    backgroundColor: '#EF4444',
  },
  networkText: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '600',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  pendingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  syncedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncedText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '500',
  },
  networkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  pillActive: {
    backgroundColor: '#DC2626',
  },
  pillInactive: {
    backgroundColor: '#334155',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
