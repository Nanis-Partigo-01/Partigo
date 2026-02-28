import { useRouter } from "expo-router";
import { Calendar, MapPin, Send } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface TicketData {
  id: string;
  title: string;
  display_status: string;
  location: string;
}

interface TicketCardProps {
  ticket: TicketData;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const router = useRouter();

  return (
    <View className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 mb-4">
      {/* Card Header: Title & Status */}
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-bold text-lg text-gray-800 flex-1 mr-2">
          {ticket.title}
        </Text>
        <View
          className={`px-3 py-1 rounded-lg ${
            ticket.display_status === "Accepted"
              ? "bg-green-100"
              : "bg-orange-50"
          }`}
        >
          <Text
            className={`text-[10px] font-bold uppercase tracking-wider ${
              ticket.display_status === "Accepted"
                ? "text-green-600"
                : "text-[#FF7A45]"
            }`}
          >
            {ticket.display_status}
          </Text>
        </View>
      </View>

      {/* Location Row */}
      <View className="flex-row items-center mb-5">
        <MapPin size={14} color="#9CA3AF" />
        <Text className="text-xs text-gray-500 ml-1 flex-1" numberOfLines={1}>
          {ticket.location}
        </Text>
      </View>

      {/* ACTION BUTTONS */}
      <View className="flex-row gap-3">
        {/* 1. View Details */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(modals)/TicketDetailsScreen",
              params: { id: ticket.id },
            })
          }
          className="flex-1 py-3 bg-[#F4EFEA] rounded-xl items-center"
        >
          <Text className="text-[#1FA2A6] font-bold text-sm">View Details</Text>
        </TouchableOpacity>

        {/* 2. Dynamic Action (Track or Reschedule) */}
        {ticket.display_status === "Accepted" ? (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(common)/JobLiveTrackingScreen",
                params: { lat: 12.9141, lng: 74.856 },
              })
            }
            className="flex-1 py-3 bg-[#1FA2A6] rounded-xl items-center flex-row justify-center shadow-md shadow-teal-200"
          >
            <Text className="text-white font-bold text-sm mr-2">Track Job</Text>
            <Send size={14} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(common)/SchedulePage",
                params: {
                  id: ticket.id,
                  isReschedule: "true",
                  title: ticket.title,
                },
              })
            }
            // Corrected visual styling to Orange
            className="flex-1 py-3 bg-[#1FA2A6] rounded-xl items-center flex-row justify-center shadow-md shadow-orange-200"
          >
            <Calendar size={14} color="white" className="mr-2" />
            <Text className="text-white font-bold text-sm">Reschedule</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
