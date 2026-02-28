import axios from "axios";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

console.log("API Base URL: seekers", BASE_URL);

export const fetchNearbySeekersapi = async (data: {
  lat: number;
  lng: number;
}) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/seekers/nearby?lat=${data.lat}&lng=${data.lng}`,
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching seekers:", error);
  }
};

export const getTopRankedSeekers = async (
  period: "monthly" | "all-time",
  limit: number,
) => {
  period;
  const response = await axios.get(
    `${BASE_URL}/seekers/top-ranked?period=${period}&limit=${limit}`,
  );
  console.log(response.data);
  return response.data;
};
