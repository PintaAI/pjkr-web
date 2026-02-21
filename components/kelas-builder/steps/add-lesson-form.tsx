"use client";

import React, { useState, useEffect } from "react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import NovelEditor from "@/components/novel/novel-editor";
import { Plus, Edit2, BookOpen, Target, X } from "lucide-react";

interface LessonFormProps {
  mode?: 'add' | 'edit';
  initialData?: {
    title: string;
    description: string;
    jsonDescription: any;
    htmlDescription: string;
    isDemo: boolean;
    koleksiSoalId?: number | null;
    passingScore?: number;
  };
  onSubmit: (lesson: {
    title: string;
    description: string;
    jsonDescription: any;
    htmlDescription: string;
    isDemo: boolean;
    koleksiSoalId?: number | null;
    passingScore?: number | null;
  }) => void;
  trigger?: React.ReactNode;
  kelasId?: number; // For fetching related soal collections
}

export function LessonForm({
  mode = 'add',
  initialData,
  onSubmit,
  trigger,
  kelasId
}: LessonFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading } = useKelasBuilderStore();
  const [availableSoal, setAvailableSoal] = useState<Array<{id: number, nama: string}>>([]);
  const [soalDropdownOpen, setSoalDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    jsonDescription: initialData?.jsonDescription || { type: "doc", content: [] },
    htmlDescription: initialData?.htmlDescription || '',
    isDemo: initialData?.isDemo || false,
    koleksiSoalId: initialData?.koleksiSoalId ?? null,
    passingScore: initialData?.passingScore ?? null,
  });

  // Reset form data when initialData changes (for edit mode)
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        jsonDescription: initialData.jsonDescription,
        htmlDescription: initialData.htmlDescription,
        isDemo: initialData.isDemo,
        koleksiSoalId: initialData.koleksiSoalId ?? null,
        passingScore: initialData.passingScore || 80,
      });
    }
  }, [initialData]);

  // Fetch available soal collections when dropdown is opened
  useEffect(() => {
    const fetchAvailableSoal = async () => {
      console.log('🔍 Checking conditions:', {
        kelasId: !!kelasId,
        soalDropdownOpen,
        availableSoalLength: availableSoal.length
      });

      if (kelasId && soalDropdownOpen && availableSoal.length === 0) {
        try {
          console.log('🔄 Fetching soal collections for kelas:', kelasId);
          // Get kelas-related soal collections
          const response = await fetch(`/api/kelas/${kelasId}/soal-collections`);
          console.log('📡 Response status:', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Fetched soal collections:', data.data?.length || 0, 'items');
            console.log('📋 Soal data:', data.data);
            setAvailableSoal(data.data || []);
          } else {
            console.error('❌ Failed to fetch soal collections:', response.statusText);
            const errorText = await response.text();
            console.error('❌ Error details:', errorText);
          }
        } catch (error) {
          console.error('❌ Failed to fetch soal collections:', error);
        }
      } else {
        console.log('⏭️ Skipping fetch - conditions not met');
      }
    };

    if (soalDropdownOpen) {
      console.log('🎯 Dropdown opened, attempting to fetch soal collections...');
      fetchAvailableSoal();
    }
  }, [soalDropdownOpen, kelasId, availableSoal.length]);

  const handleContentUpdate = (data: { json: any; html: string }) => {
    setFormData(prev => ({ 
      ...prev, 
      jsonDescription: data.json, 
      htmlDescription: data.html 
    }));
  };

  const handleFormSubmit = () => {
    if (formData.title && formData.description && formData.htmlDescription) {
      onSubmit(formData);
      if (mode === 'add') {
        // Reset form only for add mode
        setFormData({
          title: '',
          description: '',
          jsonDescription: { type: "doc", content: [] },
          htmlDescription: '',
          isDemo: false,
          koleksiSoalId: null,
          passingScore: null,
        });
      }
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'add') {
      // Reset form for add mode
      setFormData({
        title: '',
        description: '',
        jsonDescription: { type: "doc", content: [] },
        htmlDescription: '',
        isDemo: false,
        koleksiSoalId: null,
        passingScore: null,
      });
    } else {
      // Reset to initial data for edit mode
      setFormData({
        title: initialData?.title || '',
        description: initialData?.description || '',
        jsonDescription: initialData?.jsonDescription || { type: "doc", content: [] },
        htmlDescription: initialData?.htmlDescription || '',
        isDemo: initialData?.isDemo || false,
        koleksiSoalId: initialData?.koleksiSoalId ?? null,
        passingScore: initialData?.passingScore || 80,
      });
    }
    setIsOpen(false);
  };

  const defaultTrigger = mode === 'add' ? (
    <Button className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Tambah Pelajaran
    </Button>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
    >
      <Edit2 className="h-4 w-4" />
    </Button>
  );

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="bottom">
      <DrawerTrigger asChild>
        {trigger || defaultTrigger}
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <div className="max-w-7xl sm:max-w-5xl mx-auto overflow-y-auto min-w-0 w-full">
          <DrawerHeader>
            <DrawerTitle className="flex items-center justify-between">
              <span>{mode === 'add' ? 'Tambah Pelajaran Baru' : 'Edit Pelajaran'}</span>
              <div className="flex items-center space-x-2">
                <Label htmlFor="isDemo" className="text-sm">Demo</Label>
                <Switch
                  id="isDemo"
                  checked={formData.isDemo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDemo: checked }))}
                />
              </div>
            </DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Pelajaran *</Label>
            <Input
              id="title"
              placeholder="Masukkan judul pelajaran"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Input
              id="description"
              placeholder="Deskripsi singkat pelajaran"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Konten *</Label>
            <NovelEditor
              initialContent={formData.jsonDescription}
              onUpdate={handleContentUpdate}
              className="min-h-[500px]"
              saveStatus={isLoading ? "Saving..." : "Saved"}
              showTopToolbar={true}
            />
          </div>

          {/* Assessment Configuration */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <Label className="text-base font-medium">Pengaturan Penilaian</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="koleksiSoal">Soal Penilaian (Opsional)</Label>
              <Select
                value={formData.koleksiSoalId?.toString() || "none"}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  koleksiSoalId: value && value !== "none" ? parseInt(value) : null,
                  passingScore: value && value !== "none" ? prev.passingScore : null
                }))}
                onOpenChange={setSoalDropdownOpen}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih soal penilaian (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada penilaian</SelectItem>
                  {availableSoal.map((soal) => (
                    <SelectItem key={soal.id} value={soal.id.toString()}>
                      {soal.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Pilih paket soal untuk penilaian pelajaran ini
              </p>
            </div>

            {/* Show connected assessment as badge with remove button */}
            {formData.koleksiSoalId && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Penilaian: {availableSoal.find(s => s.id === formData.koleksiSoalId)?.nama || 'Dipilih'}
                  </span>
                  {formData.passingScore && (
                    <span className="text-xs text-blue-600">
                      (Lulus: {formData.passingScore}%)
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    koleksiSoalId: null,
                    passingScore: null
                  }))}
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {formData.koleksiSoalId && (
              <div className="space-y-2">
                <Label htmlFor="passingScore" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Nilai Kelulusan (%)
                </Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore || 80}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    passingScore: parseInt(e.target.value) || 80
                  }))}
                />
                <p className="text-sm text-muted-foreground">
                  Nilai minimum untuk lulus penilaian ini (0-100%)
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              Batal
            </Button>
            <Button 
              onClick={handleFormSubmit} 
              disabled={!formData.title || !formData.description || !formData.htmlDescription}
            >
              {mode === 'add' ? 'Tambah Pelajaran' : 'Simpan Perubahan'}
            </Button>
          </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
