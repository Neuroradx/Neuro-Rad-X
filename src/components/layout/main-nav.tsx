
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, ListChecks, Sparkles, TrendingUp, Bookmark, Settings,
  ClipboardCheck, GraduationCap, Layers3, ChevronDown, ChevronRight, NotebookText, Info, Share2, UserCheck, FileWarning, Users, FileEdit, Mail, Bell, UserSearch, FileText, CreditCard, Award,
  type LucideIcon,
  FileCheck,
  ImageIcon,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTranslation } from "@/hooks/use-translation";
import type { NavItem } from "@/lib/constants";


interface MainNavProps {
  items: NavItem[];
  className?: string;
  openShareDialog?: () => void; 
  userRole?: string | null;
}

const iconMap: { [key: string]: LucideIcon } = {
  LayoutDashboard,
  ListChecks,
  Sparkles,
  TrendingUp,
  Bookmark,
  Settings,
  ClipboardCheck,
  GraduationCap,
  Layers3,
  ChevronDown,
  ChevronRight,
  NotebookText, 
  Info, 
  Share2, 
  UserCheck,
  FileWarning,
  Users,
  FileEdit,
  Mail,
  Bell,
  UserSearch,
  FileText,
  CreditCard,
  Award,
  FileCheck,
  ImageIcon,
  LayoutGrid
};

export function MainNav({ items, className, openShareDialog, userRole }: MainNavProps) {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();
  const isSidebarCollapsed = sidebarState === "collapsed";
  const { t } = useTranslation();

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const IconComponent = item.icon ? iconMap[item.icon] : null;
    const isActive = item.exactMatch ? pathname === item.href : (item.href ? pathname.startsWith(item.href) : false);
    const translatedTitle = t(item.title);
    
    const buttonContent = (
      <>
        {IconComponent && <IconComponent className="h-4 w-4" />}
        <span className={cn(isSidebarCollapsed && !isSubItem ? "sr-only" : "")}>{translatedTitle}</span>
      </>
    );

    if (item.action === "openShareDialog" && openShareDialog) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            onClick={openShareDialog}
            className={cn("w-full justify-start", item.customClass)}
            tooltip={isSidebarCollapsed ? translatedTitle : undefined}
          >
            {buttonContent}
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }
    
    if (item.subItems && item.subItems.length > 0) {
      if (isSidebarCollapsed) {
        return (
          <SidebarMenuItem key={item.title}>
             <SidebarMenuButton
                asChild={!isSidebarCollapsed}
                className={cn("justify-start w-full", item.customClass)}
                isActive={isActive}
                tooltip={translatedTitle}
              >
              {isSidebarCollapsed ? (
                <div>{IconComponent && <IconComponent className="h-5 w-5" />}</div>
                 ) : (
                <span className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    {translatedTitle}
                  </div>
                </span>
              )}
            </SidebarMenuButton>
            {/* Collapsed subitems might need a popover or different UX, for now, they are hidden */}
          </SidebarMenuItem>
        );
      }
      return (
        <Accordion type="single" collapsible className="w-full" key={item.title}>
          <AccordionItem value={item.title} className="border-b-0">
            <AccordionTrigger
              className={cn(
                "flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground",
                item.customClass, // Apply custom class to trigger as well if needed for consistent styling, though buttonContent span is primary target
                "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
              )}
            >
              <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className="h-4 w-4" />}
                {translatedTitle}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0 pl-5 pt-1">
              <SidebarMenuSub>
                {item.subItems.map((subItem) => {
                  const SubIconComponent = subItem.icon ? iconMap[subItem.icon] : null;
                  const translatedSubItemTitle = t(subItem.title);
                  return (
                    <SidebarMenuSubItem key={subItem.title}>
                      <Link href={subItem.href || "#"} legacyBehavior passHref>
                        <SidebarMenuSubButton
                          isActive={pathname === subItem.href}
                          className={cn("w-full justify-start", subItem.customClass)} // Apply custom class to sub-button
                        >
                          {SubIconComponent && <SubIconComponent className="h-4 w-4 mr-2" />}
                          {translatedSubItemTitle}
                        </SidebarMenuSubButton>
                      </Link>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <Link href={item.href || "#"} legacyBehavior passHref>
          <SidebarMenuButton
            asChild
            className={cn("w-full justify-start", item.customClass)} // Apply custom class here
            isActive={isActive}
            tooltip={isSidebarCollapsed ? translatedTitle : undefined}
          >
            <a>{buttonContent}</a>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    );
  };

  return (
    <nav className={cn("flex flex-col gap-1 px-2", className)}>
      <SidebarMenu>
        {items.map((item) => {
          // If the item is the admin dashboard, only render if userRole is 'admin'
          if (item.href === "/admin/dashboard" && userRole !== 'admin') {
            return null;
          }
          return renderNavItem(item);
        })}
      </SidebarMenu>
    </nav>
  );
}
