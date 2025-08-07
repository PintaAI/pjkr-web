"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, UserPlus, UserCheck, CheckCircle, Shield, Trash2, Users, ArrowUpDown, ArrowUp, ArrowDown, User, UserCog, TrendingUp, Calendar, Settings } from "lucide-react";

import { UserManagementData } from "./types";
import {  filterUsers, sortUsers } from "./utils";
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
    databaseStats,
    isLoading,
    isLoadingStats,
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
    refreshData,
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
          <Button variant="outline" size="sm" onClick={refreshData}>
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
        {isLoadingStats ? (
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
              value={databaseStats.totalUsers}
              subtitle={`+${databaseStats.newUsersThisWeek} this week`}
              icon={UserCheck}
            />
            <StatsCard
              title="Active Users"
              value={databaseStats.activeUsers}
              subtitle={`${Math.round((databaseStats.activeUsers / databaseStats.totalUsers) * 100)}% of total`}
              icon={CheckCircle}
            />
            <StatsCard
              title="Teachers"
              value={databaseStats.teacherCount}
              subtitle={`${Math.round((databaseStats.teacherCount / databaseStats.totalUsers) * 100)}% of total`}
              icon={Shield}
            />
            <StatsCard
              title="Students"
              value={databaseStats.studentCount}
              subtitle={`${Math.round((databaseStats.studentCount / databaseStats.totalUsers) * 100)}% of total`}
              icon={UserCheck}
            />
          </>
        )}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            
            {/* Compact Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <UserFilters
                searchTerm={searchTerm}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onRoleFilterChange={setRoleFilter}
                onStatusFilterChange={setStatusFilter}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUserIds.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
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
          )}
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
                        <User className="h-4 w-4 mr-2" />
                        User
                        {getSortIcon("name")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 lg:px-3"
                        onClick={() => handleSort("role")}
                      >
                        <UserCog className="h-4 w-4 mr-2" />
                        Role
                        {getSortIcon("role")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 lg:px-3"
                        onClick={() => handleSort("level")}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Progress
                        {getSortIcon("level")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 lg:px-3"
                        onClick={() => handleSort("createdAt")}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Joined
                        {getSortIcon("createdAt")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Actions
                      </div>
                    </TableHead>
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
