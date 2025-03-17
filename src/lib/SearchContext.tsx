"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface SearchParams {
  place: string;
  minPrice?: number;
  maxPrice?: number;
  rooms?: number;
  guests?: number;
  startDate?: Date;
  endDate?: Date;
}

interface SearchContextType {
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    place: "",
  });

  const updateSearchParams = (params: Partial<SearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...params }));
  };

  return (
    <SearchContext.Provider
      value={{ searchParams, setSearchParams: updateSearchParams }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context)
    throw new Error("useSearch must be used within a SearchProvider");
  return context;
}
