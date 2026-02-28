import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

export default function SearchingWorkerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { lat, lng } = params;

  // Animation for "Pulse" effect
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Start Pulse Animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 1500 }),
        withTiming(1, { duration: 0 }),
      ),
      -1,
      false,
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1500 }),
        withTiming(0.5, { duration: 0 }),
      ),
      -1,
      false,
    );

    // SIMULATION: Find a worker after 3 seconds
    const timer = setTimeout(() => {
      // Navigate to the Tracking Screen
      router.replace({
        pathname: "/(common)/JobLiveTrackingScreen", // Ensure this path matches your folder structure
        params: { ...params },
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const handleMinimize = () => {
    // Go to home, keeping "background" state implied
    router.dismissAll();
    router.push("/(tabs)/");
  };

  const handleCancel = () => {
    // Go back to Schedule Page to allow editing
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* MAP BACKGROUND */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: parseFloat(lat as string) || 12.9141,
          longitude: parseFloat(lng as string) || 74.856,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: parseFloat(lat as string),
            longitude: parseFloat(lng as string),
          }}
        >
          <View className="bg-[#1FA2A6] p-2 rounded-full border-2 border-white">
            <View className="w-2 h-2 bg-white rounded-full" />
          </View>
        </Marker>
      </MapView>

      {/* PULSE ANIMATION */}
      <View className="absolute inset-0 items-center justify-center pointer-events-none">
        <Animated.View
          style={[
            {
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "rgba(31, 162, 166, 0.3)",
            },
            animatedStyle,
          ]}
        />
      </View>

      {/* BOTTOM SHEET */}
      <View className="absolute bottom-0 w-full bg-white rounded-t-[30px] p-6 shadow-2xl">
        <View className="items-center mb-4">
          <View className="w-12 h-1 bg-gray-300 rounded-full" />
        </View>

        <Text className="text-xl font-bold text-gray-800 text-center mb-2">
          Finding nearby professionals...
        </Text>
        <Text className="text-gray-500 text-center text-xs mb-6">
          Connecting you with the best rated workers in your area.
        </Text>

        {/* Progress Bar */}
        <View className="h-1 bg-gray-100 w-full rounded-full overflow-hidden mb-8">
          <Animated.View
            style={{ width: "60%", height: "100%", backgroundColor: "#1FA2A6" }}
          />
        </View>

        <TouchableOpacity
          onPress={handleMinimize}
          className="bg-gray-100 py-4 rounded-2xl items-center mb-3"
        >
          <Text className="text-gray-700 font-bold">Wait in Background</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCancel}
          className="py-4 items-center bg-red-50 rounded-2xl"
        >
          <Text className="text-red-500 font-bold">Cancel Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
