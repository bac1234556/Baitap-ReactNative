import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';
import en from './en.json';
import vi from './vi.json';

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

// Khởi tạo i18next mặc định tiếng Anh ('en')
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'en', // Mặc định là English theo đặc tả
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
}

/**
 * Nạp ngôn ngữ đã lưu từ AsyncStorage khi mở app
 */
export const loadSavedLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (saved && (saved === 'en' || saved === 'vi')) {
      await i18n.changeLanguage(saved);
      return saved;
    }
  } catch (e) {
    console.warn('[i18n load language]:', e);
  }
  return 'en';
};

/**
 * Đổi ngôn ngữ và lưu vào AsyncStorage
 */
export const changeAppLanguage = async (newLang) => {
  try {
    await i18n.changeLanguage(newLang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang);
  } catch (e) {
    console.error('[i18n change language]:', e);
  }
};

export default i18n;
