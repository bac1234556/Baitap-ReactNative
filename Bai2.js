import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        
        {/* Khß╗æi 1 */}
        <View style={[styles.box, styles.bgBlue, { flex: 1 }]}>
          <Text style={styles.textWhite}>1</Text>
        </View>

        {/* Khß╗æi 2 */}
        <View style={[styles.box, styles.bgRed, { flex: 1 }]}>
          <Text style={styles.textWhite}>2</Text>
        </View>

        {/* Khß╗æi 3, 4, 5 (Nß║▒m chung 1 h├áng) */}
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
          {/* ├ö rß╗ùng t├áng h├¼nh b├¬n cß║ính ├┤ 5 ─æß╗â n├│ kh├┤ng bß╗ï tr├án viß╗ün */}
          <View style={styles.flex1} />
        </View>

        {/* Khß╗æi 6 */}
        <View style={[styles.box, styles.bgOrange, { flex: 1.5 }]}>
          <Text style={styles.textWhite}>6</Text>
        </View>

        {/* Phß║ºn ch├ón trang (Footer) */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>L├¬ Viß╗çt Bß║»c-BIT240036</Text>
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
    gap: 12, // Khoß║úng c├ích dß╗ìc giß╗»a c├íc h├áng
  },
  row: {
    flexDirection: 'row',
    gap: 12, // Khoß║úng c├ích ngang giß╗»a khß╗æi 3, 4, 5
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
  
  // M├ú m├áu t╞░╞íng ß╗⌐ng vß╗¢i thiß║┐t kß║┐
  bgBlue: { backgroundColor: '#3B82F6' }, // M├áu xanh lam
  bgRed: { backgroundColor: '#EF4444' }, // M├áu ─æß╗Å
  bgYellow: { backgroundColor: '#FACC15' }, // M├áu v├áng
  bgGreen: { backgroundColor: '#22C55E' }, // M├áu xanh l├í
  bgPurple: { backgroundColor: '#8B5CF6' }, // M├áu t├¡m
  bgOrange: { backgroundColor: '#F97316' }, // M├áu cam
  
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
