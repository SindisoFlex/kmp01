
-- Loyalty Lifecycle Automation: Inactivity Freezing & Tier Downgrades
-- To be run daily (e.g., via pg_cron or Edge Function)

CREATE OR REPLACE FUNCTION handle_loyalty_lifecycle() RETURNS VOID AS $$
BEGIN
    -- 1. Freeze accounts with no activity for 24 months
    UPDATE profiles
    SET account_status = 'frozen'
    WHERE account_status = 'active'
      AND (last_activity_at < NOW() - INTERVAL '24 months' OR last_activity_at IS NULL AND created_at < NOW() - INTERVAL '24 months');

    -- 2. Downgrade loyalty tiers for inactivity (e.g., if no booking in 12 months, drop one tier)
    -- This is a simplified logic that can be refined based on specific business rules.
    UPDATE profiles
    SET membership_tier = CASE 
        WHEN membership_tier = 'vip' THEN 'gold'
        WHEN membership_tier = 'gold' THEN 'silver'
        WHEN membership_tier = 'silver' THEN 'bronze'
        WHEN membership_tier = 'bronze' THEN 'free'
        ELSE 'free'
    END
    WHERE last_activity_at < NOW() - INTERVAL '12 months'
      AND membership_tier != 'free';

    -- Note: Reactivation flow requires R300 payment (handled in frontend/reactivation service)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
