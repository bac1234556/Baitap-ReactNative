import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CourseListScreen from '../screens/CourseListScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import CourseFormScreen from '../screens/CourseFormScreen';
import CategoryManageScreen from '../screens/CategoryManageScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        initialRouteName="CourseList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563EB',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
          contentStyle: {
            backgroundColor: '#F8FAFC',
          },
        }}
      >
        <Stack.Screen
          name="CourseList"
          component={CourseListScreen}
          options={{
            title: 'Khóa học trực tuyến',
          }}
        />
        <Stack.Screen
          name="CourseDetail"
          component={CourseDetailScreen}
          options={{
            title: 'Chi tiết khóa học',
          }}
        />
        <Stack.Screen
          name="CourseForm"
          component={CourseFormScreen}
          options={({ route }) => ({
            title: route.params?.course ? 'Cập nhật khóa học' : 'Thêm khóa học',
          })}
        />
        <Stack.Screen
          name="CategoryManage"
          component={CategoryManageScreen}
          options={{
            title: 'Quản lý danh mục',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
