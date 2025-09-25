"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Share2, UserMinus, MoreVertical, CheckCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface User {
  name?: string | null | undefined;
}

interface KelasInfo {
  id: number;
  title: string;
  isPaidClass: boolean;
  price: any;
  discount: any;
  promoCode: string | null;
}

interface EnrollmentState {
  isEnrolled: boolean;
  isLoading: boolean;
  error: string | null;
  handleUnenroll: () => void;
  buttonConfig: {
    text: string;
    action: () => void;
    disabled: boolean;
  };
}

interface KelasPricingCardProps {
  kelas: KelasInfo;
  enrollment: EnrollmentState;
  user: User | null;
  isClient: boolean;
  isLoading: boolean;
  onNavigateToLearn: () => void;
}

export default function KelasPricingCard({
  kelas,
  enrollment,
  user,
  isClient,
  isLoading,
  onNavigateToLearn
}: KelasPricingCardProps) {
  
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const formatPrice = (price: any) => {
    if (!price) return "0";
    const numPrice = typeof price === "string" ? parseFloat(price) : Number(price);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(numPrice);
  };

  const calculateDiscountedPrice = () => {
    if (!kelas.price || !kelas.discount) return kelas.price;
    const price = typeof kelas.price === "string" ? parseFloat(kelas.price) : Number(kelas.price);
    const discountPercentage = typeof kelas.discount === "string" ? parseFloat(kelas.discount) : Number(kelas.discount);
    const discountAmount = (price * discountPercentage) / 100;
    return price - discountAmount;
  };

  const getDisplayPrice = () => {
    if (appliedPromoCode && kelas.discount) {
      return calculateDiscountedPrice();
    }
    return kelas.price;
  };

  const getDisplayDiscount = () => {
    if (appliedPromoCode && kelas.discount) {
      return kelas.discount;
    }
    return null;
  };

  const renderPricingDisplay = () => {
    if (kelas.isPaidClass) {
      const displayPrice = getDisplayPrice();
      const discount = getDisplayDiscount();

      return (
        <div className="space-y-1">
          {discount && (
            <div className="text-xs text-muted-foreground line-through">
              {formatPrice(kelas.price)}
            </div>
          )}
          <div className="text-2xl font-bold text-primary">
            {formatPrice(displayPrice)}
          </div>
          {discount && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-secondary/20 text-secondary">
              <span>{discount}% OFF</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary">
        <span className="text-lg font-bold">Gratis ! ! !</span>
      </div>
    );
  };

  const renderPricingDescription = () => {
    return (
      <div className="text-xs text-muted-foreground">
        {kelas.isPaidClass ? "One-time payment" : "Langsung join aja !"}
      </div>
    );
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setIsApplyingPromo(true);
    setPromoError(null);

    try {
      if (kelas.promoCode && promoCode.toUpperCase() === kelas.promoCode.toUpperCase()) {
        setAppliedPromoCode(promoCode.toUpperCase());
        setPromoCode("");
      } else {
        setPromoError("Invalid promo code");
      }
    } catch {
      setPromoError("Failed to apply promo code");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null);
    setPromoError(null);
  };

  const handleShare = async () => {
    const shareData = {
      title: kelas.title,
      text: `Bergabunglah dengan kelas ${kelas.title}!`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link berhasil disalin ke clipboard!");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link berhasil disalin ke clipboard!");
      } catch {
        toast.error("Gagal membagikan atau menyalin link");
      }
    }
  };

  const handleUnenroll = () => {
    enrollment.handleUnenroll();
  };

  return (
    <Card className="lg:w-64 py-0 relative overflow-hidden border-primary">
      {!kelas.isPaidClass && (
        <div className="absolute top-6 right-6 px-6 text-white px-3 py-1 text-xs font-bold transform rotate-45 translate-x-1/2 -translate-y-1/2 shadow-md border-2 bg-primary border-primary">
          GRATIS
        </div>
      )}
      <CardContent className="p-4">
        {enrollment.isEnrolled ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-lg font-bold mb-2 text-primary">
                hai {user?.name || "Murid"}!
              </div>
              <div className="text-xs text-muted-foreground">
                Udah siap belajar?<br /> Ayo mulai belajar sekarang !
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            {renderPricingDisplay()}
            {renderPricingDescription()}
          </div>
        )}

        {/* Promo Code Form */}
        {!enrollment.isEnrolled && kelas.isPaidClass && (
          <div className="space-y-2 pt-2 mt-2 border-t">
            {appliedPromoCode ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-md bg-primary/20 text-primary">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{appliedPromoCode}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePromoCode}
                  className="h-6 w-6 p-0 text-xs text-primary hover:text-primary/80"
                >
                  ×
                </Button>
              </div>
            ) : (
              <div className="flex gap-1">
                <Input
                  placeholder="Punya kode promo?"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                  className="text-xs border-primary focus:border-primary"
                  disabled={isApplyingPromo}
                />
                <Button
                  onClick={handleApplyPromoCode}
                  disabled={isApplyingPromo || !promoCode.trim()}
                  className="text-xs bg-primary hover:bg-primary/90 border-primary"
                >
                  {isApplyingPromo ? "..." : "Apply"}
                </Button>
              </div>
            )}
            {promoError && (
              <div className="text-xs text-destructive">{promoError}</div>
            )}
          </div>
        )}

        {enrollment.isEnrolled ? (
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              className="flex-1 text-primary border-primary hover:bg-primary/10"
              onClick={onNavigateToLearn}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Belajar
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="text-secondary border-secondary hover:bg-secondary/10"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-primary border-primary hover:bg-primary/10"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[99999] !z-[99999]" style={{zIndex: 99999}}>
                <DropdownMenuItem
                  onClick={handleUnenroll}
                  disabled={enrollment.isLoading}
                  className="text-destructive focus:text-destructive"
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  {enrollment.isLoading ? "Loading..." : "Keluar Kelas"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button
            className="w-full mt-3 bg-primary hover:bg-primary/90 border-primary"
            onClick={enrollment.buttonConfig.action}
            disabled={!isClient || enrollment.buttonConfig.disabled}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {!isClient ? "Loading..." :
             isLoading ? "Loading..." :
             enrollment.buttonConfig.text}
          </Button>
        )}
        
        {enrollment.error && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
            {enrollment.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}