"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, UserPlus, UserCheck, CheckCircle, Shield, Trash2, Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { UserManagementData } from "./types";
import { calculateUserStats, filterUsers, sortUsers } from "./utils";
import { useUserManagement } from "./use-user-management";
import { StatsCard } from "./stats-card";
import { UserFilters } from "./user-filters";
import { UserRow } from "./user-row";
import { UserDialogs } from "./user-dialogs";
import { SkeletonStatsCard, SkeletonUserRow, SkeletonLoadingMore } from "./skeleton-components";

interface UserManagementPageProps {
  initialData: UserManagementData;
}

export function UserManagementPage({ initialData }: UserManagementPageProps) {
  const {
    users,
    isLoading,
    isLoadingMore,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    handleSort,
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    bulkDeleteDialogOpen,
    setBulkDeleteDialogOpen,
    bulkUpdateDialogOpen,
    setBulkUpdateDialogOpen,
    selectedUser,
    editFormData,
    setEditFormData,
    selectedUserIds,
    bulkUpdateData,
    setBulkUpdateData,
    loadUsers,
    handleEdit,
    handleDelete,
    handleToggleEmail,
    confirmDelete,
    handleUpdate,
    handleSelectUser,
    handleSelectAll,
    clearSelection,
    handleBulkDelete,
    confirmBulkDelete,
    handleBulkUpdate,
    confirmBulkUpdate,
    tableRef,
  } = useUserManagement(initialData);

  // Calculate stats for display
  const stats = calculateUserStats(users);

  // Filter and sort users
  const filteredUsers = filterUsers(users, searchTerm, roleFilter, statusFilter);
  const sortedUsers = sortUsers(filteredUsers, sortField, sortDirection);

  // Helper function to render sort icon
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === "asc" ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {isLoading ? (
          <>
            <SkeletonStatsCard title="Total Users" icon={UserCheck} />
            <SkeletonStatsCard title="Active Users" icon={CheckCircle} />
            <SkeletonStatsCard title="Teachers" icon={Shield} />
            <SkeletonStatsCard title="Students" icon={UserCheck} />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              subtitle={`+${stats.newUsersThisWeek} this week`}
              icon={UserCheck}
            />
            <StatsCard
              title="Active Users"
              value={stats.activeUsers}
              subtitle={`${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total`}
              icon={CheckCircle}
            />
            <StatsCard
              title="Teachers"
              value={stats.teachers}
              subtitle={`${Math.round((stats.teachers / stats.totalUsers) * 100)}% of total`}
              icon={Shield}
            />
            <StatsCard
              title="Students"
              value={stats.students}
              subtitle={`${Math.round((stats.students / stats.totalUsers) * 100)}% of total`}
              icon={UserCheck}
            />
          </>
        )}
      </div>

      {/* Filters */}
      <UserFilters
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onRoleFilterChange={setRoleFilter}
        onStatusFilterChange={setStatusFilter}
        isLoading={isLoading}
      />

      {/* Bulk Actions */}
      {selectedUserIds.size > 0 && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {selectedUserIds.size} user(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkUpdate}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Update
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Bulk Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div 
              ref={tableRef}
              className="h-[calc(100vh-40rem)] overflow-auto"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      {sortedUsers.length > 0 && (
                        <Checkbox
                          checked={selectedUserIds.size === sortedUsers.length && sortedUsers.length > 0}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all users"
                        />
                      )}
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 lg:px-3"
                        onClick={() => handleSort("name")}
                      >
                        User
                        {getSortIcon("name")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 lg:px-3"
                        onClick={() => handleSort("role")}
                      >
                        Role
                        {getSortIcon("role")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 lg:px-3"
                        onClick={() => handleSort("level")}
                      >
                        Progress
                        {getSortIcon("level")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 lg:px-3"
                        onClick={() => handleSort("createdAt")}
                      >
                        Joined
                        {getSortIcon("createdAt")}
                      </Button>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 15 }).map((_, i) => (
                      <SkeletonUserRow key={i} />
                    ))
                  ) : sortedUsers.length ? (
                    <>
                      {sortedUsers.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          isSelected={selectedUserIds.has(user.id)}
                          onSelect={handleSelectUser}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleEmail={handleToggleEmail}
                        />
                      ))}
                      {isLoadingMore && <SkeletonLoadingMore />}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UserDialogs
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        bulkDeleteDialogOpen={bulkDeleteDialogOpen}
        setBulkDeleteDialogOpen={setBulkDeleteDialogOpen}
        bulkUpdateDialogOpen={bulkUpdateDialogOpen}
        setBulkUpdateDialogOpen={setBulkUpdateDialogOpen}
        selectedUser={selectedUser}
        selectedUserIds={selectedUserIds}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        bulkUpdateData={bulkUpdateData}
        setBulkUpdateData={setBulkUpdateData}
        onConfirmDelete={confirmDelete}
        onUpdate={handleUpdate}
        onConfirmBulkDelete={confirmBulkDelete}
        onConfirmBulkUpdate={confirmBulkUpdate}
      />
    </div>
  );
}
