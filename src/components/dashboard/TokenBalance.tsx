import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Gift, Sparkles } from "lucide-react";
import { getTokenBalance, claimFirstLoginBonus, type TokenBalance as TokenBalanceType } from "@/services/tokenService";
import { toast } from "@/hooks/use-toast";

interface TokenBalanceProps {
    userId: string;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ userId }) => {
    const [tokenData, setTokenData] = useState<TokenBalanceType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getTokenBalance(userId);
                setTokenData(data);
            } catch (error: unknown) {
                console.error("Failed to load token balance:", error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [userId]);

    const handleClaimBonus = async () => {
        setIsClaiming(true);
        try {
            const awarded = await claimFirstLoginBonus();
            if (awarded > 0) {
                toast({
                    title: "Welcome Bonus Claimed! 🎉",
                    description: `You've received ${awarded} tokens (worth R${awarded * 10}).`,
                });
                // Refresh balance
                const refreshed = await getTokenBalance(userId);
                setTokenData(refreshed);
            } else {
                toast({
                    title: "Already Claimed",
                    description: "Your welcome bonus has already been credited.",
                });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unexpected error";
            toast({
                title: "Failed to claim bonus",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsClaiming(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-6 text-center text-muted-foreground text-sm">
                    Loading token balance...
                </CardContent>
            </Card>
        );
    }

    const balance = tokenData?.balance ?? 0;
    const lifetimeEarned = tokenData?.lifetime_earned ?? 0;
    const showClaimButton = !tokenData || lifetimeEarned === 0;

    return (
        <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-purple-500/10 pointer-events-none" />
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Coins className="h-5 w-5 text-amber-500" />
                    Kasilam Tokens
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">{balance}</span>
                    <span className="text-sm text-muted-foreground">tokens</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                        = R{(balance * 10).toLocaleString("en-ZA")}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Lifetime: {lifetimeEarned} earned
                    </span>
                </div>

                {showClaimButton && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                        onClick={handleClaimBonus}
                        disabled={isClaiming}
                    >
                        <Gift className="h-4 w-4 mr-2" />
                        {isClaiming ? "Claiming..." : "Claim Welcome Bonus (150 tokens)"}
                    </Button>
                )}

                <p className="text-[11px] text-muted-foreground">
                    1 token = R10 · Earn 10 tokens per R100 spent · Max 25% discount per booking
                </p>
            </CardContent>
        </Card>
    );
};

export default TokenBalance;
