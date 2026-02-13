
"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { MainNav } from "@/components/layout/main-nav";
import { NAV_ITEMS, ADMIN_DASHBOARD_NAV_ITEM, SETTINGS_NAV_ITEM, type NavItem } from "@/lib/constants";
import { UserNav } from "@/components/layout/user-nav";
import { Logo } from "@/components/common/logo";
import { ShareDialog } from "@/components/common/share-dialog";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { useTranslation } from "@/hooks/use-translation";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeToggle } from "@/components/common/theme-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const openShareDialog = () => setIsShareDialogOpen(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserRole(docSnap.data()?.role || 'user');
        } else {
          setUserRole('user');
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const shareDialogTexts = {
    dialogTitle: t('shareDialog.title'),
    dialogDescription: t('shareDialog.description'),
    copyButtonText: t('shareDialog.copyButtonText'),
    copiedSuccessTitle: t('shareDialog.copiedSuccessTitle'),
    copiedSuccessDescription: t('shareDialog.copiedSuccessDescription'),
    copiedErrorTitle: t('shareDialog.copiedErrorTitle'),
    copiedErrorDescription: t('shareDialog.copiedErrorDescription'),
    qrCodeLabel: t('shareDialog.qrCodeLabel'),
  };

  const navItemsWithAdmin = userRole === 'admin' ? [ADMIN_DASHBOARD_NAV_ITEM, ...NAV_ITEMS] : NAV_ITEMS;
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <MainNav items={navItemsWithAdmin} openShareDialog={openShareDialog} userRole={userRole} />
        </SidebarContent>
        <SidebarFooter>
          <MainNav items={[SETTINGS_NAV_ITEM]} userRole={userRole} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex items-center gap-2 ml-auto">
             <LanguageSwitcher />
             <ThemeToggle />
             <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
      <ShareDialog 
        isOpen={isShareDialogOpen} 
        onOpenChange={setIsShareDialogOpen}
        {...shareDialogTexts}
      />
    </SidebarProvider>
  );
}
