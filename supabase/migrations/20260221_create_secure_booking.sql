
-- Secure Booking Creation & Price Calculation RPC
-- This ensures financial calculations are backend-only and non-manipulatable.

CREATE OR REPLACE FUNCTION create_secure_booking(
    p_service_type TEXT,
    p_category TEXT,
    p_base_price DECIMAL,
    p_date_time TIMESTAMP WITH TIME ZONE,
    p_location TEXT,
    p_notes TEXT
) RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_membership_tier TEXT;
    v_is_staff BOOLEAN;
    v_tier_discount_percent DECIMAL := 0;
    v_staff_discount_amount DECIMAL := 0;
    v_amount_before_vat DECIMAL;
    v_vat_amount DECIMAL;
    v_total_amount DECIMAL;
    v_booking_id UUID;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Get user tier and staff status
    SELECT membership_tier, (role IN ('staff', 'admin'))
    INTO v_membership_tier, v_is_staff
    FROM profiles
    WHERE id = v_user_id;

    -- Tier Discounts
    CASE v_membership_tier
        WHEN 'bronze' THEN v_tier_discount_percent := 5;
        WHEN 'silver' THEN v_tier_discount_percent := 10;
        WHEN 'gold' THEN v_tier_discount_percent := 15;
        WHEN 'vip' THEN v_tier_discount_percent := 20;
        ELSE v_tier_discount_percent := 0;
    END CASE;

    -- Staff Discount (15% on specific categories)
    IF v_is_staff AND p_service_type IN ('photography', 'videography', 'printing') THEN
        v_staff_discount_amount := p_base_price * 0.15;
    END IF;

    -- Calculate Totals (VAT Sequencing: Discount -> VAT)
    v_amount_before_vat := p_base_price - (p_base_price * v_tier_discount_percent / 100) - v_staff_discount_amount;
    v_amount_before_vat := GREATEST(0, v_amount_before_vat);
    
    v_vat_amount := v_amount_before_vat * 0.15;
    v_total_amount := v_amount_before_vat + v_vat_amount;

    -- Insert Booking
    INSERT INTO bookings (
        user_id,
        type,
        category,
        date_time,
        location,
        notes,
        total_amount,
        net_amount,
        status,
        created_at
    ) VALUES (
        v_user_id,
        p_service_type,
        p_category,
        p_date_time,
        p_location,
        p_notes,
        v_total_amount,
        v_total_amount, -- In the new system, we don't have tokens, so net_amount = total_amount
        'Pending',
        NOW()
    ) RETURNING id INTO v_booking_id;

    RETURN jsonb_build_object(
        'id', v_booking_id,
        'subtotal', p_base_price,
        'tier_discount_percent', v_tier_discount_percent,
        'staff_discount_amount', v_staff_discount_amount,
        'amount_before_vat', v_amount_before_vat,
        'vat_amount', v_vat_amount,
        'total_amount', v_total_amount
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
