<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the existing CHECK constraint that's causing issues
        DB::statement("
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
                END IF;
            END $$;
        ");

        // Add a new CHECK constraint that allows sslcommerz and other payment methods
        DB::statement("
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
            ))
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the constraint we added
        DB::statement("
            ALTER TABLE payment_transactions 
            DROP CONSTRAINT IF EXISTS payment_transactions_payment_method_check
        ");
    }
};
