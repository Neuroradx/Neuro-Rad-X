
"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  shareUrl?: string; 
  dialogTitle?: string;
  dialogDescription?: string;
  copyButtonText?: string;
  copiedSuccessTitle?: string;
  copiedSuccessDescription?: string;
  copiedErrorTitle?: string;
  copiedErrorDescription?: string;
  qrCodeLabel?: string;
}

const DEFAULT_SHARE_URL = "https://www.neuroradx.de/"; // Updated default URL

export function ShareDialog({
  isOpen,
  onOpenChange,
  shareUrl = DEFAULT_SHARE_URL, // Uses the updated default URL
  dialogTitle = "Share NeuroRadX",
  dialogDescription = "Help spread the word! Share NeuroRadX with your colleagues and friends.",
  copyButtonText = "Copy Link",
  copiedSuccessTitle = "Link Copied!",
  copiedSuccessDescription = "The app link has been copied to your clipboard.",
  copiedErrorTitle = "Copy Failed",
  copiedErrorDescription = "Could not copy link. Please try again or copy manually.",
  qrCodeLabel = "Or scan this code:",
}: ShareDialogProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: copiedSuccessTitle,
        description: copiedSuccessDescription,
        variant: "success",
      });
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); 
    } catch (err) {
      console.error("Failed to copy link: ", err);
      toast({
        title: copiedErrorTitle,
        description: copiedErrorDescription,
        variant: "destructive",
      });
      setIsCopied(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) setIsCopied(false); 
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="share-link" className="sr-only">
              App URL
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="share-link"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button type="button" size="icon" onClick={handleCopyLink} aria-label="Copy link">
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2 pt-2">
            <Label className="text-sm text-muted-foreground">{qrCodeLabel}</Label>
            <div className="p-2 border rounded-md bg-white">
              <QRCodeSVG value={shareUrl} size={128} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} />
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
