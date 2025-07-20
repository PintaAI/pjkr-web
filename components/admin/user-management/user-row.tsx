import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { Edit, MoreHorizontal, Trash2, UserCheck, UserX, BadgeCheck } from "lucide-react";
import { UserWithStats } from "./types";
import { formatDate, getRoleBadgeVariant } from "./utils";

interface UserRowProps {
  user: UserWithStats;
  isSelected: boolean;
  onSelect: (userId: string, checked: boolean) => void;
  onEdit: (user: UserWithStats) => void;
  onDelete: (user: UserWithStats) => void;
  onToggleEmail: (user: UserWithStats) => void;
}

export function UserRow({ user, isSelected, onSelect, onEdit, onDelete, onToggleEmail }: UserRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(user.id, !!checked)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>
              {user.name ? user.name.split(' ').map(n => n[0]).join('') : user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{user.name || "No Name"}</span>
              {user.emailVerified && (
                <BadgeCheck className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getRoleBadgeVariant(user.role) as any}>
          {user.role}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>Level {user.level} • {user.xp} XP</div>
          <div className="text-muted-foreground">
            {user.currentStreak} day streak
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {formatDate(user.createdAt)}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleEmail(user)}>
              {user.emailVerified ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Disable Email
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Verify Email
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(user)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
