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
import { Copy, Check, Mail } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// Brand colors for social icons (colorful)
const BRAND_COLORS = {
  x: "#1DA1F2",          // X (Twitter) blue
  linkedin: "#0A66C2",   // LinkedIn blue
  facebook: "#1877F2",    // Facebook blue
  whatsapp: "#25D366",    // WhatsApp green
  email: "#EA4335",       // Gmail red
} as const;

// Social brand icons (inline SVG, colorful)
const IconX = ({ className, color }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill={color ?? "currentColor"} aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const IconLinkedIn = ({ className, color }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill={color ?? "currentColor"} aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const IconFacebook = ({ className, color }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill={color ?? "currentColor"} aria-hidden>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const IconWhatsApp = ({ className, color }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill={color ?? "currentColor"} aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  shareUrl?: string;
  shareTitle?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  copyButtonText?: string;
  copiedSuccessTitle?: string;
  copiedSuccessDescription?: string;
  copiedErrorTitle?: string;
  copiedErrorDescription?: string;
  qrCodeLabel?: string;
  closeButtonText?: string;
  shareVia?: string;
}

const DEFAULT_SHARE_URL = "https://www.neuroradx.com/";
const DEFAULT_SHARE_TITLE = "NeuroRadX – Neuroradiology Learning Platform";

function buildShareLinks(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title} ${url}`);
  return {
    x: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
  };
}

export function ShareDialog({
  isOpen,
  onOpenChange,
  shareUrl = DEFAULT_SHARE_URL,
  shareTitle = DEFAULT_SHARE_TITLE,
  dialogTitle = "Share NeuroRadX",
  dialogDescription = "Help spread the word! Share NeuroRadX with your colleagues and friends.",
  copyButtonText = "Copy Link",
  copiedSuccessTitle = "Link Copied!",
  copiedSuccessDescription = "The app link has been copied to your clipboard.",
  copiedErrorTitle = "Copy Failed",
  copiedErrorDescription = "Could not copy link. Please try again or copy manually.",
  qrCodeLabel = "Or scan this code:",
  closeButtonText = "Close",
  shareVia = "Share via",
}: ShareDialogProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const links = buildShareLinks(shareUrl, shareTitle);

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

  const openShare = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const iconClass = "h-5 w-5 shrink-0";
  const socialButtons = [
    { id: "x", href: links.x, icon: <IconX className={iconClass} color={BRAND_COLORS.x} />, label: "X", hoverClass: "hover:bg-[#0f1419]/10 hover:border-[#0f1419]/30" },
    { id: "linkedin", href: links.linkedin, icon: <IconLinkedIn className={iconClass} color={BRAND_COLORS.linkedin} />, label: "LinkedIn", hoverClass: "hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30" },
    { id: "facebook", href: links.facebook, icon: <IconFacebook className={iconClass} color={BRAND_COLORS.facebook} />, label: "Facebook", hoverClass: "hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30" },
    { id: "whatsapp", href: links.whatsapp, icon: <IconWhatsApp className={iconClass} color={BRAND_COLORS.whatsapp} />, label: "WhatsApp", hoverClass: "hover:bg-[#25D366]/10 hover:border-[#25D366]/30" },
    { id: "email", href: links.email, icon: <Mail className={iconClass} style={{ color: BRAND_COLORS.email }} />, label: "Email", hoverClass: "hover:bg-[#6366f1]/10 hover:border-[#6366f1]/30" },
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) setIsCopied(false);
      }}
    >
      <DialogContent className="sm:max-w-md rounded-2xl gap-0">
        <DialogHeader className="space-y-1.5 pb-2">
          <DialogTitle className="text-xl">{dialogTitle}</DialogTitle>
          <DialogDescription className="text-sm">{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Copy link */}
          <div className="space-y-2">
            <Label htmlFor="share-link" className="sr-only">
              App URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={shareUrl}
                readOnly
                className="flex-1 h-10 rounded-xl bg-muted/50 border-border/80 font-mono text-sm"
              />
              <Button
                type="button"
                size="icon"
                className="h-10 w-10 rounded-xl shrink-0"
                onClick={handleCopyLink}
                aria-label={copyButtonText}
              >
                {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Share via social */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{shareVia}</p>
            <div className="flex flex-wrap gap-2">
              {socialButtons.map(({ id, href, icon, label, hoverClass }) => (
                <Button
                  key={id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`h-10 rounded-xl gap-2 border-border/80 transition-colors ${hoverClass}`}
                  onClick={() => (id === "email" ? (window.location.href = href) : openShare(href))}
                  aria-label={`${shareVia} ${label}`}
                >
                  {icon}
                  <span className="hidden sm:inline text-sm">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* QR code */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <p className="text-sm text-muted-foreground">{qrCodeLabel}</p>
            <div className="inline-flex p-3 rounded-xl border border-border/60 bg-white">
              <QRCodeSVG value={shareUrl} size={120} bgColor="#ffffff" fgColor="#0a0a0a" level="L" />
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end pt-2 border-t border-border/60">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="rounded-xl">
              {closeButtonText}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
