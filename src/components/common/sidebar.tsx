import React from "react";
import { Link } from "react-router-dom";
import {
  BoomBox,
  ChevronDown,
  HeartIcon,
  Home,
  List,
  Newspaper,
  NotepadText,
  Pencil,
  Swords,
  Trophy,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth";
import { NavUser } from "./nav-user";

type MenuItem = {
  name: string;
  href?: string;
  icon: React.ElementType;
  color: string;
  subnav?: MenuItem[];
};

const chunithmSubnav: MenuItem[] = [
  {
    name: "Scores",
    href: "/chunithm/scores",
    icon: NotepadText,
    color: "#e0d531",
  },
  {
    name: "Userbox",
    href: "/chunithm/userbox",
    icon: Pencil,
    color: "#e0d531",
  },
  {
    name: "Favorites",
    href: "/chunithm/favorites",
    icon: HeartIcon,
    color: "#e0d531",
  },
  { name: "Rivals", href: "/chunithm/rivals", icon: Swords, color: "#e0d531" },
  {
    name: "Leaderboard",
    href: "/chunithm/leaderboard",
    icon: Trophy,
    color: "#e0d531",
  },
  {
    name: "All Songs",
    href: "/chunithm/allsongs",
    icon: BoomBox,
    color: "#e0d531",
  },
  {
    name: "Rating Frame",
    href: "/chunithm/rating",
    icon: List,
    color: "#e0d531",
  },
];

const ongekiSubnav: MenuItem[] = [
  {
    name: "Scores",
    href: "/ongeki/scores",
    icon: NotepadText,
    color: "#f067e9",
  },
  { name: "Rivals", href: "/ongeki/rivals", icon: Swords, color: "#f067e9" },
  {
    name: "Leaderboard",
    href: "/ongeki/leaderboard",
    icon: Trophy,
    color: "#f067e9",
  },
  {
    name: "All Songs",
    href: "/ongeki/allsongs",
    icon: BoomBox,
    color: "#f067e9",
  },
  {
    name: "Rating Frame",
    href: "/ongeki/rating",
    icon: List,
    color: "#f067e9",
  },
];

const maimaiSubNav: MenuItem[] = [
  {
    name: "Scores",
    href: "/maimaidx/scores",
    icon: NotepadText,
    color: "#1aaeed",
  },
];

const sidebarItems: MenuItem[] = [
  { name: "Home", icon: Home, color: "#6366f1", href: "/overview" },
  { name: "News", icon: Newspaper, color: "#8B5CF6", href: "/news" },
  {
    name: "SEGA",
    icon: ChevronDown,
    color: "#17569b",
    subnav: [
      {
        name: "Chunithm",
        icon: ChevronDown,
        color: "#e0d531",
        subnav: chunithmSubnav,
      },
      {
        name: "Ongeki",
        icon: ChevronDown,
        color: "#f067e9",
        subnav: ongekiSubnav,
      },
      {
        name: "Maimai DX",
        icon: ChevronDown,
        color: "#1aaeed",
        subnav: maimaiSubNav,
      },
    ],
  },
];

export function SidebarComponent() {
  const [openCategories, setOpenCategories] = React.useState<
    Record<string, boolean>
  >(() => {
    const saved = localStorage.getItem('sidebar-open-categories');
    return saved ? JSON.parse(saved) : { SEGA: true };
  });
  const [openSubCategories, setOpenSubCategories] = React.useState<
    Record<string, boolean>
  >(() => {
    const saved = localStorage.getItem('sidebar-open-subcategories');
    return saved ? JSON.parse(saved) : { Chunithm: true, Ongeki: true, "Maimai DX": true };
  });
  const { user } = useAuth();

  // Save to localStorage whenever state changes
  React.useEffect(() => {
    localStorage.setItem('sidebar-open-categories', JSON.stringify(openCategories));
  }, [openCategories]);

  React.useEffect(() => {
    localStorage.setItem('sidebar-open-subcategories', JSON.stringify(openSubCategories));
  }, [openSubCategories]);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const toggleSubCategory = (categoryName: string) => {
    setOpenSubCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  if (!user) return null;

  const userData = {
    username: user.username,
    aimeCardId: user.aimeCardId || "",
    avatar: "",
  };

  const menuButtonClass =
    "text-primary hover:bg-hover cursor-pointer ring-0 data-[state=open]:bg-gray-700 data-[state=open]:text-gray-100";

  const renderMenuItem = (item: MenuItem, isNestedSubmenuItem = false) => {
    const IconComponent = item.icon;

    if (item.href) {
      return (
        <SidebarMenuButton className={menuButtonClass} asChild>
          <Link to={item.href}>
            <IconComponent style={{ color: item.color }} />
            <span>{item.name}</span>
          </Link>
        </SidebarMenuButton>
      );
    } else {
      return (
        <SidebarMenuButton
          className={
            isNestedSubmenuItem
              ? menuButtonClass
              : "text-primary hover:bg-hover data-[state=open]:bg-card data-[state=open]:text-primary cursor-pointer ring-0"
          }
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            if (isNestedSubmenuItem) {
              toggleSubCategory(item.name);
            } else {
              toggleCategory(item.name);
            }
          }}
        >
          <IconComponent style={{ color: item.color }} />
          <span>{item.name}</span>
        </SidebarMenuButton>
      );
    }
  };

  return (
    <Sidebar className="text-primary border-sidebar-border border-r">
      <SidebarHeader className="bg-background px-4 py-4">
        <h2 className="text-primary text-2xl font-extrabold">Cozynet</h2>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  {renderMenuItem(item)}
                  {item.subnav && openCategories[item.name] && (
                    <SidebarMenuSub className="border-none">
                      {item.subnav.map((subItem, subIndex) => (
                        <SidebarMenuItem key={`${index}-${subIndex}`}>
                          {renderMenuItem(subItem, true)}
                          {subItem.subnav &&
                            openSubCategories[subItem.name] && (
                              <SidebarMenuSub className="border-none pl-4">
                                {subItem.subnav.map(
                                  (nestedItem, nestedIndex) => (
                                    <SidebarMenuItem
                                      key={`${index}-${subIndex}-${nestedIndex}`}
                                    >
                                      {renderMenuItem(nestedItem)}
                                    </SidebarMenuItem>
                                  )
                                )}
                              </SidebarMenuSub>
                            )}
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-background border-sidebar-border border-t">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
