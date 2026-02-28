import HeaderMenu from "@/component/HeaderMenu";
import { Tabs, usePathname } from "expo-router";
import React from "react";
import CustomTabBar from "../../component/CustomTabBar";
import { SearchProvider, useSearch } from "../../component/SearchContext";

// We extract the actual layout into an inner component so it can use the context
function TabLayoutInner() {
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useSearch();

  // Dynamically set Header properties based on the current route
  let currentTitle = "Home";
  let currentSubtitle = "Welcome";
  let shouldShowSearch = false;

  if (pathname === "/TicketBank") {
    currentTitle = "Ticket Bank";
    currentSubtitle = "Manage";
    shouldShowSearch = true;
  } else if (pathname === "/CreateTicket") {
    currentTitle = "Create Ticket";
    currentSubtitle = "New";
  } else if (pathname === "/TopRanked") {
    currentTitle = "Top Ranked";
    currentSubtitle = "Workers";
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => (
          <HeaderMenu
            title={currentTitle}
            subtitle={currentSubtitle}
            showSearch={shouldShowSearch}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        ),
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="TicketBank" />
      <Tabs.Screen name="CreateTicket" />
      <Tabs.Screen name="TopRanked" />
      <Tabs.Screen name="about" />
    </Tabs>
  );
}

// Wrap the layout in the Provider
export default function TabsLayout() {
  return (
    <SearchProvider>
      <TabLayoutInner />
    </SearchProvider>
  );
}
