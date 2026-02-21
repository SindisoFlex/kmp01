import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTokenHistory, type TokenTransaction } from "@/services/tokenService";
import { ArrowDownLeft, ArrowUpRight, Gift, Settings } from "lucide-react";

interface TokenHistoryProps {
    userId: string;
}

const typeConfig: Record<TokenTransaction["type"], { label: string; icon: React.ReactNode; color: string }> = {
    earn: { label: "Earned", icon: <ArrowDownLeft className="h-3.5 w-3.5" />, color: "text-green-600 bg-green-50" },
    spend: { label: "Spent", icon: <ArrowUpRight className="h-3.5 w-3.5" />, color: "text-red-600 bg-red-50" },
    bonus: { label: "Bonus", icon: <Gift className="h-3.5 w-3.5" />, color: "text-amber-600 bg-amber-50" },
    adjustment: { label: "Adjusted", icon: <Settings className="h-3.5 w-3.5" />, color: "text-blue-600 bg-blue-50" },
};

const TokenHistory: React.FC<TokenHistoryProps> = ({ userId }) => {
    const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const rows = await getTokenHistory(userId);
                setTransactions(rows);
            } catch (error: unknown) {
                console.error("Failed to load token history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [userId]);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-6 text-center text-muted-foreground text-sm">
                    Loading token history...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Token History</CardTitle>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No token activity yet. Claim your welcome bonus or complete a paid booking to start earning!
                    </p>
                ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {transactions.map((tx) => {
                            const cfg = typeConfig[tx.type] || typeConfig.adjustment;
                            const isPositive = tx.amount > 0;
                            return (
                                <div
                                    key={tx.id}
                                    className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors"
                                >
                                    <span className={`flex items-center justify-center h-7 w-7 rounded-full shrink-0 ${cfg.color}`}>
                                        {cfg.icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{tx.description || cfg.label}</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {new Date(tx.created_at).toLocaleDateString("en-ZA", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                    <span className={`text-sm font-semibold tabular-nums ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                        {isPositive ? "+" : ""}{tx.amount}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TokenHistory;
