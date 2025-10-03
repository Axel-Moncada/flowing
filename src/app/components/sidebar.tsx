import React from "react";
import {
  Calendar,
  ChevronUp,
  Home,
  Inbox,
  Search,
  Settings,
  User2,
} from "lucide-react";
import logo from "@/app/assets/images/isologo.png";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

interface SidebarProps {
  user: any;
  fullName?: string | null;
  avatarUrl?: string | null;
  userId?: string;
}

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export const SidebarNav = ({ user }: SidebarProps) => {
  return (
    <Sidebar collapsible="icon" className="group-data-[collapsible=icon]:w-20">
      <SidebarContent className="bg-gris text-crema flex flex-col h-screen">
        {/* Navegación - 90% */}
        <div className="flex-1 overflow-y-auto justify-center flex">
          <SidebarGroup>
            <SidebarGroupContent>
              <img
                src={logo.src}
                alt="Logo"
                className="w-3/4  p-5 mx-auto mt-10 group-data-[collapsible=icon]:w-3/4 group-data-[collapsible=icon]:p-0"
              />
              <SidebarMenu className="text-crema mt-20 group-data-[collapsible=icon]:mt-10">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 p-5 w-full hover:bg-verde hover:text-gris rounded-lg transition-colors my-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3 group-data-[collapsible=icon]:mx-auto "
                      >
                        <item.icon className="w-10 h-10 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6" />
                        <span className="text-lg font-medium group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Avatar y usuario - 10% abajo */}
        <div className="h-[10%] min-h-[80px] border-t border-crema/20 p-4 group-data-[collapsible=icon]:p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center cursor-pointer hover:bg-verde/20 rounded-lg p-2 transition-colors">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full border-2 border-verde object-cover group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-verde/20 flex items-center justify-center border-2 border-verde group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10">
                    <span className="text-sm font-bold text-verde group-data-[collapsible=icon]:text-xs">
                      {user?.user_metadata?.full_name?.charAt(0) ||
                        user?.email?.charAt(0) ||
                        "U"}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                  <p className="text-sm font-medium text-crema truncate">
                    {user?.user_metadata?.full_name || "Usuario"}
                  </p>
                  <p className="text-xs text-crema/70 truncate">{user?.email}</p>
                </div>
                <ChevronUp className="ml-auto group-data-[collapsible=icon]:hidden" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              className="w-56 bg-gris border border-crema/20 rounded-lg p-2"
            >
              <DropdownMenuItem className="text-crema hover:bg-verde hover:text-gris rounded p-2 cursor-pointer font-medium">
                <Link href="/profile" className="flex items-center w-full">
                  <span>Mi cuenta</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="text-crema hover:bg-verde hover:text-gris rounded p-2 cursor-pointer font-medium">
                <Link href="/login" className="flex items-center w-full">
                  <span>Cerrar sesión</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
