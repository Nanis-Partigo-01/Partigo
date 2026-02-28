import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
export const CARD_WIDTH = width * 0.75; // Card takes up 75% of screen width

export default function WorkerCard({ worker, onPress }: any) {
  useEffect(() => {
    console.log("This is worker card", worker);
  }, []);
  return (
    // The key is adding this TouchableOpacity wrapper!
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.card, { width: CARD_WIDTH }]}>
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FACC15" />
          <Text style={styles.ratingText}>{worker.rating}</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarBorder}>
          <Image source={{ uri: worker.img }} style={styles.avatar} />
        </View>

        <Text style={styles.name}>{worker.name}</Text>
        <Text style={styles.role}>{worker.role}</Text>

        <Text style={styles.bio}>{worker.bio}</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Send Request</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 20,
    alignItems: "center",
    marginHorizontal: 10,
    position: "relative",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 8,
  },
  ratingContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 3,
  },
  avatarBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#1FA2A6",
    padding: 3,
    marginBottom: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  role: {
    fontSize: 12,
    color: "#1FA2A6",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  bio: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#1FA2A6",
    width: "100%",
    borderRadius: 15,
    paddingVertical: 12,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
});
