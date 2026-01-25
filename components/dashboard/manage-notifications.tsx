"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, User, Calendar } from "lucide-react";
import { NotificationSheet } from "./notification-sheet";

interface RecentNotification {
  id: string;
  title: string;
  body: string;
  sentAt: Date;
  recipientName?: string;
  recipientEmail?: string;
  sentCount?: number;
  failedCount?: number;
}

interface ManageNotificationsProps {
  recentNotifications?: RecentNotification[];
}

export function ManageNotifications({ recentNotifications = [] }: ManageNotificationsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleNotificationSuccess = () => {
    setSheetOpen(false);
    // Refresh notifications list if needed
  };

  const handleCancel = () => {
    setSheetOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kelola Notifikasi</h2>
          <p className="text-muted-foreground">
            Kirim push notifikasi ke siswa tentang kelas, materi, atau pengumuman
          </p>
        </div>
        <Button onClick={() => setSheetOpen(true)} className="gap-2">
          <Send className="h-4 w-4" />
          Kirim Notifikasi Baru
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSheetOpen(true)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Bell className="h-8 w-8 text-amber-500" />
              <Badge variant="secondary">Tersedia</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base mb-1">Kirim Notifikasi</CardTitle>
            <CardDescription className="text-sm">
              Kirim pesan langsung ke siswa
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <User className="h-8 w-8 text-blue-500" />
              <Badge variant="secondary">Segera</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base mb-1">Notifikasi Massal</CardTitle>
            <CardDescription className="text-sm">
              Kirim ke semua siswa sekaligus
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Calendar className="h-8 w-8 text-purple-500" />
              <Badge variant="secondary">Segera</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base mb-1">Jadwalkan Notifikasi</CardTitle>
            <CardDescription className="text-sm">
              Atur pengiriman otomatis
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifikasi Terkirim</CardTitle>
          <CardDescription>Riwayat notifikasi yang telah dikirim</CardDescription>
        </CardHeader>
        <CardContent>
          {recentNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada notifikasi yang dikirim</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.body}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(notification.sentAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      {notification.recipientName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {notification.recipientName}
                        </span>
                      )}
                      {notification.sentCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <Send className="h-3 w-3" />
                          {notification.sentCount} terkirim
                        </span>
                      )}
                      {notification.failedCount && notification.failedCount > 0 && (
                        <span className="text-red-500">
                          {notification.failedCount} gagal
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Sheet */}
      <NotificationSheet
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleNotificationSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
