import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Platform, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  // Trạng thái điều hướng giữa 2 màn hình
  const [currentScreen, setCurrentScreen] = useState('Home');

  // Trạng thái lưu trữ dữ liệu người dùng nhập
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');

  // Xử lý sự kiện khi bấm nút Đăng nhập
  const handleLogin = () => {
    if (!studentName.trim() || !studentId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Họ tên và Mã số sinh viên');
      return;
    }
    setCurrentScreen('Screen2');
  };

  // MÀN HÌNH 2 (SCREEN 2)
  if (currentScreen === 'Screen2') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('Home')}>
            <Ionicons name="arrow-back" size={20} color="#333" />
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Thông tin sinh viên</Text>

          <View style={styles.card}>
            <Text style={styles.infoText}>Họ tên: {studentName}</Text>
            <Text style={styles.infoText}>MSSV: {studentId}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // MÀN HÌNH 1 (HOME)
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>

        {/* Hàng 1: Khối 1 và Khối 2 chia đều 50-50 */}
        <View style={styles.row}>
          <View style={[styles.box, styles.bgBlue, styles.flex1]}>
            <Text style={styles.textWhite}>1</Text>
          </View>
          <View style={[styles.box, styles.bgRed, styles.flex1]}>
            <Text style={styles.textWhite}>2</Text>
          </View>
        </View>

        {/* Hàng 2: Khối 3, 4, 5. Khối 3 và 4 chiếm 25%, Khối 5 chiếm 50% bằng đúng Khối 2 */}
        <View style={styles.row}>
          <View style={[styles.box, styles.bgYellow, styles.flex1]}>
            <Text style={styles.textBlack}>3</Text>
          </View>
          <View style={[styles.box, styles.bgGreen, styles.flex1]}>
            <Text style={styles.textWhite}>4</Text>
          </View>
          <View style={[styles.box, styles.bgPurple, { flex: 2 }]}>
            <Text style={styles.textWhite}>5</Text>
          </View>
        </View>

        {/* Khối 6: Nằm riêng biệt bên dưới */}
        <View style={[styles.box, styles.bgOrange, { flex: 1.5 }]}>
          <Text style={styles.textWhite}>6</Text>
        </View>

        {/* Form Nhập Thông Tin */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Nhập thông tin sinh viên</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={studentName}
            onChangeText={setStudentName}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your student ID"
            value={studentId}
            onChangeText={setStudentId}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </TouchableOpacity>
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
    gap: 12,
  },
  row: {
    flex: 1, // Chiếm chiều cao tương đối
    flexDirection: 'row',
    gap: 12,
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4, // Bo góc nhẹ cho giống app hiện đại (tuỳ chọn)
  },
  flex1: {
    flex: 1,
  },

  // Style chữ bên trong khối màu
  textWhite: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  textBlack: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00000036',
  },

  // Màu sắc khối
  bgBlue: { backgroundColor: '#73A5E5' }, // Màu xanh lam pastel như ảnh
  bgRed: { backgroundColor: '#F08080' }, // Màu đỏ pastel
  bgYellow: { backgroundColor: '#F0E68C' }, // Màu vàng nhạt
  bgGreen: { backgroundColor: '#8FBC8F' }, // Màu xanh lá mạ
  bgPurple: { backgroundColor: '#B39DDB' }, // Màu tím nhạt
  bgOrange: { backgroundColor: '#F4A460' }, // Màu cam đất

  // Form Thông tin
  formContainer: {
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#777777ff',
    marginBottom: 5,
  },
  input: {
    width: '80%',
    height: 45,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fcfcfc',
  },
  button: {
    backgroundColor: '#F4A460', // Màu nút giống màu khối 6
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Screen 2 Styles
  backButton: {
    flexDirection: 'row', // Sắp xếp icon và chữ theo hàng ngang
    alignItems: 'center', // Căn giữa icon và chữ
    gap: 4, // Khoảng cách giữa icon và chữ
    backgroundColor: '#F4A460',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 10,
  }
});
