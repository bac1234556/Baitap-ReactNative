import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        
        {/* Khối 1 */}
        <View style={[styles.box, styles.bgBlue, { flex: 1 }]}>
          <Text style={styles.textWhite}>1</Text>
        </View>

        {/* Khối 2 */}
        <View style={[styles.box, styles.bgRed, { flex: 1 }]}>
          <Text style={styles.textWhite}>2</Text>
        </View>

        {/* Khối 3, 4, 5 (Nằm chung 1 hàng) */}
        <View style={[styles.row, { flex: 2.5 }]}>
          <View style={[styles.box, styles.flex1, styles.bgYellow]}>
            <Text style={styles.textBlack}>3</Text>
          </View>
          <View style={[styles.box, styles.flex1, styles.bgGreen]}>
            <Text style={styles.textWhite}>4</Text>
          </View>
          <View style={[styles.box, styles.flex1, styles.bgPurple]}>
            <Text style={styles.textWhite}>5</Text>
          </View>
          {/* Ô rỗng tàng hình bên cạnh ô 5 để nó không bị tràn viền */}
          <View style={styles.flex1} />
        </View>

        {/* Khối 6 */}
        <View style={[styles.box, styles.bgOrange, { flex: 1.5 }]}>
          <Text style={styles.textWhite}>6</Text>
        </View>

        {/* Phần chân trang (Footer) */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Lê Việt Bắc-BIT240036</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 12, // Khoảng cách dọc giữa các hàng
  },
  row: {
    flexDirection: 'row',
    gap: 12, // Khoảng cách ngang giữa khối 3, 4, 5
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  
  // Styles cho Text
  textWhite: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  textBlack: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#000000',
  },
  
  // Mã màu tương ứng với thiết kế
  bgBlue: { backgroundColor: '#3B82F6' }, // Màu xanh lam
  bgRed: { backgroundColor: '#EF4444' }, // Màu đỏ
  bgYellow: { backgroundColor: '#FACC15' }, // Màu vàng
  bgGreen: { backgroundColor: '#22C55E' }, // Màu xanh lá
  bgPurple: { backgroundColor: '#8B5CF6' }, // Màu tím
  bgOrange: { backgroundColor: '#F97316' }, // Màu cam
  
  // Footer
  footer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
  },
});
