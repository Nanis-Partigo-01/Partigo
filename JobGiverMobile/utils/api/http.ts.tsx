import axios from "axios";
import Constants from "expo-constants";

export const http = axios.create({
  baseURL: Constants.expoConfig?.extra?.API_BASE_URL, // Android emulator
  // baseURL: 'http://localhost:3000', // iOS/Web
  headers: {
    "Content-Type": "application/json",
  },
});
