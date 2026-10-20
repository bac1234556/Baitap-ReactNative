import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DishListScreen from '../screens/DishListScreen';
import DishDetailScreen from '../screens/DishDetailScreen';
import DishFormScreen from '../screens/DishFormScreen';
import CategoryManagerScreen from '../screens/CategoryManagerScreen';
import syncManager from '../services/syncManager';
import { loadSavedLanguage } from '../i18n';

const Stack = createNativeStackNavigator();

export default function FoodNavigator() {
  useEffect(() => {
    // Khởi tạo mạng & ngôn ngữ
    syncManager.init();
    loadSavedLanguage();
  }, []);

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        initialRouteName="DishList"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#0F172A' },
        }}
      >
        <Stack.Screen name="DishList" component={DishListScreen} />
        <Stack.Screen name="DishDetail" component={DishDetailScreen} />
        <Stack.Screen name="DishForm" component={DishFormScreen} />
        <Stack.Screen name="CategoryManager" component={CategoryManagerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
