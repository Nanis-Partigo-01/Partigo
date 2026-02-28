import { createTicket } from "@/utils/api/tickets.api";
import { Slider } from "@miblanchard/react-native-slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Edit2,
  MapPin,
  Minus,
  MoveRight,
  Plus,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- CONSTANTS ---
const START_HOUR_OF_DAY = 8;

const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const val = i * 0.5;
  let totalMinutes = val * 60;
  let hour = Math.floor(totalMinutes / 60) + START_HOUR_OF_DAY;
  let mins = Math.floor(totalMinutes % 60);
  const ampm = hour >= 12 ? (hour >= 24 ? "AM" : "PM") : "AM";
  const displayHour =
    hour > 12 ? (hour > 24 ? hour - 24 : hour - 12) : hour === 0 ? 12 : hour;
  return {
    label: `${displayHour}:${mins === 0 ? "00" : "30"} ${ampm}`,
    value: val,
  };
});

const formatTimeLabel = (val: number) => {
  const slot = TIME_SLOTS.find((s) => s.value === val);
  return slot ? slot.label : "00:00";
};

// HELPER: Local YYYY-MM-DD
const formatLocalYMD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDaysInMonth = (monthOffset: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() + monthOffset);
  const month = date.getMonth();
  const year = date.getFullYear();
  const days = [];
  const lastDay = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= lastDay; i++) {
    const currentIterDate = new Date(year, month, i);
    if (currentIterDate.setHours(0, 0, 0, 0) >= today.getTime()) {
      days.push({
        id: formatLocalYMD(new Date(year, month, i)),
        dayName: new Date(year, month, i).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        dayNumber: i,
        monthName: new Date(year, month, i).toLocaleDateString("en-US", {
          month: "long",
        }),
      });
    }
  }
  return days;
};

// --- MAIN COMPONENT ---
export default function SchedulePage() {
  const router = useRouter();

  // 1. GET PARAMS FROM CREATE TICKET PAGE
  const params = useLocalSearchParams();
  const passedTitle = params.title as string;
  const passedDescription = params.description as string;
  const passedDetails = params.specificDetails as string;
  const passedAddressText = params.serviceAddress as string;
  const passedLat = parseFloat(params.serviceLatitude as string);
  const passedLng = parseFloat(params.serviceLongitude as string);
  // Parse Images JSON
  const passedPhotos = params.images ? JSON.parse(params.images as string) : [];

  // --- STATE ---
  const [monthOffset, setMonthOffset] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [selectedDateIds, setSelectedDateIds] = useState<string[]>([
    formatLocalYMD(new Date()),
  ]);

  const [timeRange, setTimeRange] = useState([1, 4]);
  const [showManualTimeModal, setShowManualTimeModal] = useState(false);
  const [priceAdjustment, setPriceAdjustment] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- COMPUTED ---
  const monthDates = useMemo(() => getDaysInMonth(monthOffset), [monthOffset]);
  const currentMonthName = monthDates[0]?.monthName || "Select Month";
  const displayDates = isExpanded ? monthDates : monthDates.slice(0, 4);

  const duration = timeRange[1] - timeRange[0];
  const startTime = formatTimeLabel(timeRange[0]);
  const endTime = formatTimeLabel(timeRange[1]);

  const hourlyRate = 15;
  const subtotal = duration * hourlyRate * selectedDateIds.length;
  const platformFee = 2.5;
  const finalPrice = Math.max(0, subtotal + priceAdjustment + platformFee);

  // --- ACTIONS ---
  const toggleDate = (id: string) => {
    setSelectedDateIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleConfirmAppointment = async () => {
    if (selectedDateIds.length === 0) {
      Alert.alert("Date Required", "Please select at least one date.");
      return;
    }

    setIsSubmitting(true);
    try {
      // PREPARE PAYLOAD FOR API
      const payload = {
        title: passedTitle,
        description: passedDescription,
        specificDetails: passedDetails,
        // Snapshot Location
        serviceLatitude: passedLat,
        serviceLongitude: passedLng,
        serviceAddress: passedAddressText,
        // Schedule Info
        dates: selectedDateIds,
        startTime: timeRange[0], // e.g. 8.5
        endTime: timeRange[1], // e.g. 12.5
        totalPrice: finalPrice,
        priceAdjustment: priceAdjustment,
        photos: passedPhotos,
      };

      console.log("Submitting Ticket:", payload);

      // 1. Call Backend API
      const response = await createTicket(payload);
      // Assuming createTicket returns something like: { ticketId: 'uuid-123' }

      // 2. Navigate to "Searching for Workers" Screen (Radar Animation)
      router.push({
        pathname: "/(common)/SearchingWorkerScreen",
        params: {
          ticketId: response.ticketId, // Pass the new Ticket ID
          lat: passedLat,
          lng: passedLng,
          address: passedAddressText,
        },
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />

      {/* --- HEADER --- */}
      <View className="bg-[#1FA2A6] pt-14 pb-10 px-6 rounded-b-[40px] shadow-xl">
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full bg-white/10"
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Schedule Job</Text>
          <View className="w-8" />
        </View>

        {/* Mini Summary of Ticket */}
        <View className="bg-white/15 border border-white/20 p-4 rounded-[28px]">
          <Text className="text-white font-bold text-lg">{passedTitle}</Text>
          <Text className="text-white/80 text-xs mt-1" numberOfLines={1}>
            {passedDescription}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* --- DATE SELECTION --- */}
        <View className="px-6 pt-8 mb-10">
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() =>
                  setMonthOffset((prev) => (prev > 0 ? prev - 1 : 0))
                }
                className="mr-2 p-1"
              >
                <ChevronLeft
                  size={24}
                  color={monthOffset === 0 ? "#E5E7EB" : "#1FA2A6"}
                />
              </TouchableOpacity>
              <View className="flex-row items-center bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100">
                <Calendar size={18} color="#1FA2A6" />
                <Text className="text-lg font-bold text-gray-800 ml-2">
                  {currentMonthName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setMonthOffset((prev) => prev + 1)}
                className="ml-2 p-1"
              >
                <ChevronRight size={24} color="#1FA2A6" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-start">
            {displayDates.map((item) => {
              const isActive = selectedDateIds.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggleDate(item.id)}
                  className={`w-[18%] aspect-[4/5] rounded-2xl items-center justify-center m-[1%] border ${
                    isActive
                      ? "bg-[#1FA2A6] border-[#1FA2A6] shadow-md shadow-[#1FA2A6]/30"
                      : "bg-[#F4EFEA] border-transparent"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold uppercase mb-1 ${
                      isActive ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    {item.dayName}
                  </Text>
                  <Text
                    className={`text-xl font-black ${
                      isActive ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {item.dayNumber}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              onPress={() => setIsExpanded(!isExpanded)}
              className="w-[18%] aspect-[4/5] rounded-2xl items-center justify-center m-[1%] bg-white border border-dashed border-[#1FA2A6]/40"
            >
              {isExpanded ? (
                <ChevronUp color="#1FA2A6" size={24} />
              ) : (
                <ChevronDown color="#1FA2A6" size={24} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* --- WORK WINDOW SLIDER --- */}
        <View className="px-6 mb-10">
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center">
              <Clock size={22} color="#1FA2A6" />
              <Text className="text-xl font-bold text-gray-800 ml-2">
                Work Window
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowManualTimeModal(true)}
              className="flex-row items-center bg-[#1FA2A6] px-3 py-1.5 rounded-full"
            >
              <Text className="text-white font-bold text-xs mr-1">
                {duration}h
              </Text>
              <Edit2 size={10} color="white" />
            </TouchableOpacity>
          </View>

          <View className="bg-[#F8F9FA] rounded-[40px] p-8 border border-gray-100 shadow-sm">
            <View className="flex-row items-center justify-between mb-10">
              <TouchableOpacity
                onPress={() => setShowManualTimeModal(true)}
                className="w-28"
              >
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  Check-in
                </Text>
                <Text className="text-2xl font-black text-gray-800">
                  {startTime}
                </Text>
              </TouchableOpacity>
              <View className="bg-[#1FA2A6]/10 p-2 rounded-full">
                <MoveRight color="#1FA2A6" size={20} />
              </View>
              <TouchableOpacity
                onPress={() => setShowManualTimeModal(true)}
                className="w-28 items-end"
              >
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  Checkout
                </Text>
                <Text className="text-2xl font-black text-gray-800">
                  {endTime}
                </Text>
              </TouchableOpacity>
            </View>
            <Slider
              value={timeRange}
              onValueChange={(val: any) => {
                if (val[1] > val[0]) setTimeRange(val);
              }}
              minimumValue={0}
              maximumValue={12}
              step={0.5}
              minimumTrackTintColor="#1FA2A6"
              maximumTrackTintColor="#E5E7EB"
              renderThumbComponent={() => (
                <View className="w-8 h-8 bg-white border-[6px] border-[#1FA2A6] rounded-full shadow-md" />
              )}
            />
            <View className="flex-row justify-between mt-4">
              <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                08:00 AM
              </Text>
              <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                08:00 PM
              </Text>
            </View>
          </View>
        </View>

        {/* --- SELECTED LOCATION (READ ONLY) --- */}
        <View className="px-6 mb-10">
          <View className="flex-row items-center mb-5">
            <MapPin size={22} color="#1FA2A6" />
            <Text className="text-xl font-bold text-gray-800 ml-2">
              Service Location
            </Text>
          </View>

          <View className="bg-white p-5 rounded-[30px] flex-row items-center border-2 border-[#1FA2A6] bg-[#1FA2A6]/5">
            <View className="bg-[#1FA2A6] p-4 rounded-2xl mr-4">
              <MapPin size={22} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-black text-gray-800 text-lg mb-1">
                Selected Location
              </Text>
              <Text
                className="text-gray-500 text-xs leading-4"
                numberOfLines={2}
              >
                {passedAddressText || "Location selected on map"}
              </Text>
            </View>
          </View>
        </View>

        {/* --- PRICING --- */}
        <View className="px-6 mb-10">
          <View className="bg-gray-900 rounded-[40px] p-7 shadow-2xl overflow-hidden">
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Final Price
                </Text>
                <Text className="text-white text-4xl font-black">
                  ${finalPrice.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row items-center bg-white/10 rounded-full p-1 border border-white/10">
                <TouchableOpacity
                  onPress={() => setPriceAdjustment((p) => p - 5)}
                  className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                >
                  <Minus size={18} color="white" />
                </TouchableOpacity>
                <View className="px-3">
                  <Text className="text-white font-bold">Offer</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setPriceAdjustment((p) => p + 5)}
                  className="w-10 h-10 items-center justify-center rounded-full bg-[#1FA2A6]"
                >
                  <Plus size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="border-t border-white/10 pt-4 space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-white/40 text-xs">
                  Standard Service ({selectedDateIds.length} days)
                </Text>
                <Text className="text-white/80 text-xs">${subtotal}</Text>
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-white/40 text-xs">
                  Platform & Insurance
                </Text>
                <Text className="text-white/80 text-xs">$2.50</Text>
              </View>
              {priceAdjustment !== 0 && (
                <View className="flex-row justify-between mt-1">
                  <Text className="text-white/40 text-xs">Adjustment</Text>
                  <Text
                    className={
                      priceAdjustment > 0
                        ? "text-green-400 text-xs"
                        : "text-red-400 text-xs"
                    }
                  >
                    {priceAdjustment > 0 ? "+" : ""}${priceAdjustment}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* --- CONFIRMATION DOCK --- */}
      <View className="absolute bottom-0 left-0 right-0 p-8 bg-white/95 border-t border-gray-50">
        <TouchableOpacity
          onPress={handleConfirmAppointment}
          disabled={isSubmitting}
          className={`h-16 rounded-[24px] flex-row items-center justify-center shadow-xl shadow-[#1FA2A6]/40 ${
            isSubmitting ? "bg-gray-400" : "bg-[#1FA2A6]"
          }`}
        >
          <Text className="text-white font-black text-lg mr-3">
            {isSubmitting ? "Processing..." : "Confirm & Find Worker"}
          </Text>
          {!isSubmitting && (
            <ArrowRight color="white" size={22} strokeWidth={3} />
          )}
        </TouchableOpacity>
      </View>

      {/* --- TIME PICKER MODAL --- */}
      <Modal visible={showManualTimeModal} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center px-8">
          <View className="bg-white rounded-[40px] p-8 shadow-2xl">
            <Text className="text-center font-black text-2xl text-gray-800 mb-8">
              Set Times
            </Text>
            <View className="flex-row justify-between h-72 mb-8">
              <View className="flex-1 mr-3">
                <Text className="text-center text-gray-400 font-bold mb-3 text-[10px] uppercase">
                  Start
                </Text>
                <ScrollView
                  className="bg-gray-50 rounded-3xl"
                  showsVerticalScrollIndicator={false}
                >
                  {TIME_SLOTS.map((t) => (
                    <TouchableOpacity
                      key={`s-${t.label}`}
                      onPress={() =>
                        setTimeRange([
                          t.value,
                          Math.max(t.value + 0.5, timeRange[1]),
                        ])
                      }
                      className={`py-4 rounded-2xl ${
                        timeRange[0] === t.value ? "bg-[#1FA2A6]" : ""
                      }`}
                    >
                      <Text
                        className={`text-center font-black ${
                          timeRange[0] === t.value
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-center text-gray-400 font-bold mb-3 text-[10px] uppercase">
                  End
                </Text>
                <ScrollView
                  className="bg-gray-50 rounded-3xl"
                  showsVerticalScrollIndicator={false}
                >
                  {TIME_SLOTS.map((t) => (
                    <TouchableOpacity
                      key={`e-${t.label}`}
                      onPress={() => {
                        if (t.value > timeRange[0])
                          setTimeRange([timeRange[0], t.value]);
                      }}
                      className={`py-4 rounded-2xl ${
                        timeRange[1] === t.value ? "bg-[#1FA2A6]" : ""
                      }`}
                    >
                      <Text
                        className={`text-center font-black ${
                          timeRange[1] === t.value
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowManualTimeModal(false)}
              className="bg-[#1FA2A6] py-5 rounded-[24px] shadow-lg"
            >
              <Text className="text-center text-white font-black text-lg">
                Apply Time Window
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
