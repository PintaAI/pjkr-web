"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "./use-session";
import { enrollInKelas, unenrollFromKelas, checkEnrollmentStatus, redirectToPayment } from "@/app/actions/kelas/enrollment";

interface EnrollmentState {
  isEnrolled: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthor: boolean;
  isPaidClass: boolean;
  price: number | null;
  discount: number | null;
}

export function useKelasEnrollment(kelasId: number) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: sessionLoading } = useSession();
  
  const [state, setState] = useState<EnrollmentState>({
    isEnrolled: false,
    isLoading: false,
    error: null,
    isAuthor: false,
    isPaidClass: false,
    price: null,
    discount: null,
  });

  // Check enrollment status
  const checkStatus = useCallback(async () => {
    if (!isAuthenticated || sessionLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await checkEnrollmentStatus(kelasId);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          isEnrolled: result.isEnrolled || false,
          isAuthor: result.isAuthor || false,
          isPaidClass: result.isPaidClass || false,
          price: result.price ?? null,
          discount: result.discount ?? null,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || "Failed to check enrollment status",
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to check enrollment status",
        isLoading: false,
      }));
    }
  }, [kelasId, isAuthenticated, sessionLoading]);

  // Check enrollment status on mount
  useEffect(() => {
    if (isAuthenticated && !sessionLoading) {
      checkStatus();
    }
  }, [isAuthenticated, sessionLoading, checkStatus]);

  // Handle enrollment
  const handleEnroll = useCallback(async () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await enrollInKelas(kelasId);

      if (result.success) {
        setState(prev => ({
          ...prev,
          isEnrolled: true,
          isLoading: false,
        }));
        
        // Show success message
        toast.success(result.message || "Successfully enrolled in class");
        
        // Refresh the page to update enrollment status
        router.refresh();
      } else if (result.requiresPayment) {
        // Redirect to payment page for paid classes
        setState(prev => ({ ...prev, isLoading: false }));
        router.push(result.paymentUrl || `/payment/kelas/${kelasId}`);
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || "Failed to enroll",
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to enroll in class",
        isLoading: false,
      }));
    }
  }, [kelasId, isAuthenticated, router]);

  // Handle unenrollment
  const handleUnenroll = useCallback(async () => {
    if (!isAuthenticated) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await unenrollFromKelas(kelasId);

      if (result.success) {
        setState(prev => ({
          ...prev,
          isEnrolled: false,
          isLoading: false,
        }));
        
        // Show success message
        toast.success(result.message || "Successfully unenrolled from class");
        
        // Refresh the page to update enrollment status
        router.refresh();
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || "Failed to unenroll",
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to unenroll from class",
        isLoading: false,
      }));
    }
  }, [kelasId, isAuthenticated, router]);

  // Handle manage class (for authors)
  const handleManage = useCallback(() => {
    router.push(`/dashboard/guru/kelas-builder?edit=${kelasId}`);
  }, [kelasId, router]);

  // Get button text and action based on user role and enrollment status
  const getButtonConfig = useCallback(() => {
    if (!isAuthenticated || sessionLoading) {
      return {
        text: "Loading...",
        action: () => {},
        disabled: true,
      };
    }

    if (state.isAuthor) {
      return {
        text: "Manage",
        action: handleManage,
        disabled: false,
      };
    }

    if (state.isEnrolled) {
      return {
        text: "Unenroll",
        action: handleUnenroll,
        disabled: state.isLoading,
      };
    }

    return {
      text: state.isPaidClass ? "Enroll" : "Join",
      action: handleEnroll,
      disabled: state.isLoading,
    };
  }, [
    isAuthenticated,
    sessionLoading,
    state.isAuthor,
    state.isEnrolled,
    state.isPaidClass,
    state.isLoading,
    handleManage,
    handleUnenroll,
    handleEnroll,
  ]);

  // Calculate discounted price
  const calculateDiscountedPrice = useCallback(() => {
    if (!state.price || !state.discount) return state.price;
    return state.price - state.discount;
  }, [state.price, state.discount]);

  return {
    // State
    ...state,
    isSessionLoading: sessionLoading,
    
    // Actions
    checkStatus,
    handleEnroll,
    handleUnenroll,
    handleManage,
    
    // Button configuration
    buttonConfig: getButtonConfig(),
    
    // Computed values
    discountedPrice: calculateDiscountedPrice(),
    
    // User info
    user,
    isAuthenticated,
  };
}