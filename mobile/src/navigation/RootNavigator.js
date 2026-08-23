import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import MenuScreen from '../screens/MenuScreen';
import LoginScreen from '../screens/LoginScreen';
import StaffOrdersScreen from '../screens/StaffOrdersScreen';
import AdminMenuScreen from '../screens/AdminMenuScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Welcome' }} />
        <Stack.Screen name="Menu" component={MenuScreen} options={{ title: 'Menu' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
        <Stack.Screen name="StaffOrders" component={StaffOrdersScreen} options={{ title: 'Orders', headerBackVisible: false }} />
        <Stack.Screen name="AdminMenu" component={AdminMenuScreen} options={{ title: 'Manage Menu', headerBackVisible: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
