import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  Bell,
  Info,
  LogOut,
  Search,
  Settings,
  User,
  XCircle,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Needed for notch support

const { height } = Dimensions.get("window");

// --- Animated Slide-Down Menu Component ---
const SlideDownMenu = ({ color = "black" }: { color?: string }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State to control Modal visibility
  const [isVisible, setIsVisible] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(-height)).current; // Starts off-screen (above)
  const fadeAnim = useRef(new Animated.Value(0)).current; // Starts completely transparent

  const openMenu = () => {
    setIsVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -height,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };

  const handleNavigate = (route: string) => {
    closeMenu();
    // Wait for animation to finish before navigating
    setTimeout(() => router.push(route as any), 300);
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          closeMenu();
          await AsyncStorage.removeItem("accessToken");
          setTimeout(() => router.replace("/(auth)/login"), 300);
        },
      },
    ]);
  };

  return (
    <>
      {/* Menu Trigger Button */}
      <TouchableOpacity onPress={openMenu} className="p-2 -ml-2">
        <Ionicons name="menu" size={32} color={color} />
      </TouchableOpacity>

      {/* Full Screen Modal */}
      <Modal visible={isVisible} transparent={true} animationType="none">
        {/* Dark Background Overlay (Pressable to close) */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            opacity: fadeAnim,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={closeMenu} />
        </Animated.View>

        {/* Sliding Menu Panel */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "white",
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            paddingTop: insets.top + 20, // Pushes content safely below the notch/status bar
            paddingBottom: 40,
            paddingHorizontal: 24,
            transform: [{ translateY: slideAnim }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          {/* Header inside the Menu */}
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-2xl font-extrabold text-gray-800 tracking-tight">
              Menu
            </Text>
            <TouchableOpacity
              onPress={closeMenu}
              className="p-2 bg-gray-100 rounded-full"
            >
              <XCircle color="#6B7280" size={24} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View className="space-y-1">
            <TouchableOpacity
              onPress={() => handleNavigate("/profile")}
              className="flex-row items-center px-5 py-4 bg-gray-50 rounded-2xl mb-3"
            >
              <User color="#1FA2A6" size={22} />
              <Text className="ml-4 text-gray-800 font-bold text-[17px]">
                Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleNavigate("/Settings")}
              className="flex-row items-center px-5 py-4 bg-gray-50 rounded-2xl mb-3"
            >
              <Settings color="#1FA2A6" size={22} />
              <Text className="ml-4 text-gray-800 font-bold text-[17px]">
                Settings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleNavigate("/about")}
              className="flex-row items-center px-5 py-4 bg-gray-50 rounded-2xl mb-6"
            >
              <Info color="#1FA2A6" size={22} />
              <Text className="ml-4 text-gray-800 font-bold text-[17px]">
                About Us
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="h-[1px] bg-gray-200 mb-6 mx-2" />

            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center px-5 py-4 bg-red-50 rounded-2xl"
            >
              <LogOut color="#EF4444" size={22} />
              <Text className="ml-4 text-red-500 font-bold text-[17px]">
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

// --- Main Custom Header Component ---
interface CustomHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  searchQuery?: string;
  setSearchQuery?: (text: string) => void;
}

export default function CustomHeader({
  title,
  subtitle = "",
  showSearch = false,
  searchQuery = "",
  setSearchQuery,
}: CustomHeaderProps) {
  return (
    <View className="bg-[#1FA2A6] pt-14 pb-8 px-6 rounded-b-[40px] shadow-lg z-10">
      {/* Top Row: Menu | Title | Bell */}
      <View
        className={`flex-row justify-between items-center ${
          showSearch ? "mb-6" : "mb-2"
        }`}
      >
        {/* Left: 3-Line Menu */}
        <View className="w-12 items-start justify-center">
          {/* Using the new SlideDownMenu instead of HeaderMenu */}
          <SlideDownMenu color="white" />
        </View>

        {/* Center: Stacked Title */}
        <View className="flex-1 items-center justify-center">
          {subtitle ? (
            <Text className="text-white/80 text-[10px] font-bold tracking-[2px] uppercase mb-0.5">
              {subtitle}
            </Text>
          ) : null}
          <Text className="text-white text-3xl font-extrabold tracking-tight">
            {title}
          </Text>
        </View>

        {/* Right: Bell Icon with Dot */}
        <View className="w-12 items-end justify-center">
          <TouchableOpacity className="p-2 relative">
            <Bell color="white" size={26} strokeWidth={2} />
            <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1FA2A6]" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conditional Search Bar */}
      {showSearch && (
        <View className="bg-white rounded-2xl flex-row items-center px-4 h-12 shadow-sm mt-2">
          <Search color="#9CA3AF" size={20} />
          <TextInput
            placeholder="Search tickets..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 h-full ml-3 text-gray-800 text-base font-medium"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && setSearchQuery && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="p-1"
            >
              <XCircle color="#D1D5DB" size={18} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
