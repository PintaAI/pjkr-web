// Demo page for testing Immer, Zustand, and React Hook Form with debounced database save

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { produce } from 'immer';
import { create } from 'zustand';
import NovelEditor from '@/components/novel/novel-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type FormData = {
  name: string;
  email: string;
  notes: string;
  content: string;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type AppState = {
  data: FormData;
  saveState: SaveState;
  updateData: (data: FormData) => void;
  setSaveState: (state: SaveState) => void;
};

const useAppStore = create<AppState>((set) => ({
  data: { name: '', email: '', notes: '', content: '' },
  saveState: 'idle',
  updateData: (data) => set(produce((state) => {
    state.data = data;
  })),
  setSaveState: (saveState) => set({ saveState }),
}));

// Simulate database save
const simulateDbSave = async (data: FormData): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Randomly fail sometimes to demo error state
  if (Math.random() < 0.1) {
    throw new Error('Save failed');
  }
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function StateTestPage() {
  const { data, saveState, updateData, setSaveState } = useAppStore();
  
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: data,
  });

  const watchedData = useWatch({ control });
  const debouncedData = useDebounce(watchedData, 1000);

  // Auto-save when debounced data changes
  const autoSave = useCallback(async (formData: FormData) => {
    if (!formData.name && !formData.email && !formData.notes && !formData.content) return;
    
    setSaveState('saving');
    try {
      await simulateDbSave(formData);
      updateData(formData);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (error) {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }, [updateData, setSaveState]);

  useEffect(() => {
    if (debouncedData && Object.values(debouncedData).some(Boolean)) {
      autoSave(debouncedData as FormData);
    }
  }, [debouncedData, autoSave]);

  const onManualSubmit = (formData: FormData) => {
    autoSave(formData);
  };

  const getSaveIndicator = () => {
    switch (saveState) {
      case 'saving':
        return <span style={{ color: '#f59e0b' }}>💾 Saving...</span>;
      case 'saved':
        return <span style={{ color: '#10b981' }}>✅ Saved</span>;
      case 'error':
        return <span style={{ color: '#ef4444' }}>❌ Save failed</span>;
      default:
        return <span style={{ color: '#6b7280' }}>⏱️ Auto-save ready</span>;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Immer + Zustand + RHF + Novel Editor Demo</h1>
      
      <div className="mb-6 flex items-center gap-2">
        <strong>Save Status:</strong>
        {getSaveIndicator()}
      </div>

      <form onSubmit={handleSubmit(onManualSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register('name', { required: 'Name is required' })}
            placeholder="Enter your name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email format'
              }
            })}
            placeholder="Enter your email"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Add some notes..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Rich Content (Novel Editor)</Label>
          <div className="border rounded-md ">
            <NovelEditor
              initialContent=""
              onUpdate={(content: { json: any; html: string }) => {
                // Update form value when editor content changes
                const event = {
                  target: {
                    name: 'content',
                    value: content.html
                  }
                };
                register('content').onChange(event);
              }}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={saveState === 'saving'}
          className="w-full"
        >
          {saveState === 'saving' ? 'Saving...' : 'Manual Save'}
        </Button>
      </form>

      <div className="mt-8 p-4 bg-primary-10 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current Zustand State:</h3>
        <pre className="text-xs overflow-auto bg-background p-3 rounded border max-h-64">
          {JSON.stringify({ data, saveState }, null, 2)}
        </pre>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        <p className="font-semibold mb-2">Features demonstrated:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>🔄 <strong>Immer:</strong> Immutable state updates in Zustand store</li>
          <li>🏪 <strong>Zustand:</strong> Global state management for form data and save status</li>
          <li>📝 <strong>React Hook Form:</strong> Form validation and controlled inputs</li>
          <li>⏱️ <strong>Debouncing:</strong> Auto-save triggers 1 second after typing stops</li>
          <li>💾 <strong>Save simulation:</strong> Async database save with loading states</li>
          <li>🔍 <strong>Real-time indicators:</strong> Visual feedback for save status</li>
          <li>✨ <strong>Novel Editor:</strong> Rich text editor with advanced features</li>
          <li>🎨 <strong>Shadcn/ui:</strong> Modern UI components with Tailwind CSS</li>
        </ul>
      </div>
    </div>
  );
}