import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Point this at your backend. On a physical device/emulator, 'localhost' won't
// reach your computer - use your machine's LAN IP instead (e.g. http://192.168.1.5:4000).
const DEV_HOST = Platform.OS === 'web' ? 'localhost' : 'localhost';
export const API_BASE_URL = `http://${DEV_HOST}:4000`;

const client = axios.create({ baseURL: `${API_BASE_URL}/api` });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
