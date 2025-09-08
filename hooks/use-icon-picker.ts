"use client";

import { useState, useMemo } from "react";
import * as FaIcons from "react-icons/fa";

interface IconData {
  name: string;
  friendly_name: string;
  Component: React.ComponentType<any>;
}

export function useIconPicker() {
  const [search, setSearch] = useState("");

  const icons = useMemo(() => {
    const allIcons: IconData[] = [];

    // Convert react-icons/fa to our format
    Object.entries(FaIcons).forEach(([key, Component]) => {
      // Skip non-icon exports
      if (typeof Component !== 'function') return;

      // Convert camelCase to friendly name
      const friendlyName = key
        .replace(/^Fa/, '') // Remove Fa prefix
        .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
        .trim();

      allIcons.push({
        name: key,
        friendly_name: friendlyName,
        Component,
      });
    });

    // Filter based on search
    if (!search.trim()) {
      return allIcons.slice(0, 100); // Limit initial results
    }

    return allIcons.filter(icon =>
      icon.friendly_name.toLowerCase().includes(search.toLowerCase()) ||
      icon.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return {
    search,
    setSearch,
    icons,
  };
}