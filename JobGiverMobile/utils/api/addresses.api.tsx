import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance } from "axios";

/* ----------------------------------
   Config
----------------------------------- */

const API_BASE_URL = process.env.API_BASE_URL; // env later

/* ----------------------------------
   Axios Instance
----------------------------------- */

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ----------------------------------
   Interceptors
----------------------------------- */

// ✅ Attach token automatically
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Token", token);

    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("🔐 Unauthorized – logging out");

      await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
      // TODO: navigate to Login screen
    }

    return Promise.reject(error);
  },
);

/* ----------------------------------
   Types
----------------------------------- */

export enum LocationType {
  HOME = "HOME",
  WORK = "WORK",
  OTHER = "OTHER",
}

export enum AddressSourceType {
  MAP = "MAP",
  CURRENT_LOCATION = "CURRENT_LOCATION",
}

export type CreateAddressPayload = {
  label: string;
  streetAddress: string;
  city: string;
  latitude: number;
  longitude: number;
  locationType: LocationType;
  sourceType: AddressSourceType;
};

export type Address = {
  addressId: number;
  label: string;
  streetAddress: string;
  city: string;
  latitude: number;
  longitude: number;
  locationType: AddressSourceType;
};

/* ----------------------------------
   APIs
----------------------------------- */

// ✅ Create Address (manual / map)
export const createAddress = async (
  payload: CreateAddressPayload,
): Promise<{ addressId: number }> => {
  console.log(payload);
  const response = await api.post("/address", payload);
  return response.data;
};

// ✅ Get My Saved Addresses
export const getMyAddresses = async (): Promise<Address[]> => {
  const response = await api.get("/address/my");
  return response.data;
};
