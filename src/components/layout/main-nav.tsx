
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
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
        {IconComponent && <IconComponent className="h-[1.125rem] w-[1.125rem] shrink-0" />}
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
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-[1.125rem] font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline transition-colors",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground",
                item.customClass,
                "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
              )}
            >
              <div className="flex items-center gap-2.5">
                {IconComponent && <IconComponent className="h-[1.125rem] w-[1.125rem] shrink-0" />}
                {translatedTitle}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0 pl-6 pt-1.5">
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
                          {SubIconComponent && <SubIconComponent className="h-[1rem] w-[1rem] shrink-0 mr-2 opacity-70" />}
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

  const buildNavGroups = () => {
    const groups: { label?: string; items: NavItem[] }[] = [];
    let currentGroup: { label?: string; items: NavItem[] } = { items: [] };
    for (const item of items) {
      if (item.href === "/admin/dashboard" && userRole !== "admin") continue;
      if (item.groupLabel && item.separator) {
        if (currentGroup.items.length > 0) groups.push(currentGroup);
        currentGroup = { label: item.groupLabel, items: [] };
      } else if (item.title || item.action) {
        currentGroup.items.push(item);
      }
    }
    if (currentGroup.items.length > 0) groups.push(currentGroup);
    return groups;
  };

  const navGroups = buildNavGroups();

  return (
    <nav className={cn("flex flex-col gap-1 px-1 md:px-2", className)}>
      {navGroups.map((group, gIdx) => (
        <SidebarGroup key={group.label ?? `g-${gIdx}`} className={cn("px-2", gIdx > 0 ? "mt-3" : "")}>
          {group.label && (
            <>
              <SidebarGroupLabel className="px-2 py-1.5 text-[1rem] font-semibold uppercase tracking-widest text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
                {t(group.label)}
              </SidebarGroupLabel>
              <SidebarSeparator className="my-1 group-data-[collapsible=icon]:hidden" />
            </>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => renderNavItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </nav>
  );
}
