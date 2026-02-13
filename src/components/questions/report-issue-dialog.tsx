
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase"; // Import db
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // Import Firestore functions
import { useTranslation } from "@/hooks/use-translation";

interface ReportIssueDialogProps {
  questionId: string;
  questionStem: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const getReportIssueSchema = (t: (key: string) => string) => z.object({
  problemType: z.string().min(1, t('reportIssueDialog.validation.problemTypeRequired')),
  description: z.string()
    .min(10, t('reportIssueDialog.validation.descriptionMinLength'))
    .max(1000, t('reportIssueDialog.validation.descriptionMaxLength')),
  userEmail: z.string().email(t('reportIssueDialog.validation.emailInvalid')).optional().or(z.literal("")),
});

type ReportIssueFormValues = z.infer<ReturnType<typeof getReportIssueSchema>>;

const problemTypesKeys = [
  "reportIssueDialog.problemTypes.typoGrammar",
  "reportIssueDialog.problemTypes.confusingQuestion",
  "reportIssueDialog.problemTypes.correctAnswerIncorrect",
  "reportIssueDialog.problemTypes.optionsIncorrect",
  "reportIssueDialog.problemTypes.mediaProblem",
  "reportIssueDialog.problemTypes.displayFormatIssue",
  "reportIssueDialog.problemTypes.explanationIncorrect",
  "reportIssueDialog.problemTypes.other",
];

const APP_VERSION = "1.0.0"; // Placeholder for app version

export function ReportIssueDialog({ questionId, questionStem, isOpen, onOpenChange }: ReportIssueDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportIssueSchema = getReportIssueSchema(t);

  const form = useForm<ReportIssueFormValues>({
    resolver: zodResolver(reportIssueSchema),
    defaultValues: {
      problemType: "",
      description: "",
      userEmail: "",
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && !form.getValues("userEmail")) {
        form.setValue("userEmail", user.email || "");
      }
    });
    return () => unsubscribe();
  }, [form]);

  const onSubmit = async (data: ReportIssueFormValues) => {
    setIsSubmitting(true);
    const reportData = {
      questionId,
      questionStem,
      problemType: data.problemType, 
      description: data.description,
      userProvidedEmail: data.userEmail || null,
      userId: firebaseUser?.uid || "anonymous",
      userEmailFromAuth: firebaseUser?.email || "anonymous",
      reporterDisplayName: firebaseUser?.displayName || (firebaseUser?.isAnonymous ? "Anonymous" : "N/A"),
      timestamp: serverTimestamp(),
      appVersion: APP_VERSION,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      status: "new" as const, 
    };

    try {
      await addDoc(collection(db, "issueReports"), reportData);
      toast({
        title: t('reportIssueDialog.toast.reportSuccessTitle'),
        description: t('reportIssueDialog.toast.reportSuccessDescription'),
        variant: "success",
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting issue report:", error);
      toast({
        title: t('reportIssueDialog.toast.reportErrorTitle'),
        description: t('reportIssueDialog.toast.reportErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmailFieldDisabled = !!(firebaseUser && firebaseUser.email && !firebaseUser.isAnonymous);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) form.reset();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('reportIssueDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('reportIssueDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('reportIssueDialog.questionStemLabel')}:</p>
            <p className="text-sm text-muted-foreground border p-2 rounded-md max-h-24 overflow-y-auto">{questionStem}</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="problemType">{t('reportIssueDialog.problemTypeLabel')}</Label>
            <Controller
              name="problemType"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="problemType">
                    <SelectValue placeholder={t('reportIssueDialog.problemTypePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {problemTypesKeys.map((typeKey) => (
                      <SelectItem key={typeKey} value={typeKey}>
                        {t(typeKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.problemType && (
              <p className="text-xs text-destructive">{form.formState.errors.problemType.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">{t('reportIssueDialog.descriptionLabel')}</Label>
            <Textarea
              id="description"
              placeholder={t('reportIssueDialog.descriptionPlaceholder')}
              {...form.register("description")}
              rows={4}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="userEmail">{t('reportIssueDialog.userEmailLabel')}</Label>
            <Input
              id="userEmail"
              type="email"
              placeholder={t('reportIssueDialog.userEmailPlaceholder')}
              {...form.register("userEmail")}
              disabled={isEmailFieldDisabled}
              className={isEmailFieldDisabled ? "bg-muted/50 cursor-not-allowed" : ""}
            />
             {form.formState.errors.userEmail && (
              <p className="text-xs text-destructive">{form.formState.errors.userEmail.message}</p>
            )}
          </div>
        
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('reportIssueDialog.submitButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    