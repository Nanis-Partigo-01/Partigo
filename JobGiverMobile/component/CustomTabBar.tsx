import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Create an Animated version of BlurView to handle the fade in/out smoothly
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Hardcoded tabs we want to show on the bottom bar
const tabs = [
  { name: "index", icon: "home", label: "Home" },
  { name: "CreateTicket", icon: "add", label: "" },
  { name: "TicketBank", icon: "receipt", label: "Tickets" },
];

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  };

  // Rotation for the + becoming an X
  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  // Blur and Overlay Fade (Opacity)
  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Popout visibility & bounce
  const popoutOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  const translateXGeneral = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -70],
  });

  const translateXSpecific = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 70],
  });

  // Get the actual active route name from React Navigation state
  const currentRouteName = state.routes[state.index].name;

  return (
    <>
      {/* 1. ANIMATED BLUR BACKDROP (Always rendered to allow fade-out) */}
      <TouchableWithoutFeedback onPress={expanded ? toggleMenu : undefined}>
        <AnimatedBlurView
          pointerEvents={expanded ? "auto" : "none"}
          intensity={30}
          tint="dark"
          style={[styles.blurOverlay, { opacity: backdropOpacity }]}
        />
      </TouchableWithoutFeedback>

      {/* 2. TAB BAR CONTAINER */}
      <View style={styles.tabBarContainer}>
        <View style={styles.innerRow}>
          {tabs.map((tab) => {
            // Check if this specific tab is the active one
            const isFocused = currentRouteName === tab.name;

            if (tab.name === "CreateTicket") {
              return (
                <View key={tab.name} style={styles.centerButtonContainer}>
                  {/* GENERAL OPTION (Left Popout) */}
                  <Animated.View
                    pointerEvents={expanded ? "auto" : "none"}
                    style={[
                      styles.popoutWrapper,
                      {
                        transform: [
                          { translateY },
                          { translateX: translateXGeneral },
                        ],
                        opacity: popoutOpacity,
                      },
                    ]}
                  >
                    <Pressable
                      onPress={() => {
                        toggleMenu();
                        router.push("/(modals)/CreateTicketModal");
                      }}
                      style={styles.popoutCircle}
                    >
                      <MaterialIcons name="category" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.popoutLabel}>General</Text>
                  </Animated.View>

                  {/* SPECIFIC OPTION (Right Popout) */}
                  <Animated.View
                    pointerEvents={expanded ? "auto" : "none"}
                    style={[
                      styles.popoutWrapper,
                      {
                        transform: [
                          { translateY },
                          { translateX: translateXSpecific },
                        ],
                        opacity: popoutOpacity,
                      },
                    ]}
                  >
                    <Pressable
                      onPress={() => {
                        toggleMenu();
                        // Add your specific route here if needed
                      }}
                      style={styles.popoutCircle}
                    >
                      <MaterialIcons name="work" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.popoutLabel}>Specific</Text>
                  </Animated.View>

                  {/* MAIN ACTION BUTTON (+) */}
                  <View style={styles.anchor}>
                    <Animated.View
                      style={{ transform: [{ rotate: rotation }] }}
                    >
                      <Pressable
                        onPress={toggleMenu}
                        style={styles.mainActionButton}
                      >
                        <Ionicons name="add" size={32} color="white" />
                      </Pressable>
                    </Animated.View>
                  </View>
                </View>
              );
            }

            return (
              <Pressable
                key={tab.name}
                onPress={() => {
                  if (expanded) toggleMenu(); // Close menu if clicking another tab
                  navigation.navigate(tab.name);
                }}
                style={styles.tabItem}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={24}
                  color={isFocused ? "#1FA2A6" : "#9CA3AF"}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: isFocused ? "#1FA2A6" : "#9CA3AF" },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  blurOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height, // Forces it to cover the entire screen upwards
    zIndex: 80,
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 20, // Adjust for iOS home indicator
    elevation: 30,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  innerRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Spread evenly
    alignItems: "center",
    paddingHorizontal: 20,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  anchor: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -40, // Pulls the button up out of the bar
    zIndex: 120,
  },
  mainActionButton: {
    width: 56,
    height: 56,
    backgroundColor: "#1FA2A6",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "white",
    elevation: 8,
    shadowColor: "#1FA2A6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  popoutWrapper: {
    position: "absolute",
    alignItems: "center",
    top: -10, // Start slightly higher than the center button
    zIndex: 110,
  },
  popoutCircle: {
    width: 50,
    height: 50,
    backgroundColor: "#1FA2A6",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  popoutLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
