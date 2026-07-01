
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

const logStream = fs.createWriteStream('d:/Carvoo/debug_admin_output.txt');
function log(msg: string) {
    console.log(msg);
    logStream.write(msg + '\n');
}

async function checkAdminQueries() {
    log('Checking Admin Dashboard Queries...');

    // 1. Total products count
    log('1. Fetching Total Products count...');
    const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true });

    if (productsError) {
        log(`❌ Products Fetch Error: ${JSON.stringify(productsError)}`);
    } else {
        log(`✅ Total Products: ${productsCount}`);
    }

    // 2. Total sellers count
    log('2. Fetching Total Sellers count...');
    const { count: sellersCount, error: sellersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'seller');

    if (sellersError) {
        log(`❌ Sellers Fetch Error: ${JSON.stringify(sellersError)}`);
    } else {
        log(`✅ Total Sellers: ${sellersCount}`);
    }

    // 3. All orders
    log('3. Fetching All Orders...');
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (ordersError) {
        log(`❌ Orders Fetch Error: ${JSON.stringify(ordersError)}`);
    } else {
        log(`✅ Orders Found: ${orders?.length}`);
        if (orders && orders.length > 0) {
            log(`   Latest Order ID: ${orders[0].id}, Amount: ${orders[0].total_amount}`);
        }
    }

    // 4. Pending Sellers
    log('4. Fetching Pending Sellers...');
    const { data: pendingSellers, error: pendingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

    if (pendingError) {
        log(`❌ Pending Sellers Fetch Error: ${JSON.stringify(pendingError)}`);
    } else {
        log(`✅ Pending Sellers: ${pendingSellers?.length}`);
        if (pendingSellers && pendingSellers.length > 0) {
            log(`   First Pending Seller: ${pendingSellers[0].full_name} (${pendingSellers[0].id})`);
        }
    }

    logStream.end();
}

checkAdminQueries();
