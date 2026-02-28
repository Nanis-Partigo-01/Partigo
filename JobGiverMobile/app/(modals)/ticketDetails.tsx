import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Star,
} from "lucide-react-native";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ticketDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mocked list of workers who applied for this specific ticket
  const applicants = [
    {
      id: "1",
      name: "Sarah Jenkins",
      rating: 4.9,
      jobs: 124,
      image: "https://i.pravatar.cc/150?u=1",
    },
    {
      id: "2",
      name: "Mark Wilson",
      rating: 4.7,
      jobs: 89,
      image: "https://i.pravatar.cc/150?u=2",
    },
    {
      id: "3",
      name: "Elena Rodriguez",
      rating: 5.0,
      jobs: 45,
      image: "https://i.pravatar.cc/150?u=3",
    },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-[#1FA2A6] pt-12 pb-6 px-6 rounded-b-[30px]">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Ticket Details</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Job Info Section */}
        <View className="mb-8">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
            Job Information
          </Text>
          <Text className="text-2xl font-bold text-gray-800">
            Home Cleaning - 2 Bedroom
          </Text>
          <View className="flex-row items-center mt-3 gap-4">
            <View className="flex-row items-center">
              <Calendar size={14} color="#1FA2A6" />
              <Text className="text-gray-500 text-xs ml-1">Jan 18, 2026</Text>
            </View>
            <View className="flex-row items-center">
              <Clock size={14} color="#1FA2A6" />
              <Text className="text-gray-500 text-xs ml-1">02:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Applicants Section */}
        <View className="mb-6">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
            Workers who applied ({applicants.length})
          </Text>

          {applicants.map((worker) => (
            <TouchableOpacity
              key={worker.id}
              onPress={() =>
                router.push({
                  pathname: "/(common)/SchedulePage",
                  params: { workerName: worker.name },
                })
              }
              className="flex-row items-center bg-gray-50 p-4 rounded-3xl mb-3 border border-gray-100"
            >
              <Image
                source={{ uri: worker.image }}
                className="w-14 h-14 rounded-full"
              />
              <View className="flex-1 ml-4">
                <Text className="font-bold text-gray-800 text-base">
                  {worker.name}
                </Text>
                <View className="flex-row items-center">
                  <Star size={12} color="#FACC15" fill="#FACC15" />
                  <Text className="text-gray-500 text-xs ml-1">
                    {worker.rating} • {worker.jobs} Jobs done
                  </Text>
                </View>
              </View>
              <View className="bg-[#1FA2A6]/10 p-2 rounded-full">
                <ChevronRight size={20} color="#1FA2A6" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
