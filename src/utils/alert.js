import { Alert, Platform } from 'react-native';

/**
 * Hiển thị thông báo tương thích cả Web lẫn Native Mobile
 * Giải quyết triệt để vấn đề Alert.alert() bị no-op trên react-native-web
 */
export const showAlert = (title, message, buttons) => {
  const displayMsg = message ? `${title}\n\n${message}` : title;

  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(displayMsg);
      if (confirmed) {
        const confirmBtn =
          buttons.find(
            (b) =>
              b.style === 'destructive' ||
              b.text === 'OK' ||
              b.text === 'Yes' ||
              b.text === 'Có' ||
              b.text === 'Đồng ý' ||
              b.text === 'Đồng ý xóa'
          ) || buttons[1];
        if (confirmBtn && typeof confirmBtn.onPress === 'function') {
          confirmBtn.onPress();
        }
      } else {
        const cancelBtn = buttons.find((b) => b.style === 'cancel');
        if (cancelBtn && typeof cancelBtn.onPress === 'function') {
          cancelBtn.onPress();
        }
      }
    } else {
      window.alert(displayMsg);
      if (buttons && buttons[0] && typeof buttons[0].onPress === 'function') {
        buttons[0].onPress();
      }
    }
    return;
  }

  Alert.alert(title, message, buttons);
};

export default showAlert;
