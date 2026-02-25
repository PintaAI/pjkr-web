"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sendPushNotification } from "@/app/actions/push-notifications";
import { searchUsers } from "@/app/actions/dashboard/admin";
import { toast } from "sonner";
import { z } from "zod";

const notificationSchema = z.object({
  userId: z.string().min(1, "Pilih penerima notifikasi"),
  title: z.string().min(1, "Judul harus diisi").max(255),
  body: z.string().min(1, "Isi pesan harus diisi").max(1000),
  data: z.string().optional(),
});

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface NotificationSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NotificationSheet({ isOpen, onOpenChange, onSuccess, onCancel }: NotificationSheetProps) {
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [data, setData] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const users = await searchUsers(query, 10);
      setSearchResults(users);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleSelectUser = (user: User) => {
    setUserId(user.id);
    setSelectedUser(user);
    setSearchQuery(user.name || user.email);
    setShowResults(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("[NOTIFICATION SHEET] Starting notification submission");
    console.log("[NOTIFICATION SHEET] Form data:", { userId, title, body, data, selectedUser });

    try {
      // Validate form
      const validatedData = notificationSchema.parse({
        userId,
        title,
        body,
        data: data || undefined,
      });

      console.log("[NOTIFICATION SHEET] Validated data:", validatedData);

      // Parse data as JSON if provided
      let parsedData;
      if (validatedData.data) {
        try {
          parsedData = JSON.parse(validatedData.data);
          console.log("[NOTIFICATION SHEET] Parsed JSON data:", parsedData);
        } catch {
          console.error("[NOTIFICATION SHEET] Invalid JSON data");
          toast.error("Data harus berupa JSON yang valid");
          setIsSubmitting(false);
          return;
        }
      }

      console.log("[NOTIFICATION SHEET] Calling sendPushNotification with:", {
        userId: validatedData.userId,
        title: validatedData.title,
        body: validatedData.body,
        data: parsedData
      });

      const result = await sendPushNotification(
        validatedData.userId,
        validatedData.title,
        validatedData.body,
        parsedData
      );

      console.log("[NOTIFICATION SHEET] Result from server:", result);

      if (result.success) {
        const successResult = result as { success: true; sentCount: number; failedCount: number; errors?: string[] };
        toast.success(
          `Notifikasi berhasil dikirim! (${successResult.sentCount} perangkat)`
        );
        if (successResult.errors && successResult.errors.length > 0) {
          console.log("[NOTIFICATION SHEET] Errors:", successResult.errors);
          successResult.errors.forEach((error: string) => toast.warning(error));
        }
        // Reset form
        setUserId("");
        setTitle("");
        setBody("");
        setData("");
        setSearchQuery("");
        setSelectedUser(null);
        onSuccess();
      } else {
        const errorResult = result as { success: false; error: string };
        console.error("[NOTIFICATION SHEET] Server returned error:", errorResult.error);
        toast.error(errorResult.error || "Gagal mengirim notifikasi");
      }
    } catch (error) {
      console.error("[NOTIFICATION SHEET] Error during submission:", error);
      if (error instanceof z.ZodError) {
        console.error("[NOTIFICATION SHEET] Zod validation errors:", error.issues);
        toast.error(error.issues[0].message);
      } else {
        toast.error("Terjadi kesalahan saat mengirim notifikasi");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setUserId("");
    setTitle("");
    setBody("");
    setData("");
    setSearchQuery("");
    setSelectedUser(null);
    setShowResults(false);
    onCancel();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto m-0">
        <SheetHeader>
          <SheetTitle className="text-center">Kirim Notifikasi</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user">Penerima Notifikasi</Label>
            <div className="relative">
              <Input
                id="user"
                type="text"
                placeholder="Cari siswa berdasarkan nama atau email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="font-medium">{user.name || "Tanpa Nama"}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                    </button>
                  ))}
                </div>
              )}
              {selectedUser && (
                <div className="mt-2 p-2 bg-muted rounded-md flex items-center justify-between">
                  <div>
                    <div className="font-medium">{selectedUser.name || "Tanpa Nama"}</div>
                    <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUserId("");
                      setSelectedUser(null);
                      setSearchQuery("");
                    }}
                  >
                    Ubah
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              placeholder="Masukkan judul notifikasi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Isi Pesan</Label>
            <Textarea
              id="body"
              placeholder="Masukkan isi pesan notifikasi"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={1000}
              rows={4}
            />
            <div className="text-xs text-muted-foreground text-right">
              {body.length}/1000
            </div>
          </div>

          {/* Optional Data */}
          <div className="space-y-2">
            <Label htmlFor="data">Data (Opsional - JSON)</Label>
            <Textarea
              id="data"
              placeholder='{"key": "value"}'
              value={data}
              onChange={(e) => setData(e.target.value)}
              rows={3}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Data tambahan dalam format JSON (opsional)
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !userId || !title || !body}
              className="flex-1"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Notifikasi"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
