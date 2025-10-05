# Payment Method Constraint Fix Guide

## Problem
The `payment_transactions` table has a CHECK constraint that doesn't allow 'sslcommerz' as a valid payment method value, causing a 500 error when trying to create payment transactions.

## Solution
Execute the SQL script below in pgAdmin Query Tool:

### Steps:
1. Open **pgAdmin**
2. Connect to your **refinedtech** database
3. Right-click on the database → **Query Tool**
4. Copy and paste the SQL below
5. Click **Execute** (F5)

### SQL Script:
```sql
-- Fix payment_method CHECK constraint issue
-- This script removes the restrictive CHECK constraint and allows any valid payment method

-- Step 1: Find and drop the existing CHECK constraint
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Get the constraint name
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    INNER JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'payment_transactions' 
    AND con.contype = 'c'
    AND con.conname LIKE '%payment_method%';
    
    -- Drop the constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE payment_transactions DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No payment_method constraint found';
    END IF;
END $$;

-- Step 2: Add a new CHECK constraint that allows common payment methods
-- Including: sslcommerz, credit_card, debit_card, bkash, nagad, rocket, cash_on_delivery
ALTER TABLE payment_transactions 
ADD CONSTRAINT payment_transactions_payment_method_check 
CHECK (payment_method IN (
    'sslcommerz',
    'credit_card',
    'debit_card', 
    'bkash',
    'nagad',
    'rocket',
    'cash_on_delivery',
    'bank_transfer'
));

-- Step 3: Verify the constraint was added
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'payment_transactions' 
AND con.contype = 'c'
AND con.conname LIKE '%payment_method%';
```

## Expected Output:
You should see:
- "Dropped constraint: payment_transactions_payment_method_check" (or "No payment_method constraint found")
- A table showing the new constraint definition

## Alternative: Remove Constraint Completely (If Issues Persist)
If the above doesn't work, run this simpler version:

```sql
-- Drop the constraint completely
ALTER TABLE payment_transactions 
DROP CONSTRAINT IF EXISTS payment_transactions_payment_method_check;

-- Verify it's gone
SELECT conname 
FROM pg_constraint 
WHERE conrelid = 'payment_transactions'::regclass 
AND contype = 'c';
```

## After Running SQL:
1. Clear Laravel cache again (just to be safe):
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```
2. Test the Buy Now button again

## What This Fixes:
- The CHECK constraint was only allowing specific payment methods
- 'sslcommerz' was being rejected by the constraint
- This script updates the constraint to allow 'sslcommerz' and other common payment methods
