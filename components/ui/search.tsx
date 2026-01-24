"use client"


import { Search, BookOpen, Brain, Users, Headphones, PlayCircle, Trophy, Calendar, Target } from "lucide-react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function SearchComponent() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const handleValueChange = (search: string) => {
    setValue(search)
    console.log("Search query:", search)
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full h-full justify-between text-muted-foreground"
      >
        <div className="flex items-center">
          <Search className="mr-2 h-4 w-4" />
          cari kosa kata,kelas, informasi lainya
        </div>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="cari kosa kata,kelas, informasi lainya"
          value={value}
          onValueChange={handleValueChange}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Alat Pembelajaran">
            <CommandItem>
              <Brain className="mr-2 h-4 w-4" />
              <span>Latihan Tata Bahasa</span>
            </CommandItem>
            <CommandItem>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Kosa Kata</span>
            </CommandItem>
            <CommandItem>
              <Users className="mr-2 h-4 w-4" />
              <span>Latihan Berbicara</span>
            </CommandItem>
            <CommandItem>
              <Headphones className="mr-2 h-4 w-4" />
              <span>Tes Mendengar</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigasi">
            <CommandItem>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Kelas</span>
            </CommandItem>

            <CommandItem>
              <Search className="mr-2 h-4 w-4" />
              <span>Jelajahi</span>
            </CommandItem>
            <CommandItem>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Kosa Kata</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Aktivitas">
            <CommandItem>
              <Target className="mr-2 h-4 w-4" />
              <span>Latihan Menulis Korea</span>
            </CommandItem>
            <CommandItem>
              <Brain className="mr-2 h-4 w-4" />
              <span>Kuis Kosa Kata</span>
            </CommandItem>
            <CommandItem>
              <Trophy className="mr-2 h-4 w-4" />
              <span>Ulasan Tata Bahasa</span>
            </CommandItem>
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Sesi Berbicara Langsung</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
