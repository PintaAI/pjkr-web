"use client";

import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Loader2,
} from "lucide-react";
import { getGuruVocabularySets } from "@/app/actions/kelas/vocabulary";
import { getGuruSoalSets } from "@/app/actions/kelas/soal-set";
import { toast } from "sonner";
import { VocabCard } from "@/components/dashboard/vocab-card";
import { SoalCard } from "@/components/dashboard/soal-card";
import { VocabularySet, SoalSet } from "@/lib/stores/kelas-builder/types";

export function StepResources() {
  const {
    draftId,
    resources,
    addVocabConnection,
    removeVocabConnection,
    addSoalConnection,
    removeSoalConnection,
    saveResources
  } = useKelasBuilderStore();
  const [availableVocabSets, setAvailableVocabSets] = useState<VocabularySet[]>([]);
  const [availableSoalSets, setAvailableSoalSets] = useState<SoalSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load available resources
  useEffect(() => {
    const loadResources = async () => {
      setIsLoading(true);
      try {
        const [vocabResult, soalResult] = await Promise.all([
          getGuruVocabularySets(),
          getGuruSoalSets()
        ]);

        if (vocabResult.success && vocabResult.data) {
          setAvailableVocabSets(vocabResult.data);
        }
        
        if (soalResult.success && soalResult.data) {
          setAvailableSoalSets(soalResult.data);
        }
      } catch (error) {
        console.error("Failed to load resources:", error);
        toast.error("Failed to load available resources");
      } finally {
        setIsLoading(false);
      }
    };

    loadResources();
  }, []);

  const handleConnectVocabSet = (vocabSet: VocabularySet) => {
    if (!resources.connectedVocabSets.some(c => c.id === vocabSet.id)) {
      addVocabConnection(vocabSet.id, vocabSet);
    }
  };

  const handleDisconnectVocabSet = (vocabSetId: number) => {
    removeVocabConnection(vocabSetId);
  };

  const handleConnectSoalSet = (soalSet: SoalSet) => {
    if (!resources.connectedSoalSets.some(c => c.id === soalSet.id)) {
      addSoalConnection(soalSet.id, soalSet);
    }
  };

  const handleDisconnectSoalSet = (soalSetId: number) => {
    removeSoalConnection(soalSetId);
  };


  const handleSaveConnections = async () => {
    if (!draftId) return;

    setIsSaving(true);
    try {
      await saveResources();
      toast.success("Resource connections saved successfully");
    } catch (error) {
      console.error("Failed to save connections:", error);
      toast.error("Failed to save resource connections");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading available resources...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Resource Connections Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{resources.connectedVocabSets.length}</div>
              <div className="text-sm text-muted-foreground">Vocabulary Sets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">{resources.connectedSoalSets.length}</div>
              <div className="text-sm text-muted-foreground">Question Sets</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary Sets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Vocabulary Sets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Available Vocabulary Sets */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-4">Available ({availableVocabSets.length})</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableVocabSets
                  .filter(vocab => !resources.connectedVocabSets.some(c => c.id === vocab.id))
                  .map((vocab) => (
                  <VocabCard
                    key={vocab.id}
                    vocabSet={vocab}
                    onClick={() => handleConnectVocabSet(vocab)}
                    compact={true}
                  />
                ))}
              </div>
            </div>

            {/* Connected Vocabulary Sets */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-4">Connected ({resources.connectedVocabSets.length})</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {resources.connectedVocabSets.map((connected) => (
                  <VocabCard
                    key={connected.id}
                    vocabSet={connected}
                    compact={true}
                    onClick={() => handleDisconnectVocabSet(connected.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Soal Sets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Question Sets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Available Soal Sets */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-4">Available ({availableSoalSets.length})</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableSoalSets
                  .filter(soal => !resources.connectedSoalSets.some(c => c.id === soal.id))
                  .map((soal) => (
                  <SoalCard
                    key={soal.id}
                    soalSet={soal}
                    onClick={() => handleConnectSoalSet(soal)}
                    compact={true}
                  />
                ))}
              </div>
            </div>

            {/* Connected Soal Sets */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-4">Connected ({resources.connectedSoalSets.length})</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {resources.connectedSoalSets.map((connected) => (
                  <SoalCard
                    key={connected.id}
                    soalSet={connected}
                    compact={true}
                    onClick={() => handleDisconnectSoalSet(connected.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {(resources.connectedVocabSets.length > 0 || resources.connectedSoalSets.length > 0) && (
        <div className="flex justify-end">
          <Button
            onClick={handleSaveConnections}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Connections
          </Button>
        </div>
      )}
    </div>
  );
}