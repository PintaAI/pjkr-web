"use client"

import { Command, ChevronLeft } from "lucide-react"
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { useTheme } from "next-themes"

export function AppSidebarHeader() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2  py-1.5">
            <SidebarMenuButton 
              size="lg" 
              asChild 
              className="group-data-[collapsible=icon]:w-fit group-data-[collapsible=icon]:justify-center"
            >
              <a href="/" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/logo/hakgyo-light.png"
                    alt="Hakgyo Logo"
                    width={32}
                    height={32}
                    className="dark:hidden"
                  />
                  <Image
                    src="/logo/hakgyo-dark.png"
                    alt="Hakgyo Logo"
                    width={32}
                    height={32}
                    className="hidden dark:block"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">Hakgyo</span>
                  <span className="truncate text-xs">Learning Platform</span>
                </div>
              </a>
            </SidebarMenuButton>
      
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
