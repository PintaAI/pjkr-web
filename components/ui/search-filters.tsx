"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";

export interface FilterOption {
  key: string;
  type: "select";
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export interface SearchFiltersProps {
  placeholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterOption[];
  debounceMs?: number;
  showCreateButton?: boolean;
  createLabel?: string;
  onCreate?: () => void;
  className?: string;
}

export function SearchFilters({
  placeholder = "Search...",
  searchValue,
  onSearchChange,
  filters = [],
  debounceMs = 300,
  showCreateButton = false,
  createLabel = "Create",
  onCreate,
  className = "",
}: SearchFiltersProps) {
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedSearch);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [debouncedSearch, onSearchChange, debounceMs]);

  return (
    <div className={`flex flex-col sm:flex-row gap-4 mt-4 mb-8 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={filter.value}
          onValueChange={(value) => filter.onChange(value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {showCreateButton && onCreate && (
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {createLabel}
        </Button>
      )}
    </div>
  );
}