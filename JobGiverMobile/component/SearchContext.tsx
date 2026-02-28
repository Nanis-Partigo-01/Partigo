import React, { createContext, useContext, useState } from "react";

// Create the context
const SearchContext = createContext({
  searchQuery: "",
  setSearchQuery: (text: string) => {},
});

// Create a custom hook for easy access
export const useSearch = () => useContext(SearchContext);

// Create the provider
export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
};
