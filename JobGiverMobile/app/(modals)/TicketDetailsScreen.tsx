import { getTicketDetails } from "@/utils/api/tickets.api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    try {
      const data = await getTicketDetails(id as string);
      setTicket(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View className="flex-1 justify-center">
        <ActivityIndicator size="large" color="#1FA2A6" />
      </View>
    );
  if (!ticket)
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Ticket not found</Text>
      </View>
    );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header Image or Map Placeholder */}
      <View className="h-60 bg-gray-200 w-full relative">
        <Image
          source={{
            uri: "https://img.freepik.com/free-vector/city-map-navigation-app_23-2148605006.jpg",
          }} // Placeholder map image
          className="w-full h-full"
        />
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-6 bg-white p-2 rounded-full shadow-md"
        >
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 -mt-6 bg-white rounded-t-[30px] p-6">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-black text-gray-800 mb-1">
              {ticket.title}
            </Text>
            <View className="flex-row items-center">
              <MapPin size={14} color="gray" />
              <Text className="text-gray-500 ml-1 text-xs">
                {ticket.service_address}
              </Text>
            </View>
          </View>
          <View className="bg-green-100 px-3 py-1 rounded-lg">
            <Text className="text-green-700 font-bold text-xs">
              {ticket.status}
            </Text>
          </View>
        </View>

        <View className="bg-gray-50 p-4 rounded-2xl mb-6">
          <Text className="font-bold text-gray-800 mb-2">Description</Text>
          <Text className="text-gray-600 leading-5">{ticket.description}</Text>
        </View>

        {/* Schedule Info */}
        <Text className="font-bold text-lg mb-3">Schedule</Text>
        {ticket.schedules?.map((sch: any, index: number) => (
          <View
            key={index}
            className="flex-row items-center justify-between bg-white border border-gray-100 p-4 rounded-xl mb-2 shadow-sm"
          >
            <View className="flex-row items-center">
              <Calendar size={18} color="#1FA2A6" className="mr-3" />
              <Text className="font-bold text-gray-700">
                {new Date(sch.scheduled_date).toDateString()}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Clock size={16} color="gray" className="mr-1" />
              <Text className="text-gray-500 text-xs">
                {sch.start_time} - {sch.end_time}
              </Text>
            </View>
          </View>
        ))}

        {/* Price Info */}
        <View className="mt-6 border-t border-gray-100 pt-4 flex-row justify-between items-center">
          <Text className="text-gray-500 font-medium">Total Price</Text>
          <Text className="text-2xl font-black text-[#1FA2A6]">
            ${ticket.schedules?.[0]?.total_price || "0.00"}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-red-50 py-4 rounded-2xl items-center mt-8 mb-10"
          onPress={() => alert("Cancel feature coming soon")}
        >
          <Text className="text-red-500 font-bold">Cancel Ticket</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
