import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { UserRoles } from "@prisma/client";
import { 
  getAllUsers, 
  updateUser, 
  deleteUser, 
  toggleUserEmailVerification,
} from "@/app/actions/admin-actions";
import { UserWithStats, UserFormData, UserManagementData } from "./types";

export function useUserManagement(initialData: UserManagementData) {
  const [users, setUsers] = useState<UserWithStats[]>(initialData.users);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage);
  const [hasNextPage, setHasNextPage] = useState(initialData.hasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRoles | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [editFormData, setEditFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "MURID" as UserRoles,
  });

  // Ref for scroll detection
  const tableRef = useRef<HTMLDivElement>(null);

  // Load users (replace current list)
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const usersData = await getAllUsers({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        page: 1,
        limit: 20,
      });
      setUsers(usersData.users);
      setCurrentPage(usersData.currentPage);
      setHasNextPage(usersData.hasNextPage);
    } catch (error) {
      toast.error("Failed to load users");
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter]);

  // Load more users (append to current list)
  const loadMoreUsers = useCallback(async () => {
    if (isLoadingMore || !hasNextPage) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const usersData = await getAllUsers({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        page: nextPage,
        limit: 20,
      });
      
      setUsers(prevUsers => [...prevUsers, ...usersData.users]);
      setCurrentPage(usersData.currentPage);
      setHasNextPage(usersData.hasNextPage);
    } catch (error) {
      toast.error("Failed to load more users");
      console.error("Error loading more users:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasNextPage, isLoadingMore, searchTerm, roleFilter, statusFilter]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!tableRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (nearBottom && hasNextPage && !isLoadingMore) {
      loadMoreUsers();
    }
  }, [hasNextPage, isLoadingMore, loadMoreUsers]);

  // Event handlers
  const handleEdit = (user: UserWithStats) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email,
      role: user.role,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (user: UserWithStats) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleToggleEmail = async (user: UserWithStats) => {
    try {
      await toggleUserEmailVerification(user.id);
      toast.success(`Email verification ${user.emailVerified ? 'disabled' : 'enabled'}`);
      loadUsers();
    } catch (error) {
      toast.error("Failed to toggle email verification");
    }
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id);
        toast.success("User deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        loadUsers();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleUpdate = async () => {
    if (selectedUser) {
      try {
        await updateUser(selectedUser.id, editFormData);
        toast.success("User updated successfully");
        setEditDialogOpen(false);
        setSelectedUser(null);
        loadUsers();
      } catch (error) {
        toast.error("Failed to update user");
      }
    }
  };

  // Effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [loadUsers]);

  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener('scroll', handleScroll);
      return () => tableElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return {
    // Data
    users,
    isLoading,
    isLoadingMore,
    
    // Filters
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    
    // Dialog states
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    selectedUser,
    editFormData,
    setEditFormData,
    
    // Actions
    loadUsers,
    handleEdit,
    handleDelete,
    handleToggleEmail,
    confirmDelete,
    handleUpdate,
    
    // Refs
    tableRef,
  };
}
