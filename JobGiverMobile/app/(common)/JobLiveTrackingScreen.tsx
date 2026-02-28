import { useLocalSearchParams, useRouter } from "expo-router";
import {
    CheckCircle,
    MapPin,
    MessageCircle,
    Phone,
    ShieldCheck,
    Star,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

// Mock Data based on your Seeker Profile
const WORKER_DETAILS = {
  name: "Neha Mehta",
  role: "Professional Electrician",
  rating: "4.8",
  jobs: "2000+",
  image: "https://randomuser.me/api/portraits/women/44.jpg",
};

export default function JobLiveTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Coordinates
  const userLat = parseFloat(params.lat as string);
  const userLng = parseFloat(params.lng as string);

  // Simulate Worker Location (Offset by ~200m)
  const workerLat = userLat - 0.002;
  const workerLng = userLng - 0.002;

  // --- STATE ---
  const [jobStatus, setJobStatus] = useState<"ACCEPTED" | "ARRIVED">(
    "ACCEPTED",
  );
  const [showRatingModal, setShowRatingModal] = useState(false);

  // --- SIMULATE ARRIVAL (Timeout) ---
  useEffect(() => {
    const arrivalTimer = setTimeout(() => {
      setJobStatus("ARRIVED");
      Alert.alert(
        "Update",
        `${WORKER_DETAILS.name} has arrived at your location!`,
      );
    }, 5000); // 5 Seconds delay

    return () => clearTimeout(arrivalTimer);
  }, []);

  // --- HANDLERS ---
  const handleMarkCompleted = () => {
    // Only allow if arrived
    if (jobStatus === "ARRIVED") {
      setShowRatingModal(true);
    }
  };

  const submitRating = () => {
    setShowRatingModal(false);
    // Logic to submit rating to backend
    router.dismissAll();
    router.push("/(tabs)/");
  };

  const handleCancelWorker = () => {
    Alert.alert(
      "Cancel Worker?",
      "Are you sure? We will start searching for a new worker.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            // Navigate BACK to the searching screen
            router.replace({
              pathname: "/(common)/SearchingWorkerScreen",
              params: { ...params },
            });
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* --- MAP SECTION --- */}
      <View className="flex-1">
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: userLat,
            longitude: userLng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {/* User Location */}
          <Marker
            coordinate={{ latitude: userLat, longitude: userLng }}
            title="You"
          >
            <View className="bg-[#1FA2A6] p-2 rounded-full border-2 border-white shadow-sm">
              <MapPin size={16} color="white" />
            </View>
          </Marker>

          {/* Worker Location */}
          <Marker
            coordinate={{ latitude: workerLat, longitude: workerLng }}
            title={WORKER_DETAILS.name}
          >
            <View className="bg-white p-1 rounded-full border border-gray-200 shadow-sm">
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/3028/3028489.png",
                }}
                style={{ width: 35, height: 35 }}
              />
            </View>
          </Marker>

          {/* Path Line (Distance Visual) */}
          <Polyline
            coordinates={[
              { latitude: userLat, longitude: userLng },
              { latitude: workerLat, longitude: workerLng },
            ]}
            strokeColor="#1FA2A6"
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        </MapView>
      </View>

      {/* --- BOTTOM SHEET --- */}
      <View className="bg-white rounded-t-[30px] shadow-2xl p-6 -mt-6">
        {/* Status Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text
              className={`text-xs font-bold uppercase tracking-wider ${
                jobStatus === "ARRIVED" ? "text-green-600" : "text-orange-500"
              }`}
            >
              {jobStatus === "ARRIVED"
                ? "Worker has Arrived"
                : "Arriving in ~5 mins"}
            </Text>
            <Text className="text-xl font-black text-gray-800">
              {jobStatus === "ARRIVED" ? "Job In Progress" : "Worker Accepted"}
            </Text>
          </View>
          <View className="bg-green-100 px-3 py-1 rounded-lg flex-row items-center">
            <ShieldCheck size={14} color="#16A34A" />
            <Text className="text-green-700 text-xs font-bold ml-1">
              Verified
            </Text>
          </View>
        </View>

        {/* Worker Profile Card */}
        <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
          {/* PROFILE CLICK AREA */}
          <TouchableOpacity
            onPress={() => router.push("/(modals)/WorkerProfile")}
            className="flex-row items-center flex-1"
          >
            <Image
              source={{ uri: WORKER_DETAILS.image }}
              className="w-14 h-14 rounded-full border-2 border-white"
            />
            <View className="flex-1 ml-4">
              <Text className="text-lg font-bold text-gray-800">
                {WORKER_DETAILS.name}
              </Text>
              <View className="flex-row items-center">
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text className="text-gray-600 text-xs font-bold ml-1">
                  {WORKER_DETAILS.rating} ({WORKER_DETAILS.jobs})
                </Text>
              </View>
              <Text className="text-gray-400 text-xs mt-1">
                {WORKER_DETAILS.role}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            {/* CHAT BUTTON */}
            <TouchableOpacity
              onPress={() => router.push("/(common)/ChatScreen")}
              className="w-10 h-10 bg-white items-center justify-center rounded-full border border-gray-200"
            >
              <MessageCircle size={20} color="#1FA2A6" />
            </TouchableOpacity>

            {/* CALL BUTTON (Static for now) */}
            <TouchableOpacity className="w-10 h-10 bg-[#1FA2A6] items-center justify-center rounded-full">
              <Phone size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* OTP Section */}
        <View className="flex-row justify-between items-center border-b border-gray-100 pb-6 mb-6">
          <Text className="text-gray-500 font-medium">Start OTP</Text>
          <View className="flex-row gap-2">
            {[4, 8, 1, 2].map((num, i) => (
              <View
                key={i}
                className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center"
              >
                <Text className="font-bold text-gray-800">{num}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ACTIONS */}
        <View className="gap-3">
          {/* 1. Mark Completed (Disabled if not arrived) */}
          <TouchableOpacity
            onPress={handleMarkCompleted}
            disabled={jobStatus !== "ARRIVED"}
            className={`py-4 rounded-2xl items-center shadow-lg ${
              jobStatus === "ARRIVED"
                ? "bg-[#1FA2A6] shadow-teal-200"
                : "bg-gray-200"
            }`}
          >
            <Text
              className={`font-bold text-lg ${
                jobStatus === "ARRIVED" ? "text-white" : "text-gray-400"
              }`}
            >
              Mark Work Completed
            </Text>
          </TouchableOpacity>

          {/* 2. Wait in Background */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/")}
            className="py-2 items-center"
          >
            <Text className="text-gray-500 font-bold">Wait in Background</Text>
          </TouchableOpacity>

          {/* 3. Cancel Worker */}
          <TouchableOpacity
            onPress={handleCancelWorker}
            className="py-2 items-center"
          >
            <Text className="text-red-400 font-bold text-xs">
              Cancel & Find Another
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- RATING MODAL --- */}
      <Modal visible={showRatingModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[35px] p-8 items-center">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <CheckCircle size={32} color="#16A34A" />
            </View>

            <Text className="text-2xl font-black text-gray-800 mb-2">
              Job Completed!
            </Text>
            <Text className="text-gray-500 text-center mb-8">
              How was your experience with {WORKER_DETAILS.name}?
            </Text>

            <View className="flex-row gap-4 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star}>
                  <Star
                    size={32}
                    color={star <= 4 ? "#F59E0B" : "#E5E7EB"}
                    fill={star <= 4 ? "#F59E0B" : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Write a review (optional)"
              className="w-full bg-gray-50 p-4 rounded-xl mb-6 h-24 text-top"
              multiline
            />

            <TouchableOpacity
              onPress={submitRating}
              className="bg-[#1FA2A6] w-full py-4 rounded-2xl items-center"
            >
              <Text className="text-white font-bold text-lg">
                Submit Review
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
