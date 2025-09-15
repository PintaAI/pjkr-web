"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

interface SoalItemCardProps {
  data: {
    id: number;
    pertanyaan: string;
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    explanation?: string;
    options?: string[];
    correctOptionIndex: number;
    author: {
      id: string;
      name: string;
      image: string;
    };
    isActive: boolean;
    collectionName: string;
  };
  className?: string;
}

const difficultyStyles = {
  BEGINNER: "bg-success/15 text-success",
  INTERMEDIATE: "bg-secondary text-secondary-foreground",
  ADVANCED: "bg-destructive/10 text-destructive",
} as const;

export function SoalItemCard({ data, className = "" }: SoalItemCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  return (
    <Card className={`group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer p-4 relative bg-gradient-to-br from-card to-muted/20 ${className}`}>
      <div className={`absolute inset-x-0 top-0 h-1 ${data.difficulty === "BEGINNER" ? "bg-gradient-to-r from-success to-card" : data.difficulty === "INTERMEDIATE" ? "bg-gradient-to-r from-secondary to-card" : "bg-gradient-to-r from-destructive to-card"}`} />
      <div className="absolute top-4 -right-3 bg-primary text-primary-foreground px-6  text-xs font-semibold transform -translate-y-1 translate-x-1 rotate-45 shadow-xl">
        Soal
      </div>
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground pl-2 border-l-2 border-border">
            {data.collectionName}
          </span>
        </div>

        <h3
          className="text-base font-semibold leading-tight line-clamp-3"
          dangerouslySetInnerHTML={{
            __html: data.pertanyaan
          }}
        />

        {data.explanation && (
          <p
            className="text-sm text-muted-foreground line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: data.explanation
            }}
          />
        )}

        {data.options && data.options.length > 0 && (
          <div className="space-y-2">
            {data.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`option-${data.id}-${index}`}
                  name={`question-${data.id}`}
                  value={index}
                  checked={selected === index}
                  onChange={() => setSelected(index)}
                  disabled={checked}
                  className="h-4 w-4 text-primary border-border focus:ring-primary"
                />
                <Label
                  htmlFor={`option-${data.id}-${index}`}
                  className={`text-sm cursor-pointer ${
                    checked
                      ? index === data.correctOptionIndex
                        ? 'font-semibold text-success'
                        : index === selected
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span dangerouslySetInnerHTML={{ __html: option }} />
                </Label>
              </div>
            ))}
          </div>
        )}

        {!checked && selected !== null && (
          <Button onClick={() => setChecked(true)} className="mt-3">
            Check Answer
          </Button>
        )}

        {checked && (
          <div className="mt-3 p-3 bg-muted rounded-md">
            {selected === data.correctOptionIndex ? (
              <p className="text-success font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Correct! 🎉
              </p>
            ) : (
              <div className="text-destructive">
                <p className="font-semibold mb-1">Incorrect</p>
                <p className="text-sm">
                  The correct answer is: <span dangerouslySetInnerHTML={{ __html: data.options![data.correctOptionIndex] }} />
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <Badge className={difficultyStyles[data.difficulty]}>
            {data.difficulty.toLowerCase()}
          </Badge>
          <div className="flex items-center gap-2">
            <Avatar
              className="h-6 w-6"
              userId={data.author.id}
              clickable={true}
            >
              <AvatarImage src={data.author.image} />
              <AvatarFallback className="text-xs">
                {data.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {data.author.name}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}