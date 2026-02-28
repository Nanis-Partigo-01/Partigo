import { getTopRankedSeekers } from "@/utils/api/seekers.api";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Award,
  Crown,
  ShieldCheck,
  Star,
  Target,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getInitials } from "../../utils/helperFunctions";

type Worker = {
  seekerId: string;
  name: string;
  avgRating: number;
  score: number;
  rank: number;
};

const BadgeIcon = ({ rank }: { rank: number }) => {
  if (rank <= 3)
    return (
      <View className="bg-yellow-100 p-1 rounded-md">
        <Crown size={12} color="#f59e0b" />
      </View>
    );
  if (rank <= 10)
    return (
      <View className="bg-green-100 p-1 rounded-md">
        <ShieldCheck size={12} color="#22c55e" />
      </View>
    );
  return (
    <View className="bg-blue-100 p-1 rounded-md">
      <Target size={12} color="#3b82f6" />
    </View>
  );
};

export default function TopRanked({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [topThree, setTopThree] = useState<Worker[]>([]);
  const [rankings, setRankings] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // filter state
  const [period, setPeriod] = useState<"monthly" | "all-time">("monthly");
  const [limit, setLimit] = useState(10);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const loadTopRanked = async () => {
    setLoading(true);
    try {
      const data = await getTopRankedSeekers(period, limit);
      setTopThree(data.topThree);
      setRankings(data.rankings);
    } catch (error) {
      console.log("Error!!!", error);
      setTopThree([]);
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopRanked();
  }, [period, limit]); // refetch when period or limit changes

  const handleProfilePress = (worker: Worker) => {
    router.push({
      pathname: "/WorkerProfile",
      params: {
        id: worker.seekerId,
        name: worker.name,
        rating: worker.avgRating.toString(),
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1FA2A6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* HEADER */}
      <View className="bg-[#1FA2A6] pt-14 pb-24 px-6 rounded-b-[40px]">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={onBack}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Leaderboard</Text>
          <Crown color="white" size={20} />
        </View>

        {/* FILTER BUTTON */}
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          className="bg-white px-4 py-2 rounded-md self-start mt-2"
        >
          <Text className="text-[#1FA2A6] font-bold">Filter</Text>
        </TouchableOpacity>
      </View>

      {/* FILTER MODAL */}
      <Modal
        transparent
        visible={showFilterModal}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-xl w-80">
            <Text className="font-bold mb-2">Select Period</Text>
            <View className="flex-row justify-between mb-4">
              <Pressable
                onPress={() => setPeriod("monthly")}
                className="px-3 py-1 rounded-md bg-gray-200"
              >
                <Text
                  className={`${period === "monthly" ? "font-bold text-[#1FA2A6]" : ""}`}
                >
                  Monthly
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPeriod("all-time")}
                className="px-3 py-1 rounded-md bg-gray-200"
              >
                <Text
                  className={`${period === "all-time" ? "font-bold text-[#1FA2A6]" : ""}`}
                >
                  All-time
                </Text>
              </Pressable>
            </View>

            <Text className="font-bold mb-2">Select Limit</Text>
            <View className="flex-row justify-between mb-4">
              {[5, 10, 20].map((l) => (
                <Pressable
                  key={l}
                  onPress={() => setLimit(l)}
                  className="px-3 py-1 rounded-md bg-gray-200"
                >
                  <Text
                    className={`${limit === l ? "font-bold text-[#1FA2A6]" : ""}`}
                  >
                    {l}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              className="bg-[#1FA2A6] py-2 rounded-md mt-2"
            >
              <Text className="text-white text-center font-bold">Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PODIUM */}
      <View className="flex-row justify-center items-end px-5 -mt-16 mb-8">
        {topThree.map((worker, index) => (
          <TouchableOpacity
            key={worker.seekerId}
            onPress={() => handleProfilePress(worker)}
            className="items-center mx-2"
          >
            {index === 0 && <Award size={22} color="#FF7A45" />}
            <View
              className={`${
                index === 0 ? "w-24 h-24 border-[#FF7A45]" : "w-16 h-16"
              } rounded-full border-2 bg-white items-center justify-center`}
            >
              <Text className="font-bold text-[#1FA2A6]">
                {getInitials(worker.name)}
              </Text>
            </View>
            <Text className="font-bold text-xs mt-2">{worker.name}</Text>
            <Text className="text-[#1FA2A6] text-[10px] font-bold">
              {Math.round(worker.score)} pts
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        {rankings.slice(3).map((worker) => (
          <TouchableOpacity
            key={worker.seekerId}
            onPress={() => handleProfilePress(worker)}
            className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
          >
            <Text className="text-gray-300 font-black w-6 text-center">
              {worker.rank}
            </Text>

            <View className="w-11 h-11 rounded-full bg-[#F4EFEA] items-center justify-center mx-3">
              <Text className="font-bold text-[#1FA2A6]">
                {getInitials(worker.name)}
              </Text>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="font-bold text-sm mr-2">{worker.name}</Text>
                <BadgeIcon rank={worker.rank} />
              </View>
            </View>

            <View className="items-end">
              <View className="flex-row items-center">
                <Star size={10} color="#FF7A45" fill="#FF7A45" />
                <Text className="ml-1 text-xs font-bold">
                  {worker.avgRating.toFixed(1)}
                </Text>
              </View>
              <Text className="text-[#1FA2A6] text-[10px] font-bold">
                {Math.round(worker.score)} pts
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
