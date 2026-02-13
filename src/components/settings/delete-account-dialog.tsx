
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User as FirebaseUser, reauthenticateWithCredential, EmailAuthProvider, signOut } from "firebase/auth";
import { Loader2, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Alert, AlertTitle as UIAlertTitle , AlertDescription as UIAlertDescription } from "@/components/ui/alert"; 
import { deleteUserAndTheirData } from "@/actions/user-data-actions";


const deleteAccountSchema = z.object({
  confirmationText: z.string(), 
  password: z.string().optional(), 
});

type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function DeleteAccountDialog({ isOpen, onOpenChange }: DeleteAccountDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [requiresReauth, setRequiresReauth] = useState(false);
  const [reauthError, setReauthError] = useState<string | null>(null);

  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmationText: "",
      password: "",
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!isOpen) {
      setRequiresReauth(false);
      setReauthError(null);
      form.reset();
    }
  }, [isOpen, form]);

  const handleDeleteAccount = async (data: DeleteAccountFormValues) => {
    if (!firebaseUser) {
      toast({ title: t('toast.errorTitle'), description: "User not found.", variant: "destructive" });
      return;
    }
    
    const confirmationKeyword = t('settingsPage.deleteAccountDialog.confirmKeyword', { defaultValue: 'DELETE' }).toUpperCase();
    if (data.confirmationText.toUpperCase() !== confirmationKeyword) {
      form.setError("confirmationText", { type: "manual", message: t('toast.invalidConfirmationTextDescriptionDelete') });
      return;
    }

    setIsDeleting(true);
    setReauthError(null);

    try {
      if (requiresReauth) {
        if (!data.password || data.password.length === 0) {
          form.setError("password", { type: "manual", message: "Password is required for re-authentication." });
          setIsDeleting(false);
          return;
        }
        if (!firebaseUser.email) {
            toast({ title: t('toast.errorTitle'), description: "User email not available for re-authentication.", variant: "destructive" });
            setIsDeleting(false);
            return;
        }
        const credential = EmailAuthProvider.credential(firebaseUser.email, data.password);
        await reauthenticateWithCredential(firebaseUser, credential);
        setRequiresReauth(false); 
        form.setValue("password", ""); 
      }

      // Fix: Passing both userId and callerUid (which are the same in this self-service context)
      const result = await deleteUserAndTheirData(firebaseUser.uid, firebaseUser.uid);

      if (result.success) {
          toast({
              title: t('toast.accountDeletedSuccessTitle'),
              description: t('toast.accountDeletedSuccessDescription'),
              variant: "success",
          });
          await signOut(auth);
          onOpenChange(false);
          router.push("/auth/login");
      } else {
          throw new Error(result.message || t('toast.accountDeleteErrorTitle'));
      }
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        setRequiresReauth(true);
        setReauthError(t('toast.reauthNeededDescriptionDelete'));
        toast({
          title: t('toast.reauthNeededTitle'),
          description: t('toast.reauthNeededDescriptionDelete'),
          variant: "destructive",
          duration: 7000,
        });
      } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
         setReauthError("Incorrect password. Please try again.");
         form.setError("password", { type: "manual", message: "Incorrect password." });
      } else {
        console.error("Error deleting account:", error);
        toast({
          title: t('toast.accountDeleteErrorTitle'),
          description: t('toast.accountDeleteErrorDescription', { error: error.message }),
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const translatedConfirmKeyword = t('settingsPage.deleteAccountDialog.confirmKeyword', { defaultValue: 'DELETE' });
  const isConfirmationTextValid = form.watch("confirmationText").toUpperCase() === translatedConfirmKeyword.toUpperCase();
  const isPasswordValidForReauth = !!form.watch("password") && form.watch("password")!.length > 0;


  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
        if (!open) { 
            setRequiresReauth(false);
            setReauthError(null);
            form.reset();
        }
        onOpenChange(open);
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
            {t('settingsPage.deleteAccountDialog.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-semibold text-destructive block">{t('settingsPage.deleteAccountDialog.warning')}</span>
            <span className="mt-2 block">{t('settingsPage.deleteAccountDialog.irreversible')}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={form.handleSubmit(handleDeleteAccount)} className="space-y-4">
          {requiresReauth && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <UIAlertTitle>{t('toast.reauthNeededTitle')}</UIAlertTitle>
              <UIAlertDescription>
                {reauthError || t('toast.reauthNeededDescriptionDelete')}
                <div className="mt-2">
                  <Label htmlFor="password-reauth">{t('settingsPage.deleteAccountDialog.passwordLabel', { defaultValue: 'Password' })}</Label>
                  <Input
                    id="password-reauth"
                    type="password"
                    {...form.register("password")}
                    placeholder={t('settingsPage.deleteAccountDialog.passwordPlaceholder', { defaultValue: 'Enter your password' })}
                    className="mt-1 bg-destructive-foreground/10 placeholder:text-destructive-foreground/50"
                  />
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive-foreground mt-1">{form.formState.errors.password.message}</p>
                  )}
                </div>
              </UIAlertDescription>
            </Alert>
          )}

          <div className="space-y-1">
            <Label htmlFor="confirmationText">
              {t('settingsPage.deleteAccountDialog.confirmLabel', { keyword: translatedConfirmKeyword })}
            </Label>
            <Input
              id="confirmationText"
              {...form.register("confirmationText")}
              placeholder={translatedConfirmKeyword}
              className={form.formState.errors.confirmationText ? "border-destructive focus-visible:ring-destructive" : ""}
              disabled={requiresReauth && !form.formState.errors.password && !reauthError } 
            />
            {form.formState.errors.confirmationText && (
              <p className="text-xs text-destructive">{form.formState.errors.confirmationText.message}</p>
            )}
          </div>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={() => {
              setRequiresReauth(false); 
              setReauthError(null); 
              onOpenChange(false); 
              form.reset(); 
            }} disabled={isDeleting}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive"
              disabled={
                isDeleting ||
                (!requiresReauth && !isConfirmationTextValid) ||
                (requiresReauth && (!isConfirmationTextValid || !isPasswordValidForReauth))
              }
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {requiresReauth ? t('settingsPage.deleteAccountDialog.reauthenticateAndConfirmButton', { defaultValue: 'Re-authenticate & Delete' }) : t('settingsPage.deleteAccountDialog.confirmButton')}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
