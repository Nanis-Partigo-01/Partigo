import { getMyTickets } from "@/utils/api/tickets.api";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { useSearch } from "../../component/SearchContext";
import TicketCard from "../../component/TicketCard"; // Adjust this path if needed!

export default function TicketBank() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useSearch();

  // Fetch tickets when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, []),
  );

  const loadTickets = async () => {
    try {
      const data = await getMyTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" />

      {/* --- CONTENT LIST --- */}
      <ScrollView
        className="flex-1 px-5 pt-6"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#1FA2A6" />
            <Text className="text-gray-400 mt-2">Loading tickets...</Text>
          </View>
        ) : filteredTickets.length === 0 ? (
          <Text className="text-center text-gray-400 mt-10">
            No tickets found.
          </Text>
        ) : (
          filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
