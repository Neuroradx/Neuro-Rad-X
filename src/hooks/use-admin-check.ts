"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Returns admin status from Firebase Auth custom claims, auth user, and loading state.
 * Use in admin layout and settings to avoid duplicating onAuthStateChanged + getIdTokenResult logic.
 * For allowlist-based admin (before set-claims), the client still needs to call GET /api/admin/me
 * (e.g. in login-form); this hook only reads claims from the token.
 */
export function useAdminCheck(): {
  isAdmin: boolean;
  isLoading: boolean;
  user: FirebaseUser | null;
} {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(true);
      if (firebaseUser) {
        try {
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          setIsAdmin(!!tokenResult.claims.admin);
        } catch (error) {
          console.error("Error verifying admin claims:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { isAdmin, isLoading, user };
}
