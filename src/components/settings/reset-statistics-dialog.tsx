"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
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
import { onAuthStateChanged, type User as FirebaseUser, type Unsubscribe } from "firebase/auth";
import { Loader2, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { resetUserStatistics } from "@/actions/user-data-actions";

const resetStatisticsSchema = z.object({
  confirmationText: z.string(),
});

type ResetStatisticsFormValues = z.infer<typeof resetStatisticsSchema>;

interface ResetStatisticsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentUser: FirebaseUser | null; // Prop from parent
}

export function ResetStatisticsDialog({ isOpen, onOpenChange, currentUser: initialCurrentUser }: ResetStatisticsDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  const [dialogAuthUser, setDialogAuthUser] = useState<FirebaseUser | null>(initialCurrentUser);

  const form = useForm<ResetStatisticsFormValues>({
    resolver: zodResolver(resetStatisticsSchema),
    defaultValues: {
      confirmationText: "",
    },
  });

  useEffect(() => {
    // Sync with prop when it changes (e.g., on dialog open)
    setDialogAuthUser(initialCurrentUser);
  }, [initialCurrentUser]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    if (isOpen) {
      // Listen for auth state changes while the dialog is open
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setDialogAuthUser(user);
      });
    } else {
      form.reset(); // Reset form when dialog closes
      // No need to explicitly setDialogAuthUser to initialCurrentUser here,
      // as the other useEffect will handle it when isOpen becomes true again.
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isOpen, form]);


  const handleResetStatistics = async (data: ResetStatisticsFormValues) => {
    setIsResetting(true);
    const freshCurrentUser = auth.currentUser; // Final check with the most current auth state

    if (!freshCurrentUser || freshCurrentUser.isAnonymous) {
      toast({
        title: t('toast.errorTitle'),
        description: t('toast.statsResetErrorUserNotAuth'),
        variant: "destructive"
      });
      setIsResetting(false);
      return;
    }

    const confirmationKeyword = t('settingsPage.resetStatisticsDialog.confirmKeyword', { defaultValue: 'RESET' }).toUpperCase();
            if (data.confirmationText.toUpperCase() !== confirmationKeyword) {
      form.setError("confirmationText", { type: "manual", message: t('toast.statsResetInvalidConfirmationDesc') });
      setIsResetting(false);
      return;
    }

    try {
      const result = await resetUserStatistics(freshCurrentUser.uid);

      if (result.success) {
        toast({
          title: t('toast.statsResetSuccessTitle'),
          description: t('toast.statsResetSuccessDesc') + " Your progress page and dashboard will reflect these changes upon next load.",
          variant: "success",
          duration: 7000,
        });
        onOpenChange(false);
      } else {
        toast({
          title: t('toast.statsResetErrorTitle'),
          description: t('toast.statsResetErrorDesc', { error: result.message || "Unknown error" }),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error calling resetUserStatistics action:", error);
      toast({
        title: t('toast.statsResetErrorTitle'),
        description: t('toast.statsResetErrorDesc', { error: error.message || "An unexpected error occurred." }),
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const translatedConfirmKeyword = t('settingsPage.resetStatisticsDialog.confirmKeyword', { defaultValue: 'RESET' });
  const isConfirmationTextValid = form.watch("confirmationText").toUpperCase() === translatedConfirmKeyword.toUpperCase();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-orange-500 dark:text-orange-400" />
            {t('settingsPage.resetStatisticsDialog.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-semibold text-orange-600 dark:text-orange-400 block">{t('settingsPage.resetStatisticsDialog.warning')}</span>
            <span className="mt-2 block">{t('settingsPage.resetStatisticsDialog.irreversible')}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={form.handleSubmit(handleResetStatistics)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="resetConfirmationText">
              {t('settingsPage.resetStatisticsDialog.confirmLabel', { keyword: translatedConfirmKeyword })}
            </Label>
            <Input
              id="resetConfirmationText"
              {...form.register("confirmationText")}
              placeholder={t('settingsPage.resetStatisticsDialog.confirmPlaceholder', {defaultValue: translatedConfirmKeyword})}
              className={form.formState.errors.confirmationText ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {form.formState.errors.confirmationText && (
              <p className="text-xs text-destructive">{form.formState.errors.confirmationText.message}</p>
            )}
          </div>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={() => onOpenChange(false)} disabled={isResetting}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive"
              className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
              disabled={isResetting || !isConfirmationTextValid || !dialogAuthUser || dialogAuthUser.isAnonymous}
            >
              {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('settingsPage.resetStatisticsDialog.confirmButton')}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
