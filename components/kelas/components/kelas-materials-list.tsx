"use client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Materi {
  id: number;
  title: string;
  description: string;
  order: number;
  isDemo: boolean;
  createdAt: Date;
}

interface KelasMaterialsListProps {
  materis: Materi[];
  showMaterials: boolean;
  setShowMaterials: (show: boolean) => void;
  hasTeasedMaterials: boolean;
}

export default function KelasMaterialsList({ 
  materis, 
  showMaterials, 
  setShowMaterials, 
  hasTeasedMaterials 
}: KelasMaterialsListProps) {
  if (materis.length === 0) return null;

  return (
    <div className="hidden lg:block lg:absolute lg:top-full lg:left-0 lg:w-64 mt-1 lg:border-border backdrop-blur-sm">
      <button
        onClick={() => setShowMaterials(!showMaterials)}
        className={` p-2 border rounded-lg flex items-center justify-between w-full text-left text-sm font-medium text-primary hover:text-primary/80 transition-colors ${!hasTeasedMaterials ? 'animate-pulse' : ''}`}
      >
        <span className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Materi ({materis.length})
        </span>
        {showMaterials ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      <AnimatePresence>
        {showMaterials && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ScrollArea className="mt-3 h-64">
              <div className="space-y-2 ">
                {materis.map((materi, index) => (
                  <motion.div
                    key={materi.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="p-3 rounded-lg bg-muted/40 border border-border/50 text-sm hover:bg-muted/60 transition-colors"
                  >
                    <div className="font-medium text-foreground mb-2">{materi.title}</div>
                    <div className="text-muted-foreground text-xs line-clamp-2 mb-1">{materi.description}</div>
                    {materi.isDemo && (
                      <Badge variant="outline" className="text-xs">
                        Demo
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}