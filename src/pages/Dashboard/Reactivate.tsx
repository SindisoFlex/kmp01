
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { reactivateFrozenAccount } from "@/services/accountLifecycleService";
import { REACTIVATION_FEE_RAND } from "@/utils/loyaltyUtils";

const ReactivatePage: React.FC = () => {
    const { user, logout, refreshUser } = useAuth();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleReactivate = async () => {
        setIsProcessing(true);
        try {
            // Replace with real gateway callback reference once payment provider is connected.
            const paymentReference = `manual-reactivation-${Date.now()}`;
            await reactivateFrozenAccount(paymentReference);
            await refreshUser();

            toast({
                title: "Payment Successful!",
                description: "Your account is now active again. Tokens, assets, and booking history are fully restored.",
            });
        } catch (error) {
            toast({
                title: "Reactivation Failed",
                description: "There was an error processing your payment.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="max-w-md w-full border-destructive/20 shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Account Frozen</CardTitle>
                    <CardDescription>
                        Your account has been inactive for more than 24 months.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        To ensure the security and stability of our platform, inactive accounts are frozen.
                        Don't worry, all your galleries, booking history, and tokens are still safe.
                    </p>

                    <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                        <span className="font-semibold">Reactivation Fee</span>
                        <span className="text-2xl font-bold text-primary">R{REACTIVATION_FEE_RAND.toFixed(2)}</span>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button
                        className="w-full h-12 text-lg"
                        onClick={handleReactivate}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <CreditCard className="mr-2 h-5 w-5" />
                        )}
                        Pay & Reactivate
                    </Button>
                    <Button variant="ghost" onClick={logout} className="w-full">
                        Log Out
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ReactivatePage;
