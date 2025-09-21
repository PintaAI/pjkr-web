"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Plus, Filter } from "lucide-react";

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
  singleFilter?: boolean;
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
  singleFilter = false,
}: SearchFiltersProps) {
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedSearch);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [debouncedSearch, onSearchChange, debounceMs]);

  if (singleFilter) {
    const combinedOptions = filters.flatMap((filter) =>
      filter.options.map((option) => ({
        value: `${filter.key}:${option.value}`,
        label: `${filter.label}: ${option.label}`,
      }))
    );

    const activeFilters = filters.filter((filter) => filter.value !== "ALL");
    const currentLabel = activeFilters.length === 0
      ? "Filter by..."
      : activeFilters.length === 1
      ? `${activeFilters[0].label}: ${activeFilters[0].options.find(o => o.value === activeFilters[0].value)?.label || activeFilters[0].value}`
      : `${activeFilters.length} filters applied`;

    return (
      <div className={`flex flex-row gap-4 mt-2 bg-background/60 ${className}`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={debouncedSearch}
            onChange={(e) => setDebouncedSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-48 justify-start">
              <Filter className="h-4 w-4 mr-2" />
              {currentLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <h4 className="font-medium text-sm mb-2">{filter.label}</h4>
                  <div className="space-y-1">
                    {filter.options.map((option) => (
                      <Button
                        key={option.value}
                        variant={filter.value === option.value ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          filter.onChange(option.value);
                        }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              {activeFilters.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    filters.forEach((filter) => filter.onChange("ALL"));
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {showCreateButton && onCreate && (
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {createLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row gap-4 mt-2 bg-background/60 ${className}`}>
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