import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        
        {/* Hàng 1 và 2: Chia làm 2 cột (trái và phải) để đảm bảo canh lề chính xác */}
        <View style={styles.grid}>
          
          {/* Cột trái */}
          <View style={styles.column}>
            {/* Khối 1 */}
            <View style={[styles.box, styles.bgBlue]}>
              <Text style={styles.textWhite}>1</Text>
            </View>
            
            {/* Khối 3 và 4 (Nằm chung 1 hàng) */}
            <View style={styles.row}>
              <View style={[styles.box, styles.flex1, styles.bgYellow]}>
                <Text style={styles.textBlack}>3</Text>
              </View>
              <View style={[styles.box, styles.flex1, styles.bgGreen]}>
                <Text style={styles.textWhite}>4</Text>
              </View>
            </View>
          </View>
          
          {/* Cột phải */}
          <View style={styles.column}>
            {/* Khối 2 */}
            <View style={[styles.box, styles.bgRed]}>
              <Text style={styles.textWhite}>2</Text>
            </View>
            
            {/* Khối 5 */}
            <View style={[styles.box, styles.bgPurple]}>
              <Text style={styles.textWhite}>5</Text>
            </View>
          </View>

        </View>

        {/* Khối 6 */}
        <View style={[styles.box, styles.bgOrange, styles.box6]}>
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
  },
  grid: {
    flexDirection: 'row',
    gap: 12, // Khoảng cách giữa cột trái và cột phải
  },
  column: {
    flex: 1,
    gap: 12, // Khoảng cách theo chiều dọc giữa các khối trong cùng 1 cột
  },
  row: {
    flexDirection: 'row',
    gap: 12, // Khoảng cách theo chiều ngang giữa khối 3 và 4
  },
  box: {
    height: 150, // Chiều cao cố định cho các khối
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  box6: {
    marginTop: 12, // Khoảng cách giữa khối 6 và phần grid phía trên
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
  bgBlue: { backgroundColor: '#2B78E4' },
  bgRed: { backgroundColor: '#EA4335' },
  bgYellow: { backgroundColor: '#FDD835' },
  bgGreen: { backgroundColor: '#34A853' },
  bgPurple: { backgroundColor: '#8E24AA' },
  bgOrange: { backgroundColor: '#FB8C00' },
  
  // Footer
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
  },
});
