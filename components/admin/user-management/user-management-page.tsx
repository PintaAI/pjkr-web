"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, UserPlus, UserCheck, CheckCircle, Shield } from "lucide-react";

import { UserManagementData } from "./types";
import { calculateUserStats, filterUsers } from "./utils";
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
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    selectedUser,
    editFormData,
    setEditFormData,
    loadUsers,
    handleEdit,
    handleDelete,
    handleToggleEmail,
    confirmDelete,
    handleUpdate,
    tableRef,
  } = useUserManagement(initialData);

  // Calculate stats for display
  const stats = calculateUserStats(users);

  // Filter users based on search and filters
  const filteredUsers = filterUsers(users, searchTerm, roleFilter, statusFilter);

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
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 15 }).map((_, i) => (
                      <SkeletonUserRow key={i} />
                    ))
                  ) : filteredUsers.length ? (
                    <>
                      {filteredUsers.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleEmail={handleToggleEmail}
                        />
                      ))}
                      {isLoadingMore && <SkeletonLoadingMore />}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
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
        selectedUser={selectedUser}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onConfirmDelete={confirmDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
