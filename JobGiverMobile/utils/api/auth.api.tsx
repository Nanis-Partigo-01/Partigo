import axios from "axios";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
// const BASE_URL = "http:localhost:3000";
console.log("Base_url", BASE_URL);
// ⚠️ If using Android Emulator:
// http://10.0.2.2:3000
// If real device: use your system IPs

export const loginApi = async (data: { email: string; password: string }) => {
  console.log("Sending login data:", data);
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, data);
    console.log("Response from API:", response.data);
    return response;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};

export const registerApi = (data: {
  email: string;
  password: string;
  phoneNumber: string;
  name: string;
  role?: string;
  companyName?: string;
  deviceId?: string;
}) => {
  try {
    console.log(data);
    const res = axios.post(`${BASE_URL}/auth/register`, data);
    return res;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};
