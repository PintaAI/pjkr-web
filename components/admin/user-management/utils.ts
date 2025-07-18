import { UserRoles } from "@prisma/client";
import { UserWithStats } from "./types";

export const getRoleBadgeVariant = (role: UserRoles) => {
  switch (role) {
    case "ADMIN":
      return "destructive";
    case "GURU":
      return "default";
    case "MURID":
      return "secondary";
    default:
      return "outline";
  }
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const calculateUserStats = (users: UserWithStats[]) => {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const teachers = users.filter(u => u.role === "GURU").length;
  const students = users.filter(u => u.role === "MURID").length;
  const newUsersThisWeek = users.filter(u => 
    new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  return {
    totalUsers,
    activeUsers,
    teachers,
    students,
    newUsersThisWeek,
  };
};

export const filterUsers = (
  users: UserWithStats[],
  searchTerm: string,
  roleFilter: UserRoles | "ALL",
  statusFilter: "ALL" | "ACTIVE" | "INACTIVE"
) => {
  return users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || 
      (statusFilter === "ACTIVE" && user.isActive) ||
      (statusFilter === "INACTIVE" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });
};
