-- 1. Update Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'frozen', 'suspended')),
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'free';

-- 2. Create Token Transactions Table
CREATE TABLE IF NOT EXISTS public.token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('EARN', 'SPEND', 'BONUS', 'REFUND', 'ADMIN_ADJUSTMENT', 'REVERSAL')),
    booking_id UUID, -- Optional link to a booking
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Function to handle New User Setup (Welcome Bonus)
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile if it doesn't exist (assuming a trigger might already exist, we use ON CONFLICT)
    INSERT INTO public.profiles (id, email, name, points, last_activity_at)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        15, -- 15 Tokens Welcome Bonus
        now()
    )
    ON CONFLICT (id) DO UPDATE 
    SET points = public.profiles.points + 15,
        last_activity_at = now();

    -- Record the Bonus Transaction
    INSERT INTO public.token_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 15, 'BONUS', 'Welcome bonus on first signup');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger for New User Setup
-- Check if trigger exists first (in a real migration tool, this would be handled differently)
-- For a raw SQL script, we drop and create
DROP TRIGGER IF EXISTS on_auth_user_created_setup ON auth.users;
CREATE TRIGGER on_auth_user_created_setup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();

-- 5. RPC for Reactivating Account
CREATE OR REPLACE FUNCTION public.reactivate_frozen_account(
    p_payment_reference TEXT,
    p_fee_paid NUMERIC
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Update profile status
    UPDATE public.profiles
    SET account_status = 'active',
        last_activity_at = now()
    WHERE id = v_user_id AND account_status = 'frozen';

    -- Record reactivation payment (optional, could be a separate ledger)
    -- For now, returning success
    RETURN jsonb_build_object('success', true, 'restored_at', now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Profiles: Users can update their own last_activity_at
CREATE POLICY "Users can update own activity" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Token Transactions: Users can view own transactions
CREATE POLICY "Users can view own transactions" ON public.token_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON public.profiles(last_activity_at);
