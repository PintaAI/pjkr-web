"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertTriangle,
  Shield,
  Clock
} from "lucide-react";
import { getKelasDetail } from "@/app/actions/kelas/detail";
import { enrollInKelas } from "@/app/actions/kelas/enrollment";
import { useSession } from "@/hooks/use-session";

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [kelas, setKelas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<"success" | "failed" | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    async function fetchKelas() {
      try {
        const result = await getKelasDetail(id);
        if (result.success && result.data) {
          setKelas(result.data);
        } else {
          // Use setTimeout to avoid setState during render
          setTimeout(() => {
            router.push("/kelas");
          }, 0);
        }
      } catch (error) {
        console.error("Error fetching kelas:", error);
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          router.push("/kelas");
        }, 0);
      } finally {
        setLoading(false);
      }
    }

    if (!sessionLoading) {
      if (!isAuthenticated) {
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          router.push("/auth");
        }, 0);
        return;
      }
      fetchKelas();
    }
  }, [id, router, isAuthenticated, sessionLoading]);

  const calculateDiscountedPrice = () => {
    if (!kelas?.price) return kelas?.price || 0;
    
    let price = typeof kelas.price === "string" ? parseFloat(kelas.price) : Number(kelas.price);
    
    // Apply class discount (percentage)
    if (kelas?.discount) {
      const discountPercentage = typeof kelas.discount === "string" ? parseFloat(kelas.discount) : Number(kelas.discount);
      const discountAmount = (price * discountPercentage) / 100;
      price -= discountAmount;
    }
    
    return price;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  const handlePayment = async () => {
    setProcessing(true);
    setCountdown(3);

    // Simulate payment processing with countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          processPayment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const processPayment = async () => {
    try {
      // Simulate payment gateway response
      const paymentSuccess = !simulateFailure;
      
      if (paymentSuccess) {
        // Use setTimeout to avoid setState during render phase
        setTimeout(async () => {
          try {
            // If payment successful, enroll user in class (bypass payment check since we're coming from payment)
            const enrollResult = await enrollInKelas(parseInt(id), true);
            
            if (enrollResult.success) {
              setPaymentResult("success");
              // Redirect to class after 3 seconds
              setTimeout(() => {
                router.push(`/kelas/${id}`);
              }, 3000);
            } else {
              console.error("Enrollment failed after payment:", enrollResult.error);
              setPaymentResult("failed");
            }
          } catch (error) {
            console.error("Enrollment error:", error);
            setPaymentResult("failed");
          } finally {
            setProcessing(false);
          }
        }, 0);
      } else {
        setPaymentResult("failed");
        setProcessing(false);
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      setPaymentResult("failed");
      setProcessing(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleRetry = () => {
    setPaymentResult(null);
    setProcessing(false);
    setCountdown(0);
  };

  if (loading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!kelas) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Class Not Found</h1>
          <Button onClick={() => router.push("/kelas")}>
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Payment Gateway</h1>
            <p className="text-muted-foreground">Mock Payment Processing</p>
          </div>
        </div>

        {/* Payment Result */}
        {paymentResult && (
          <Card className="mb-6">
            <CardContent className="p-6">
              {paymentResult === "success" ? (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-green-700">Payment Successful!</h3>
                    <p className="text-muted-foreground">
                      You have been enrolled in {kelas.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Redirecting to class page in 3 seconds...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-red-700">Payment Failed</h3>
                    <p className="text-muted-foreground">
                      {simulateFailure
                        ? "Payment simulation was set to fail"
                        : "There was an issue processing your payment"}
                    </p>
                  </div>
                  <Button onClick={handleRetry} variant="outline">
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        {!paymentResult && (
          <>
            {/* Class Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{kelas.title}</h3>
                  <p className="text-sm text-muted-foreground">{kelas.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{kelas.level}</Badge>
                    <Badge variant="outline">{kelas.type}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Class Price</span>
                    <span>{formatPrice(kelas.price || 0)}</span>
                  </div>
                  {kelas.discount && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({kelas.discount}%)</span>
                      <span>-{formatPrice((typeof kelas.price === "string" ? parseFloat(kelas.price) : Number(kelas.price)) * (typeof kelas.discount === "string" ? parseFloat(kelas.discount) : Number(kelas.discount)) / 100)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(calculateDiscountedPrice())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mock Payment Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Mock Payment Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="simulate-failure"
                    checked={simulateFailure}
                    onCheckedChange={setSimulateFailure}
                    disabled={processing}
                  />
                  <Label htmlFor="simulate-failure">
                    Simulate Payment Failure
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Toggle this to test payment failure scenarios
                </p>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This is a mock payment gateway for testing purposes. 
                    No real payment will be processed.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Cardholder Name</Label>
                    <div className="mt-1 p-3 border rounded-md bg-muted/30">
                      {user?.name || "John Doe"}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Card Number</Label>
                    <div className="mt-1 p-3 border rounded-md bg-muted/30">
                      **** **** **** 1234
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Expiry Date</Label>
                      <div className="mt-1 p-3 border rounded-md bg-muted/30">
                        12/25
                      </div>
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <div className="mt-1 p-3 border rounded-md bg-muted/30">
                        ***
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {countdown > 0 ? (
                        <>Processing Payment... ({countdown}s)</>
                      ) : (
                        "Processing Payment..."
                      )}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay {formatPrice(calculateDiscountedPrice())}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Security Info */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>This is a mock payment gateway for development and testing purposes.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
