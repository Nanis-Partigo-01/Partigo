import TicketCard, { TicketData } from "@/component/TicketCard";
import { fetchNearbySeekersapi } from "@/utils/api/seekers.api";
import { getMyTickets } from "@/utils/api/tickets.api";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { AlertCircle, ChevronRight, Clock, Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type Seeker = {
  name: string;
  seekerId: string;
  role: string;
  bio: string;
  rating: number;
  distanceKm: number;
  profileImage?: string | null;
  latitude?: number; // Added to handle map markers
  longitude?: number; // Added to handle map markers
};

export default function Home() {
  const router = useRouter();

  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [loadingSeekers, setLoadingSeekers] = useState(true);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [seekers, setSeekers] = useState<Seeker[]>([]);

  // State for the Active Ticket
  const [activeTicket, setActiveTicket] = useState<TicketData | null>(null);

  // ---------------------------
  // 1️⃣ Fetch Active Ticket on Screen Focus
  // ---------------------------
  useFocusEffect(
    useCallback(() => {
      fetchActiveTicket();
    }, []),
  );

  const fetchActiveTicket = async () => {
    setLoadingTicket(true);
    try {
      const allTickets = await getMyTickets();
      const active = allTickets.find(
        (t: any) =>
          t.display_status === "Accepted" ||
          t.display_status === "In Progress" ||
          t.display_status === "Searching",
      );

      if (active) {
        setActiveTicket({
          id: active.id,
          title: active.title,
          display_status: active.display_status,
          location: active.location || "Location pending...",
        });
      } else {
        setActiveTicket(null);
      }
    } catch (error) {
      console.error("Error fetching active ticket:", error);
    } finally {
      setLoadingTicket(false);
    }
  };

  // ---------------------------
  // 2️⃣ Get Current Location
  // ---------------------------
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location denied");
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      } catch (error) {
        console.error("Error getting location:", error);
      }
    })();
  }, []);

  // ---------------------------
  // 3️⃣ Fetch Nearby Seekers
  // ---------------------------
  useEffect(() => {
    if (currentLocation) {
      fetchNearbySeekers(currentLocation.latitude, currentLocation.longitude);
    }
  }, [currentLocation]);

  const fetchNearbySeekers = async (lat: number, lng: number) => {
    setLoadingSeekers(true);
    // Hardcoded for testing, remove or update later if using real device coords
    lat = 12.8762;
    lng = 74.8415;
    try {
      const data = await fetchNearbySeekersapi({ lat, lng });
      if (Array.isArray(data)) {
        setSeekers(data);
      } else {
        setSeekers([]);
      }
    } catch (error) {
      console.error("Error fetching seekers:", error);
      setSeekers([]);
    } finally {
      setLoadingSeekers(false);
    }
  };

  // ---------------------------
  // UI COMPONENTS
  // ---------------------------

  const renderCaseA = () => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.primaryCta}
        onPress={() => router.push("/(modals)/CreateTicketModal")}
      >
        <View style={styles.primaryCtaContent}>
          <View style={styles.ctaIconBg}>
            <Plus color="#1FA2A6" size={24} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.ctaTitle}>Create New Ticket</Text>
            <Text style={styles.ctaSubtitle}>Find a worker instantly</Text>
          </View>
          <ChevronRight color="white" size={24} />
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Quick Create</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.templatesContainer}
      >
        {["House Cleaning", "Plumbing", "Gardening", "Electrical"].map(
          (template, idx) => (
            <TouchableOpacity key={idx} style={styles.templateChip}>
              <Clock color="#4B5563" size={16} />
              <Text style={styles.templateText}>{template}</Text>
            </TouchableOpacity>
          ),
        )}
      </ScrollView>
    </View>
  );

  if (loadingSeekers && loadingTicket) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1FA2A6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        // INCREASED PADDING BOTTOM TO 120 SO IT CLEARS THE TAB BAR
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
      >
        {/* 1. ACTIVE TICKET */}
        {activeTicket && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Ticket</Text>
            <TicketCard ticket={activeTicket} />
          </View>
        )}

        {/* 2. CREATE TICKET & QUICK ACTIONS */}
        {renderCaseA()}

        {/* 3. MAP & NEARBY WORKERS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Available Nearby</Text>
            <TouchableOpacity onPress={() => fetchNearbySeekers(12.87, 74.84)}>
              <Text style={styles.linkText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {/* Map Preview Block */}
          <View style={styles.mapBlock}>
            {seekers.length === 0 && !loadingSeekers && (
              <View style={styles.emptyMapOverlay}>
                <AlertCircle color="#6B7280" size={24} />
                <Text
                  style={{ marginTop: 8, color: "#4B5563", fontWeight: "500" }}
                >
                  No workers found nearby
                </Text>
              </View>
            )}

            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: currentLocation?.latitude || 12.8762,
                longitude: currentLocation?.longitude || 74.8415,
                latitudeDelta: 0.05, // Zoom level
                longitudeDelta: 0.05,
              }}
            >
              {/* Optional: Show User's Current Location Pin */}
              {currentLocation && (
                <Marker
                  coordinate={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  title="You are here"
                  pinColor="blue"
                />
              )}

              {/* Render Nearby Workers as Markers */}
              {seekers.map((worker, index) => {
                // Mocking coordinates near the user if your backend doesn't return lat/lng yet.
                // Replace this with `worker.latitude` and `worker.longitude` once your API supports it.
                const fallbackLat =
                  (currentLocation?.latitude || 12.8762) +
                  (Math.random() - 0.5) * 0.02;
                const fallbackLng =
                  (currentLocation?.longitude || 74.8415) +
                  (Math.random() - 0.5) * 0.02;

                return (
                  <Marker
                    key={worker.seekerId || index}
                    coordinate={{
                      latitude: worker.latitude || fallbackLat,
                      longitude: worker.longitude || fallbackLng,
                    }}
                  >
                    {/* Custom Image Pin */}
                    <View style={styles.customMarker}>
                      <Image
                        source={{
                          uri:
                            worker.profileImage ||
                            "https://via.placeholder.com/150",
                        }}
                        style={styles.markerImage}
                      />
                    </View>

                    {/* Popup when clicking the marker */}
                    <Callout
                      tooltip
                      onPress={() => {
                        router.push({
                          pathname: "/WorkerProfile",
                          params: {
                            id: worker.seekerId,
                            name: worker.name,
                            role: worker.role,
                            img:
                              worker.profileImage ||
                              "https://via.placeholder.com/150",
                            rating: worker.rating,
                          },
                        });
                      }}
                    >
                      <View style={styles.calloutBubble}>
                        <Text style={styles.calloutName}>{worker.name}</Text>
                        <Text style={styles.calloutRole}>
                          {worker.role} • ★ {worker.rating}
                        </Text>
                        <Text style={styles.calloutAction}>
                          Tap to view profile
                        </Text>
                      </View>
                    </Callout>
                  </Marker>
                );
              })}
            </MapView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  linkText: { color: "#1FA2A6", fontWeight: "600" },

  // Case A Styles
  primaryCta: {
    backgroundColor: "#1FA2A6",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#1FA2A6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 24,
  },
  primaryCtaContent: { flexDirection: "row", alignItems: "center" },
  ctaIconBg: { backgroundColor: "white", padding: 12, borderRadius: 16 },
  ctaTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  ctaSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 },
  templatesContainer: { flexDirection: "row", paddingBottom: 10 },
  templateChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  templateText: { marginLeft: 8, color: "#4B5563", fontWeight: "500" },

  // Map Section
  mapBlock: {
    height: 380,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E5E7EB",
  },
  emptyMapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  // Custom Map Marker
  customMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1FA2A6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },

  // Map Callout (Popup)
  calloutBubble: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    width: 160,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  calloutName: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#111827",
    marginBottom: 2,
  },
  calloutRole: { fontSize: 12, color: "#4B5563", marginBottom: 6 },
  calloutAction: { fontSize: 10, color: "#1FA2A6", fontWeight: "600" },
});
