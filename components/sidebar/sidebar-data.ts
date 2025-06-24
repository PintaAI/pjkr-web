import {
  Home,
  GraduationCap,
  BookOpen,
  FileText,
  Gamepad2,
  Frame,
  LifeBuoy,
  Send,
  Edit3,
  Presentation,
  LayoutDashboard,
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
          title: "Semua Kelas",
          url: "/kelas",
        },
        {
          title: "Materi",
          url: "/kelas/materi",
        },
      ],
    },
    {
      title: "Vocabulary",
      url: "/vocabulary",
      icon: BookOpen,
      items: [
        {
          title: "Practice",
          url: "/vocabulary/practice",
        },
        {
          title: "Categories",
          url: "/vocabulary/categories",
        },
      ],
    },
    {
      title: "Soal & Latihan",
      url: "/soal",
      icon: FileText,
      items: [
        {
          title: "Latihan",
          url: "/soal/latihan",
        },
        {
          title: "Tryout",
          url: "/soal/tryout",
        },
      ],
    },
    {
      title: "Games",
      url: "/game",
      icon: Gamepad2,
      items: [
        {
          title: "Word Puzzle",
          url: "/game/word-puzzle",
        },
        {
          title: "Grammar Quest",
          url: "/game/grammar-quest",
        },
        {
          title: "Speed Reading",
          url: "/game/speed-reading",
        },
        {
          title: "Multiplayer",
          url: "/game/multiplayer",
        },
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
    ] as SidebarProject[],
  };
}

// Backward compatibility - default export for MURID role
export const sidebarData = getSidebarData("MURID");
