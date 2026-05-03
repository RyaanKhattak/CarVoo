const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSellerPolicies() {
    console.log('🔄 Applying Seller RLS Fix...');

    const sql = `
    -- Drop the existing restrictive policy
    DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

    -- Create a more inclusive policy for BOTH Admins and Sellers
    CREATE POLICY "Admins and Sellers can update orders" ON public.orders 
    FOR UPDATE USING (
        public.is_admin() OR 
        public.is_order_seller(id)
    )
    WITH CHECK (
        public.is_admin() OR 
        public.is_order_seller(id)
    );
  `;

    try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            // If RPC fails, try running via a direct execution if available or notify
            console.error('❌ Error executing SQL via RPC:', error);
            console.log('💡 Note: If "exec_sql" is not available, you may need to run this manually in the Supabase SQL Editor.');

            // Attempt alternative if first fails (common in some setups)
            console.log('🔄 Attempting alternative update...');
            const { error: error2 } = await supabase.from('orders').update({ status: 'pending' }).match({ id: '00000000-0000-0000-0000-000000000000' });
            if (error2 && error2.code === '42501') {
                console.error('❌ Still permission denied. Manual SQL execution required.');
            }
        } else {
            console.log('✅ Seller RLS policies updated successfully!');
        }
    } catch (err) {
        console.error('💥 Fatal error:', err);
    }
}

fixSellerPolicies();
