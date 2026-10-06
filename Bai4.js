import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  Alert, TextInput, ActivityIndicator, SafeAreaView, StatusBar, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

// ==========================================
// MODULE 1: i18n Configuration (src/i18n)
// ==========================================
const vi = {
  translation: {
    homeTitle: "Danh sách Sinh viên",
    addStudent: "Thêm Sinh viên",
    editStudent: "Sửa",
    detailTitle: "Chi tiết Sinh viên",
    formAddTitle: "Thêm mới",
    formEditTitle: "Chỉnh sửa",
    name: "Họ và tên",
    studentCode: "Mã số SV",
    email: "Email",
    save: "Lưu",
    delete: "Xóa",
    confirmDeleteTitle: "Xác nhận xóa",
    confirmDeleteMsg: "Bạn có chắc chắn muốn xóa sinh viên này không?",
    confirmEditTitle: "Xác nhận sửa",
    confirmEditMsg: "Bạn có muốn lưu các thay đổi cho sinh viên này không?",
    yes: "Có",
    no: "Không",
    emptyList: "Chưa có sinh viên nào.",
    chooseImage: "Chọn ảnh đại diện",
    requireName: "Vui lòng nhập họ tên",
    requireCode: "Vui lòng nhập mã sinh viên",
    requireEmail: "Vui lòng nhập email hợp lệ",
    codeExists: "Mã sinh viên đã tồn tại!",
    permissionDenied: "Cần quyền truy cập thư viện ảnh!",
    success: "Thành công",
    error: "Lỗi",
  }
};

const en = {
  translation: {
    homeTitle: "Student List",
    addStudent: "Add Student",
    editStudent: "Edit",
    detailTitle: "Student Detail",
    formAddTitle: "Add New",
    formEditTitle: "Edit",
    name: "Full Name",
    studentCode: "Student ID",
    email: "Email",
    save: "Save",
    delete: "Delete",
    confirmDeleteTitle: "Confirm Delete",
    confirmDeleteMsg: "Are you sure you want to delete this student?",
    confirmEditTitle: "Confirm Update",
    confirmEditMsg: "Do you want to update this student's information?",
    yes: "Yes",
    no: "No",
    emptyList: "No students found.",
    chooseImage: "Choose Avatar",
    requireName: "Please enter full name",
    requireCode: "Please enter student ID",
    requireEmail: "Please enter a valid email",
    codeExists: "Student ID already exists!",
    permissionDenied: "Permission to access gallery is required!",
    success: "Success",
    error: "Error",
  }
};

const locales = Localization.getLocales();
const languageCode = locales && locales.length > 0 ? locales[0].languageCode : 'en';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3', // Required for React Native Android
  resources: { vi, en },
  lng: languageCode === 'vi' ? 'vi' : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// ==========================================
// MODULE 2: Storage Services (src/services/storage.ts)
// ==========================================
const STORAGE_KEY = '@students';

const getStudents = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get students", error);
    return [];
  }
};

const saveStudent = async (student) => {
  try {
    const students = await getStudents();
    const newStudents = [...students, student];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStudents));
  } catch (error) {
    console.error("Failed to save student", error);
  }
};

const updateStudent = async (updatedStudent) => {
  try {
    const students = await getStudents();
    const newStudents = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStudents));
  } catch (error) {
    console.error("Failed to update student", error);
  }
};

const deleteStudent = async (id) => {
  try {
    const students = await getStudents();
    const newStudents = students.filter(s => s.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStudents));
  } catch (error) {
    console.error("Failed to delete student", error);
  }
};

// ==========================================
// MODULE 3: Screens (src/screens)
// ==========================================

// --- HomeScreen ---
const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getStudents();
    setStudents(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('confirmDeleteMsg'))) {
        deleteStudent(id).then(loadData);
      }
    } else {
      Alert.alert(
        t('confirmDeleteTitle'),
        t('confirmDeleteMsg'),
        [
          { text: t('no'), style: 'cancel' },
          {
            text: t('yes'),
            style: 'destructive',
            onPress: async () => {
              await deleteStudent(id);
              loadData();
            }
          }
        ]
      );
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { student: item })}
    >
      <Image
        source={{ uri: item.avatarUri || 'https://via.placeholder.com/150' }}
        style={styles.avatarThumb}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDetail}>{t('studentCode')}: {item.studentCode}</Text>
        <Text style={styles.cardDetail}>{item.email}</Text>
      </View>
      <View style={styles.actionColumn}>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>{t('delete')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Form', { student: item })} style={styles.editListBtn}>
          <Text style={styles.editListText}>{t('editStudent')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>{t('emptyList')}</Text>}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Form')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// --- DetailScreen ---
const DetailScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { student } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.detailContainer}>
        <Image
          source={{ uri: student.avatarUri || 'https://via.placeholder.com/150' }}
          style={styles.avatarLarge}
        />
        <View style={styles.detailCard}>
          <Text style={styles.detailName}>{student.name}</Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>{t('studentCode')}: </Text>{student.studentCode}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>{t('email')}: </Text>{student.email}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('Form', { student })}
        >
          <Text style={styles.editBtnText}>{t('editStudent')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- FormScreen ---
const FormScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const isEdit = !!route.params?.student;
  const existingStudent = route.params?.student || {};

  const [name, setName] = useState(existingStudent.name || '');
  const [studentCode, setStudentCode] = useState(existingStudent.studentCode || '');
  const [email, setEmail] = useState(existingStudent.email || '');
  const [avatarUri, setAvatarUri] = useState(existingStudent.avatarUri || '');
  const [errors, setErrors] = useState({ name: '', studentCode: '', email: '' });

  const validateEmail = (emailStr) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(t('error'), t('permissionDenied'));
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    let newErrors = { name: '', studentCode: '', email: '' };
    let hasError = false;

    // Validate tên
    if (!name.trim()) {
      newErrors.name = t('requireName');
      hasError = true;
    } else {
      const words = name.trim().split(/\s+/);
      if (words.length < 2) {
        newErrors.name = "Vui lòng nhập đủ họ tên!";
        hasError = true;
      } else {
        const isAllCapitalized = words.every(word => {
          const firstChar = word.charAt(0);
          return firstChar === firstChar.toUpperCase() && firstChar.toUpperCase() !== firstChar.toLowerCase();
        });
        if (!isAllCapitalized) {
          newErrors.name = "Vui lòng viết hoa chữ cái đầu tiên của mỗi từ!";
          hasError = true;
        }
      }
    }

    // Validate MSSV
    if (!studentCode.trim()) {
      newErrors.studentCode = t('requireCode');
      hasError = true;
    } else {
      const studentIdRegex = /^B[A-Za-z]{2}(2[2-6])\d{3,4}$/;
      if (!studentIdRegex.test(studentCode.trim())) {
        newErrors.studentCode = "Mã số sinh viên không hợp lệ!";
        hasError = true;
      }
    }

    // Validate Email
    if (!validateEmail(email)) {
      newErrors.email = "Vui lòng nhập đúng định dạng Email!";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const allStudents = await getStudents();

    if (isEdit) {
      if (Platform.OS === 'web') {
        if (window.confirm(t('confirmEditMsg'))) {
          const updated = { ...existingStudent, name, studentCode, email, avatarUri };
          updateStudent(updated).then(() => navigation.goBack());
        }
      } else {
        Alert.alert(
          t('confirmEditTitle'),
          t('confirmEditMsg'),
          [
            { text: t('no'), style: 'cancel' },
            {
              text: t('yes'),
              onPress: async () => {
                const updated = { ...existingStudent, name, studentCode, email, avatarUri };
                await updateStudent(updated);
                navigation.goBack();
              }
            }
          ]
        );
      }
    } else {
      const exists = allStudents.some(s => s.studentCode === studentCode);
      if (exists) {
        setErrors(prev => ({ ...prev, studentCode: t('codeExists') }));
        return;
      }

      const newStudent = {
        id: Date.now().toString(),
        name,
        studentCode,
        email,
        avatarUri
      };
      await saveStudent(newStudent);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <TouchableOpacity onPress={handlePickImage} style={styles.imagePicker}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>{t('chooseImage')}</Text>
            </View>
          )}
        </TouchableOpacity>

        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        <TextInput
          style={[styles.input, errors.name ? styles.inputError : null]}
          placeholder={t('name')}
          value={name}
          onChangeText={(val) => { setName(val); setErrors(prev => ({ ...prev, name: '' })); }}
        />

        {errors.studentCode ? <Text style={styles.errorText}>{errors.studentCode}</Text> : null}
        <TextInput
          style={[styles.input, errors.studentCode ? styles.inputError : null]}
          placeholder={t('studentCode')}
          value={studentCode}
          onChangeText={(val) => { setStudentCode(val); setErrors(prev => ({ ...prev, studentCode: '' })); }}
          editable={!isEdit} // Block editing ID
        />

        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        <TextInput
          style={[styles.input, errors.email ? styles.inputError : null]}
          placeholder={t('email')}
          value={email}
          onChangeText={(val) => { setEmail(val); setErrors(prev => ({ ...prev, email: '' })); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{t('save')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ==========================================
// NAVIGATION (App Root)
// ==========================================
const Stack = createNativeStackNavigator();

export default function Bai4() {
  const { t } = useTranslation();

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: t('homeTitle') }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: t('detailTitle') }}
        />
        <Stack.Screen
          name="Form"
          component={FormScreen}
          options={({ route }) => ({
            title: route.params?.student ? t('formEditTitle') : t('formAddTitle')
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarThumb: { width: 64, height: 64, borderRadius: 32, marginRight: 15, backgroundColor: '#eee' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: '700', marginBottom: 4, color: '#2C3E50' },
  cardDetail: { fontSize: 14, color: '#7F8C8D', marginBottom: 2 },
  actionColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
  },
  deleteBtn: {
    backgroundColor: '#E74C3C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  editListBtn: {
    backgroundColor: '#3498DB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editListText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: { color: '#fff', fontSize: 32, fontWeight: '300', marginTop: -4 },

  // Detail Screen
  detailContainer: { alignItems: 'center', padding: 20 },
  avatarLarge: { width: 140, height: 140, borderRadius: 70, marginBottom: 20, borderWidth: 3, borderColor: '#4CAF50' },
  detailCard: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  detailName: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2C3E50' },
  detailText: { fontSize: 16, marginBottom: 12, color: '#34495E' },
  bold: { fontWeight: '700', color: '#2C3E50' },
  editBtn: {
    marginTop: 30,
    backgroundColor: '#3498DB',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  editBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Form Screen
  formContainer: { padding: 20 },
  errorText: { color: '#E74C3C', fontSize: 13, fontWeight: '600', marginBottom: 5, marginLeft: 5 },
  inputError: { borderColor: '#E74C3C', borderWidth: 1.5 },
  imagePicker: { alignSelf: 'center', marginBottom: 30 },
  avatarPreview: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BDBDBD',
    borderStyle: 'dashed',
  },
  avatarPlaceholderText: { color: '#757575', textAlign: 'center', fontSize: 14, padding: 10 },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#2C3E50',
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
