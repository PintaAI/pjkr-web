"use client"

import { Command, ChevronLeft } from "lucide-react"
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"

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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">PJKR Platform</span>
                  <span className="truncate text-xs">Learning Management</span>
                </div>
              </a>
            </SidebarMenuButton>
      
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
