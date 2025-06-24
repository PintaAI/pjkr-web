"use client"

import { useMemo } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { AppSidebarHeader } from "./sidebar-header"
import { SidebarNav } from "./sidebar-nav"
import { SidebarDevTools } from "./sidebar-devtools"
import { AppSidebarFooter } from "./sidebar-footer"
import { getSidebarData } from "./sidebar-data"
import { useSessionContext } from "@/components/session-provider"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session?: ReturnType<typeof import("@/lib/hooks/use-session").useSession>
}

export function AppSidebar({ session: passedSession, ...props }: AppSidebarProps) {
  const contextSession = useSessionContext()
  const session = passedSession || contextSession
  const { user } = session
  const sidebarData = useMemo(() => getSidebarData(user?.role), [user?.role])

  return (
    <Sidebar collapsible="icon" {...props}>
      <AppSidebarHeader />
      <SidebarContent className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center">
        <SidebarNav items={sidebarData.navMain} title="Apps" />
        <SidebarDevTools projects={sidebarData.projects} session={session} />
      </SidebarContent>
      <AppSidebarFooter session={session} />
      <SidebarRail />
    </Sidebar>
  )
}
