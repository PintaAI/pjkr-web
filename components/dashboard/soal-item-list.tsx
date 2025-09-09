"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Plus, Trash2, HelpCircle } from "lucide-react";
import { Difficulty } from "@prisma/client";

interface SoalItem {
  id?: number | string;
  pertanyaan: string;
  difficulty?: Difficulty | null;
  opsis?: Array<{
    id?: number | string;
    opsiText: string;
    isCorrect: boolean;
  }>;
}

interface SoalItemListProps {
  items: SoalItem[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
  onQuickAdd: (pertanyaan: string) => void;
}

export function SoalItemList({ items, onEdit, onDelete, onAdd, onQuickAdd }: SoalItemListProps) {
  const [quickPertanyaan, setQuickPertanyaan] = useState("");
  const pertanyaanRef = useRef<HTMLInputElement>(null);

  const handleQuickAdd = () => {
    if (!quickPertanyaan.trim()) return;
    onQuickAdd(quickPertanyaan.trim());
    setQuickPertanyaan("");
    pertanyaanRef.current?.focus();
  };

  const getDifficultyBadge = (difficulty?: Difficulty | null) => {
    if (!difficulty) return <Badge variant="secondary" className="text-xs">Not set</Badge>;

    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let className = "text-xs";

    switch (difficulty) {
      case "BEGINNER":
        variant = "default";
        className += " bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        break;
      case "INTERMEDIATE":
        variant = "secondary";
        className += " bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        break;
      case "ADVANCED":
        variant = "destructive";
        className += " bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        break;
      default:
        variant = "secondary";
    }

    return (
      <Badge variant={variant} className={className}>
        {difficulty.toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Questions</h3>
        <Button type="button" onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          ref={pertanyaanRef}
          placeholder="Enter question text"
          value={quickPertanyaan}
          onChange={(e) => setQuickPertanyaan(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleQuickAdd();
            }
          }}
          className="flex-1"
        />
        <Button onClick={handleQuickAdd} disabled={!quickPertanyaan.trim()}>
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-sm font-semibold mb-2">No questions yet</h3>
            <p className="text-xs text-muted-foreground text-center">
              Click "Add Question" or use the quick add above to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Card key={item.id || index} className="group hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    {getDifficultyBadge(item.difficulty)}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-medium leading-relaxed mb-3 line-clamp-3">
                  {item.pertanyaan}
                </h4>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {item.opsis?.length || 0} options
                    {item.opsis && item.opsis.filter(o => o.isCorrect).length > 0 && (
                      <span className="ml-1">
                        ({item.opsis.filter(o => o.isCorrect).length} correct)
                      </span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}