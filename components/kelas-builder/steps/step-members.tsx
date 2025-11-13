"use client";

import { useState, useEffect, useCallback } from "react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Mail,
  Trash2,
  AlertCircle,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import { addMemberByEmail, getKelasMembers, removeMemberFromKelas } from "@/app/actions/kelas/invitation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
}

export function StepMembers() {
  const { draftId } = useKelasBuilderStore();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!draftId) return;

    setIsLoading(true);
    try {
      const result = await getKelasMembers(draftId);
      if (result.success && result.data) {
        setMembers(result.data.members as Member[]);
        setTotalCount(result.data._count.members);
      } else {
        setError(result.error || "Failed to load members");
      }
    } catch {
      setError("Failed to load members");
    } finally {
      setIsLoading(false);
    }
  }, [draftId]);

  // Load members when component mounts or draftId changes
  useEffect(() => {
    if (draftId) {
      loadMembers();
    }
  }, [draftId, loadMembers]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !draftId) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await addMemberByEmail({ email: email.trim(), kelasId: draftId });

      if (result.success) {
        setSuccess(result.message || "Member added successfully");
        setEmail("");
        // Reload members list
        await loadMembers();
      } else {
        setError(result.error || "Failed to add member");
      }
    } catch {
      setError("Failed to add member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!draftId || !confirm("Are you sure you want to remove this member?")) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await removeMemberFromKelas(draftId, memberId);

      if (result.success) {
        setSuccess(result.message || "Member removed successfully");
        // Reload members list
        await loadMembers();
      } else {
        setError(result.error || "Failed to remove member");
      }
    } catch {
      setError("Failed to remove member");
    } finally {
      setIsLoading(false);
    }
  };

  if (!draftId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please save your class information first before managing members.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{totalCount}</div>
            <div className="text-sm text-muted-foreground">Total Members</div>
          </div>
        </CardContent>
      </Card>

      {/* Add Member Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Member by Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter user email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading || !email.trim()}>
                <Mail className="h-4 w-4 mr-2" />
                {isLoading ? "Adding..." : "Add Member"}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <p className="text-sm text-muted-foreground">
              Enter the email address of a registered user to add them as a member of this class.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Members ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No members yet. Add members using the form above.
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.image || undefined} />
                      <AvatarFallback>
                        {member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {member.name || "No name"}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> member yang ditambahkan akan memiliki akses penuh ke
          kelas ini, termasuk materi dan sumber daya yang ada di dalamnya.
        </AlertDescription>
      </Alert>
    </div>
  );
}