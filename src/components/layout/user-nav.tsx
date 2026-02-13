
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogOut, Settings, UserCircle, LogIn, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-translation";


export function UserNav() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/auth/login"); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <Skeleton className="h-9 w-9 rounded-full" />
    );
  }

  if (!currentUser) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <UserCircle className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuItem asChild>
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              <span>{t('userNav.logIn')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/auth/register">
              <UserPlus className="mr-2 h-4 w-4" />
              <span>{t('userNav.register')}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const displayName = currentUser.displayName;
  const email = currentUser.email;
  const photoURL = currentUser.photoURL;
  const isAnonymous = currentUser.isAnonymous;

  let fallbackInitials = "U"; // Default fallback

  if (!isAnonymous) {
    if (displayName) {
      const nameParts = displayName.trim().split(/\s+/); // Split by one or more spaces
      const firstNameInitial = nameParts[0]?.[0] || "";
      const lastNameInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || "" : "";
      
      let combined = firstNameInitial;
      if (lastNameInitial) { // Only add last name initial if there was more than one name part
        combined += lastNameInitial;
      }
      
      if (combined) {
        fallbackInitials = combined.toUpperCase();
      } else if (email) { // Fallback to email initial if display name parsing yields no initials
        fallbackInitials = email[0].toUpperCase();
      }
      // If still "U", it's fine as a last resort if displayName was empty/weird and no email
    } else if (email) {
      fallbackInitials = email[0].toUpperCase();
    }
  }
  // For anonymous users, AvatarFallback will show the UserCircle icon, so fallbackInitials isn't directly used for them.


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            {photoURL && !isAnonymous ? (
              <AvatarImage src={photoURL} alt={displayName || "User"} data-ai-hint="profile avatar" />
            ) : null}
            <AvatarFallback>
              {isAnonymous ? <UserCircle className="h-5 w-5" /> : fallbackInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {isAnonymous ? t('userNav.guestUser') : displayName || "User"}
            </p>
            {!isAnonymous && email && (
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isAnonymous && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>{t('userNav.logIn')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>{t('userNav.register')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {!isAnonymous && (
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('userNav.settings')}</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('userNav.logOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

    
