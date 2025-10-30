import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type { KelasBuilderState, KelasMetaData } from './kelas-builder/types';
import { createProgress, type Progress } from './kelas-builder/progress';
import { createNavigation, type Navigation } from './kelas-builder/navigation';
import { createMeta, type Meta, initialMeta } from './kelas-builder/meta';
import { createContent, type Content } from './kelas-builder/content';
import { createResources, type Resources, initialResources } from './kelas-builder/resources';

import {
  createDraftKelas,
  publishKelas,
  unpublishKelas,
  deleteDraftKelas,
  getKelasById,
} from '@/app/actions/kelas';
import { toast } from 'sonner';

// Enable MapSet plugin for Immer before using it
enableMapSet();

type Store = KelasBuilderState &
  Progress &
  Navigation &
  Meta &
  Content &
  Resources;

export const useKelasBuilderStore = create<Store>()(
  devtools(
    subscribeWithSelector(
      immer((set, get, store) => ({
        draftId: null,
        kelasIsDraft: true,
        isLoading: false,
        error: null,
        editVersion: 0,
        optimisticUpdates: {},
        ...createProgress(set, get, store),
        ...createNavigation(set, get, store),
        ...createMeta(set, get, store),
        ...createContent(set, get, store),
        ...createResources(set, get, store),

        // Expose ensureDraftExists from navigation slice
        ensureDraftExists: createNavigation(set, get, store).ensureDraftExists,

        // Global Actions
        createDraft: async (initialMeta: KelasMetaData) => {
          const { draftId, isLoading } = get();

          // Prevent multiple draft creations - guard against race conditions
          if (draftId || isLoading) {
            console.log('🚫 [DRAFT GUARD] Draft creation blocked - draftId:', draftId, 'isLoading:', isLoading);
            return;
          }

          // Set optimistic draft ID to prevent race conditions
          const optimisticDraftId = `temp-${Date.now()}`;
          set({
            draftId: optimisticDraftId as any,
            isLoading: true,
            error: null
          });

          try {
            const serializedMeta = {
              ...initialMeta,
              jsonDescription: initialMeta.jsonDescription
                ? JSON.parse(JSON.stringify(initialMeta.jsonDescription))
                : undefined,
            };

            console.log('📝 [DRAFT CREATION] Creating draft with meta:', initialMeta.title);
            const result = await createDraftKelas(serializedMeta);

            if (result.success && result.data) {
              console.log('✅ [DRAFT CREATION] Draft created successfully with ID:', result.data.id);
              set({
                draftId: result.data.id,
                kelasIsDraft: true,
                meta: initialMeta,
                isLoading: false,
              });
              toast.success('Draft created successfully');
            } else {
              // Revert optimistic update on failure
              set({
                draftId: null,
                isLoading: false,
                error: result.error || 'Failed to create draft'
              });
              throw new Error(result.error || 'Failed to create draft');
            }
          } catch (error) {
            // Revert optimistic update on failure
            set({
              draftId: null,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create draft'
            });
            console.error('❌ [DRAFT CREATION] Failed to create draft:', error);
            toast.error('Failed to create draft');
          }
        },
        loadDraft: async (kelasId: number) => {
          set({ isLoading: true, error: null });
          try {
            const result = await getKelasById(kelasId);
            if (result.success && result.data) {
              const kelas = result.data;
              set({
                draftId: kelas.id,
                kelasIsDraft: kelas.isDraft ?? true,
                meta: {
                  title: kelas.title,
                  description: kelas.description || '',
                  jsonDescription: kelas.jsonDescription,
                  htmlDescription: kelas.htmlDescription || '',
                  type: kelas.type,
                  level: kelas.level,
                  thumbnail: kelas.thumbnail || '',
                  icon: kelas.icon || '',
                  isPaidClass: kelas.isPaidClass,
                  price: kelas.price ? Number(kelas.price) : undefined,
                  discount: kelas.discount ? Number(kelas.discount) : undefined,
                  promoCode: kelas.promoCode || '',
                },
                materis: (kelas.materis || []).map((materi: any) => ({
                  id: materi.id,
                  title: materi.title,
                  description: materi.description,
                  jsonDescription: materi.jsonDescription,
                  htmlDescription: materi.htmlDescription,
                  order: materi.order,
                  isDemo: materi.isDemo,
                  isDraft: materi.isDraft,
                  koleksiSoalId: materi.koleksiSoalId,
                  passingScore: materi.passingScore,
                })),
                isLoading: false,
                currentStep: 'meta',
              });
              
              // Load resources after setting the draft
              await get().loadResources();
              toast.success('Class loaded successfully');
            } else {
              throw new Error(result.error || 'Failed to load draft');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load draft';
            set({ isLoading: false, error: errorMessage });
            toast.error('Failed to load draft');
          }
        },
        publishDraft: async () => {
          const { draftId, materis, saveMateris, kelasIsDraft } = get();
          if (!draftId) return;
          // Prevent double publish
            if (!kelasIsDraft) {
              toast.message('Class already published');
              return;
            }

          set({ isLoading: true, error: null });

          try {
            const unsavedMateris = materis.filter((m: any) => m.tempId);
            if (unsavedMateris.length > 0) {
              await saveMateris();
            }

            const result = await publishKelas(draftId);
            if (result.success) {
              set({ isLoading: false, kelasIsDraft: false });
              toast.success('Class published successfully');
            } else {
              throw new Error(result.error || 'Failed to publish class');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to publish class';
            set({ isLoading: false, error: errorMessage });
            toast.error('Failed to publish class');
          }
        },
        unpublishDraft: async () => {
          const { draftId, kelasIsDraft } = get();
          if (!draftId) return;
          // Only unpublish if currently published
          if (kelasIsDraft) {
            toast.message('Class already in draft state');
            return;
          }

          set({ isLoading: true, error: null });

          try {
            const result = await unpublishKelas(draftId);
            if (result.success) {
              set({ isLoading: false, kelasIsDraft: true });
              toast.success('Class reverted to draft');
            } else {
              throw new Error(result.error || 'Failed to unpublish class');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to unpublish class';
            set({ isLoading: false, error: errorMessage });
            toast.error('Failed to unpublish class');
          }
        },
        deleteDraft: async () => {
          const { draftId } = get();
          if (!draftId) return;

          set({ isLoading: true, error: null });

          try {
            const result = await deleteDraftKelas(draftId);
            if (result.success) {
              get().reset();
              toast.success('Draft deleted successfully');
            } else {
              throw new Error(result.error || 'Failed to delete draft');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete draft';
            set({ isLoading: false, error: errorMessage });
            toast.error('Failed to delete draft');
          }
        },
        reset: () => {
          set({
            draftId: null,
            kelasIsDraft: true,
            currentStep: 'meta',
            isLoading: false,
            error: null,
            meta: initialMeta,
            materis: [],
            resources: { ...initialResources },
            stepDirtyFlags: {
              meta: false,
              content: false,
              resources: false,
              review: false,
            },
            optimisticUpdates: {},
            deletedMateris: [],
            dirtyMateris: new Set(),
          });
        },
        setError: (error: string | null) => {
          set({ error });
        },
        clearError: () => {
          set({ error: null });
        },
        
      }))
    ),
    {
      name: 'kelas-builder-store',
    }
  )
);
