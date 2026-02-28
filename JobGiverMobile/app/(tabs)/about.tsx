import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Bell, Search } from "lucide-react-native";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";

// --- Internal Header Menu Component ---
const HeaderMenu = ({ color = "black" }: { color?: string }) => {
  const router = useRouter();

  // Logout function moved here
  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken"); // remove JWT
    router.replace("/login"); // refresh RootLayout → shows auth stack
  };

  return (
    <Menu>
      <MenuTrigger>
        <Ionicons name="menu" size={30} color={color} />
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: {
            marginTop: 40,
            borderRadius: 12,
            paddingVertical: 5,
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          },
        }}
      >
        <MenuOption onSelect={() => router.push("/about")} text="About Us" />
        <MenuOption onSelect={() => router.push("/profile")} text="Profile" />
        <MenuOption onSelect={() => router.push("/Settings")} text="Settings" />

        {/* Custom Logout Option */}
        <MenuOption onSelect={handleLogout}>
          <Text
            style={{
              color: "red",
              paddingLeft: 8,
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            Logout
          </Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};

// --- Main Custom Header Component ---
interface CustomHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean; // Controls search bar visibility
  searchQuery?: string; // Made optional
  setSearchQuery?: (text: string) => void; // Made optional
}

export default function CustomHeader({
  title,
  subtitle = "",
  showSearch = false, // Defaults to false
  searchQuery = "",
  setSearchQuery,
}: CustomHeaderProps) {
  return (
    <View className="bg-[#1FA2A6] pt-14 pb-8 px-6 rounded-b-[35px] shadow-lg z-10">
      {/* Top Row: Menu | Title | Bell */}
      <View
        className={`flex-row justify-between items-start ${showSearch ? "mb-6" : "mb-0"}`}
      >
        {/* Left: 3-Line Menu */}
        <View className="mt-1">
          <HeaderMenu color="white" />
        </View>

        {/* Center: Stacked Title */}
        <View className="items-center">
          {subtitle ? (
            <Text className="text-white/80 text-sm font-medium tracking-widest uppercase">
              {subtitle}
            </Text>
          ) : null}
          <Text className="text-white text-3xl font-bold -mt-1 tracking-wide">
            {title}
          </Text>
        </View>

        {/* Right: Bell Icon with Dot */}
        <TouchableOpacity className="mt-2">
          <Bell color="white" size={26} />
          <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1FA2A6]" />
        </TouchableOpacity>
      </View>

      {/* Conditional Search Bar */}
      {showSearch && (
        <View className="bg-white rounded-2xl flex-row items-center px-4 h-12 shadow-sm">
          <Search color="#9CA3AF" size={20} />
          <TextInput
            placeholder="Search tickets..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 h-full ml-3 text-gray-700 text-base"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}
    </View>
  );
}
