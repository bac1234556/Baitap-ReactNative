import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bai2, Bai3, Bai4, Bai5 } from './src/exercises';

const EXERCISES = [
  {
    id: 'bai2',
    number: '02',
    title: 'Bài 2: Layout Flexbox',
    subtitle: 'Thực hành bố cục chia khối tỉ lệ flexbox, phối màu và responsive giao diện.',
    tags: ['Flexbox', 'Layout', 'UI Basics'],
    color: '#3B82F6',
    icon: 'grid-outline',
  },
  {
    id: 'bai3',
    number: '03',
    title: 'Bài 3: Xác thực Sinh viên',
    subtitle: 'Form nhập liệu với Regex kiểm tra định dạng MSSV, hiển thị lỗi realtime.',
    tags: ['Form Input', 'Regex', 'Validation'],
    color: '#8B5CF6',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'bai4',
    number: '04',
    title: 'Bài 4: Quản lý Sinh viên',
    subtitle: 'Quản lý CRUD, lưu trữ AsyncStorage, chọn ảnh đại diện & hỗ trợ đa ngôn ngữ i18n.',
    tags: ['CRUD', 'AsyncStorage', 'ImagePicker', 'i18n'],
    color: '#10B981',
    icon: 'people-outline',
  },
  {
    id: 'bai5',
    number: '05',
    title: 'Bài 5: Khóa học & Danh mục',
    subtitle: 'Tích hợp REST API (Axios + MockAPI), trình phát video Expo-AV, tìm kiếm & bộ lọc.',
    tags: ['Axios API', 'Video Player', 'MockAPI', 'Filter'],
    color: '#06B6D4',
    icon: 'school-outline',
  },
];

export default function App() {
  const [activeExercise, setActiveExercise] = useState(null);

  // Render bài tập được chọn
  if (activeExercise) {
    let ComponentToRender = null;
    let exerciseTitle = '';

    if (activeExercise === 'bai2') {
      ComponentToRender = Bai2;
      exerciseTitle = 'Bài 2: Layout Flexbox';
    } else if (activeExercise === 'bai3') {
      ComponentToRender = Bai3;
      exerciseTitle = 'Bài 3: Xác thực Sinh viên';
    } else if (activeExercise === 'bai4') {
      ComponentToRender = Bai4;
      exerciseTitle = 'Bài 4: Quản lý Sinh viên';
    } else if (activeExercise === 'bai5') {
      ComponentToRender = Bai5;
      exerciseTitle = 'Bài 5: Khóa học & Danh mục';
    }

    return (
      <View style={styles.exerciseWrapper}>
        <StatusBar barStyle="light-content" />
        
        {/* Nút thoát về Menu chính dạng Floating Pill */}
        <TouchableOpacity
          style={styles.floatingBackButton}
          onPress={() => setActiveExercise(null)}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          <Text style={styles.floatingBackText}>Về Menu</Text>
        </TouchableOpacity>

        {/* Màn hình bài tập */}
        <View style={styles.exerciseContent}>
          {ComponentToRender ? <ComponentToRender /> : null}
        </View>
      </View>
    );
  }

  // Render màn hình chính (Menu Dashboard)
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <View style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <View style={styles.chip}>
              <View style={styles.onlineDot} />
              <Text style={styles.chipText}>React Native • Expo SDK 52</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Baitap-ReactNative</Text>
          <Text style={styles.heroSubtitle}>
            Kho bài tập & Ứng dụng thực hành di động được phân chia theo module độc lập.
          </Text>
        </View>

        {/* Danh sách bài tập */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh sách bài tập ({EXERCISES.length})</Text>
          <Text style={styles.sectionSubtitle}>Chạm vào bài tập bất kỳ để chạy demo</Text>
        </View>

        <View style={styles.listContainer}>
          {EXERCISES.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => setActiveExercise(item.id)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: item.color + '18' }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSub}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </View>

              <View style={styles.tagRow}>
                {item.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            GitHub Repository: bac1234556/Baitap-ReactNative
          </Text>
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
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  listContainer: {
    gap: 14,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardHeaderText: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  tag: {
    backgroundColor: '#0F172A',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tagText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '500',
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
  },
  footerText: {
    color: '#475569',
    fontSize: 12,
  },

  // Exercise wrapper & Back button
  exerciseWrapper: {
    flex: 1,
    position: 'relative',
  },
  exerciseContent: {
    flex: 1,
  },
  floatingBackButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 16 : 48,
    right: 16,
    zIndex: 99999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#475569',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingBackText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
});
