
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Award, BriefcaseBusiness, Calendar, ChevronRight, User } from "lucide-react";
import TokenBalance from "@/components/dashboard/TokenBalance";
import TokenHistory from "@/components/dashboard/TokenHistory";
import { LoyaltyTier } from "@/types/loyalty";
import { getLoyaltyState } from "@/services/loyaltyService";
import { formatCurrency } from "@/utils/formatting";

const INDIVIDUAL_THRESHOLDS = { bronze: 1, silver: 3, gold: 5 };
const CORPORATE_THRESHOLDS = { bronze: 50000, silver: 100000, gold: 200000 };

const tierLabel = (tier: LoyaltyTier) => (tier === "none" ? "Free" : tier.charAt(0).toUpperCase() + tier.slice(1));
const toSafeNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const DashboardIndex: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [loyalty, setLoyalty] = React.useState(user?.loyaltyState || null);
  const [loyaltyError, setLoyaltyError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const userId = user?.id;

    const load = async () => {
      if (!userId) {
        setLoyalty(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoyaltyError(null);

      try {
        const data = await getLoyaltyState(userId);
        setLoyalty(data);
      } catch (error: unknown) {
        const isMissingTableError =
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === "42P01";

        if (!isMissingTableError) {
          console.error("Failed to load loyalty state:", error);
          const message = error instanceof Error ? error.message : "Unable to load loyalty status.";
          setLoyaltyError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Unavailable</CardTitle>
            <CardDescription>Please sign in to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const individualBookings = loyalty?.individual_completed_bookings || 0;
  const individualTier = (loyalty?.individual_tier as LoyaltyTier) || "none";
  const individualSpend = toSafeNumber(loyalty?.individual_total_spend);

  const nextIndividualTarget =
    individualBookings < INDIVIDUAL_THRESHOLDS.bronze
      ? INDIVIDUAL_THRESHOLDS.bronze
      : individualBookings < INDIVIDUAL_THRESHOLDS.silver
        ? INDIVIDUAL_THRESHOLDS.silver
        : INDIVIDUAL_THRESHOLDS.gold;

  const individualProgress = Math.min(100, (individualBookings / INDIVIDUAL_THRESHOLDS.gold) * 100);
  const corporateSpend = toSafeNumber(loyalty?.corporate_eligible_spend);
  const corporateTier = (loyalty?.corporate_tier as LoyaltyTier) || "none";
  const corporateTarget =
    corporateSpend < CORPORATE_THRESHOLDS.bronze
      ? CORPORATE_THRESHOLDS.bronze
      : corporateSpend < CORPORATE_THRESHOLDS.silver
        ? CORPORATE_THRESHOLDS.silver
        : CORPORATE_THRESHOLDS.gold;

  const corporateProgress = Math.min(100, (corporateSpend / CORPORATE_THRESHOLDS.gold) * 100);

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Welcome back, {user.name?.split(" ")[0] || "there"}!</h1>
        <p className="text-muted-foreground">Manage your bookings, loyalty rewards, and professional profile.</p>
        {loyaltyError && (
          <p className="text-xs text-red-600 mt-2">
            Loyalty status is temporarily unavailable. Some totals may be delayed. ({loyaltyError})
          </p>
        )}
      </div>

      {/* Account status warning banner */}
      {user.accountStatus && user.accountStatus !== "active" && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300">
              {user.accountStatus === "frozen"
                ? "Your account has been frozen due to inactivity."
                : `Account status: ${user.accountStatus}`}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              To restore full access, please pay the R300 reactivation fee. Your tokens and gallery data are preserved.
            </p>
            <Button size="sm" variant="outline" className="mt-2 border-amber-400 text-amber-700" asChild>
              <Link to="/dashboard/reactivate">Reactivate Account</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Individual Loyalty</CardTitle>
              <CardDescription>Tier based on completed bookings</CardDescription>
            </div>
            <Award className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{tierLabel(individualTier as LoyaltyTier)}</div>
            <div className="text-sm text-muted-foreground mb-2">
              {individualBookings} completed bookings | {formatCurrency(individualSpend, "ZAR")}
            </div>
            <Progress value={individualProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {individualBookings >= INDIVIDUAL_THRESHOLDS.gold
                ? "Gold tier reached"
                : `${Math.max(0, nextIndividualTarget - individualBookings)} bookings to next tier`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">My Profile</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </div>
            <User className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium truncate">{user.name}</div>
            <p className="text-xs text-muted-foreground mb-4">{user.email}</p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/dashboard/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">Corporate Loyalty</CardTitle>
              <CardDescription>Webdev + marketing spend tier</CardDescription>
            </div>
            <BriefcaseBusiness className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {!user.isBusinessAccount ? (
              <>
                <div className="text-sm text-muted-foreground">Business account required for this track.</div>
                <Button variant="link" className="p-0 mt-2" asChild>
                  <Link to="/dashboard/profile">Update account type</Link>
                </Button>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold capitalize">{tierLabel(corporateTier as LoyaltyTier)}</div>
                <div className="text-sm text-muted-foreground mb-2">Eligible spend: {formatCurrency(corporateSpend, "ZAR")}</div>
                <Progress value={corporateProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {corporateSpend >= CORPORATE_THRESHOLDS.gold
                    ? "Gold tier reached"
                    : `${formatCurrency(Math.max(0, corporateTarget - corporateSpend), "ZAR")} to next tier`}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Token Economy */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <TokenBalance userId={user.id} />
        <TokenHistory userId={user.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription>Continue with your most common account actions</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button asChild>
            <Link to="/dashboard/booking/new">
              <Calendar className="h-4 w-4 mr-2" />
              New Booking
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/membership">
              <Award className="h-4 w-4 mr-2" />
              Membership Benefits
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard/bookings">
              <Calendar className="h-4 w-4 mr-2" />
              Booking History
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <p className="text-xs text-muted-foreground mt-3">Refreshing loyalty status...</p>
      )}
    </div>
  );
};

export default DashboardIndex;
