
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Supabase URL or Anon Key is missing.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const logStream = fs.createWriteStream('d:/Carvoo/debug_admin_auth_output.txt');
function log(msg: string) {
    console.log(msg);
    logStream.write(msg + '\n');
}

const email = 'carvoo321@gmail.com';
const password = 'C@rV001.0';

async function checkAdminAuthQueries() {
    log('Checking Admin Dashboard Queries (Authenticated)...');

    // 1. Sign In
    log(`Logging in as ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError || !authData.user) {
        log(`❌ Login Failed: ${JSON.stringify(authError)}`);
        return;
    }
    log(`✅ Login Successful. User ID: ${authData.user.id}`);
    log(`   Role in Metadata: ${authData.user.user_metadata.role}`);

    // 2. Fetch Pending Sellers (which requires auth/admin)
    log('Fetching Pending Sellers...');
    const { data: pendingSellers, error: pendingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

    if (pendingError) {
        log(`❌ Pending Sellers Fetch Error: ${JSON.stringify(pendingError)}`);
    } else {
        log(`✅ Pending Sellers Query Success. Count: ${pendingSellers?.length}`);
    }

    // 3. Fetch Orders (which requires auth/admin)
    log('Fetching All Orders...');
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (ordersError) {
        log(`❌ Orders Fetch Error: ${JSON.stringify(ordersError)}`);
    } else {
        log(`✅ Orders Query Success. Count: ${orders?.length}`);
    }

    logStream.end();
}

checkAdminAuthQueries();
