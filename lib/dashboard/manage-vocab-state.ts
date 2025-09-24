import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { VocabularyType } from "@prisma/client";

interface VocabItem {
  id?: number | string;
  korean: string;
  indonesian: string;
  type: VocabularyType;
  pos?: any; // PartOfSpeech
  audioUrl?: string;
  exampleSentences: string[];
}

interface FormData {
  title: string;
  description: string;
  icon: string;
  isPublic: boolean;
}

interface VocabState {
  loading: boolean;
  saving: boolean;
  formData: FormData;
  items: VocabItem[];
  itemDialogOpen: boolean;
  editingItemIndex: number | null;
  generating: boolean;
}

interface VocabActions {
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setFormData: (formData: Partial<FormData>) => void;
  setItems: (items: VocabItem[]) => void;
  setItemDialogOpen: (open: boolean) => void;
  setEditingItemIndex: (index: number | null) => void;
  setGenerating: (generating: boolean) => void;

  // Actions
  initForCreate: () => void;
  initForEdit: (vocabSet: any) => void; // TODO: proper type
  handleAddItem: () => void;
  handleEditItem: (index: number) => void;
  handleDeleteItem: (index: number) => void;
  handleSaveItem: (itemData: VocabItem) => void;
  handleCancelItem: () => void;
  handleQuickAdd: (korean: string, indonesian: string) => void;
  reset: () => void;
}

const initialState: VocabState = {
  loading: false,
  saving: false,
  formData: {
    title: "",
    description: "",
    icon: "FaBookOpen",
    isPublic: false,
  },
  items: [
    {
      korean: "",
      indonesian: "",
      type: VocabularyType.WORD,
      exampleSentences: [""],
    },
  ],
  itemDialogOpen: false,
  editingItemIndex: null,
  generating: false,
};

export const useVocabStore = create<VocabState & VocabActions>()(
  immer((set, get) => ({
    ...initialState,

    setLoading: (loading) => set({ loading }),
    setSaving: (saving) => set({ saving }),
    setFormData: (updates) => set((state) => {
      state.formData = { ...state.formData, ...updates };
    }),
    setItems: (items) => set({ items }),
    setItemDialogOpen: (itemDialogOpen) => set({ itemDialogOpen }),
    setEditingItemIndex: (editingItemIndex) => set({ editingItemIndex }),
    setGenerating: (generating) => set({ generating }),

    initForCreate: () => set((state) => {
      state.loading = false;
      state.saving = false;
      state.formData = {
        title: "",
        description: "",
        icon: "FaBookOpen",
        isPublic: false,
      };
      state.items = [];
      state.itemDialogOpen = false;
      state.editingItemIndex = null;
      state.generating = false;
    }),

    initForEdit: (vocabSet) => set((state) => {
      state.loading = true;
      state.formData = {
        title: vocabSet.title || "",
        description: vocabSet.description || "",
        icon: vocabSet.icon || "FaBookOpen",
        isPublic: vocabSet.isPublic || false,
      };
      // items will be set after population
    }),

    handleAddItem: () => set((state) => {
      state.editingItemIndex = null;
      state.itemDialogOpen = true;
    }),

    handleEditItem: (index) => set((state) => {
      state.editingItemIndex = index;
      state.itemDialogOpen = true;
    }),

    handleDeleteItem: (index) => set((state) => {
      state.items.splice(index, 1);
    }),

    handleSaveItem: (itemData) => set((state) => {
      if (state.editingItemIndex !== null) {
        state.items[state.editingItemIndex] = itemData;
      } else {
        state.items.push(itemData);
      }
      state.itemDialogOpen = false;
      state.editingItemIndex = null;
    }),

    handleCancelItem: () => set((state) => {
      state.itemDialogOpen = false;
      state.editingItemIndex = null;
    }),

    handleQuickAdd: (korean, indonesian) => set((state) => {
      if (!korean.trim() || !indonesian.trim()) return;
      const newItem: VocabItem = {
        korean: korean.trim(),
        indonesian: indonesian.trim(),
        type: VocabularyType.WORD,
        exampleSentences: [""],
      };
      state.items.push(newItem);
    }),

    reset: () => set(initialState),
  }))
);