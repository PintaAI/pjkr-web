import {
  Home,
  GraduationCap,

  Frame,
  LifeBuoy,
  Send,
  Edit3,
  Presentation,
  LayoutDashboard,
  Compass,
  Palette,
  BookOpen,
} from "lucide-react"

export interface SidebarUser {
  name: string
  email: string
  avatar: string
}

export interface SidebarNavItem {
  title: string
  url: string
  icon: any
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export interface SidebarProject {
  name: string
  url: string
  icon: any
}

type UserRole = "MURID" | "GURU" | "ADMIN";

export function getSidebarData(userRole?: UserRole) {
  // Base navigation items for all users
  const baseNavItems: SidebarNavItem[] = [
    {
      title: "Kelas",
      url: "/kelas",
      icon: GraduationCap,
      items: [
        {
          title: "Kelas Saya",
          url: "/kelas",
        }
      ],
    },

  ];

  // Role-specific navigation items
  const navMain: SidebarNavItem[] = [];

  // Add role-specific items at the beginning
  if (userRole === "ADMIN" || userRole === "GURU") {
    navMain.push({
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    });
  }

  // Add Home for all users (but especially for MURID as their main page)
  navMain.push({
    title: "Home",
    url: "/home",
    icon: Home,
    isActive: userRole === "MURID",
  });

  // Add Explore section
  navMain.push({
    title: "Explore",
    url: "/explore",
    icon: Compass,
  });

  // Add base navigation items for all users
  navMain.push(...baseNavItems);

  return {
    user: {
      name: "User",
      email: "user@example.com",
      avatar: "/avatar.jpg",
    },
    navMain,
    navSecondary: [
      {
        title: "Apps",
        url: "/apps",
        icon: Frame,
      },
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ] as SidebarNavItem[],
    projects: [
      {
        name: "Documentation",
        url: "/docs",
        icon: BookOpen,
      },
      {
        name: "Editor",
        url: "/editor",
        icon: Edit3,
      },
      {
        name: "Excalidraw",
        url: "/excalidraw",
        icon: Presentation,
      },
      {
        name: "UI Test",
        url: "/ui",
        icon: Frame,
      },
      {
        name: "Generate Color Scheme",
        url: "/color-scheme",
        icon: Palette,
      },
    ] as SidebarProject[],
  };
}

// Backward compatibility - default export for MURID role
export const sidebarData = getSidebarData("MURID");
