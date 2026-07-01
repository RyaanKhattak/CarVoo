const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frycwnarvowuvnnqetsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing individual table access...');

    const tables = ['profiles', 'products', 'cart_items', 'brands', 'categories'];

    for (const table of tables) {
        process.stdout.write(`Checking ${table}... `);
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log('FAIL');
            console.log(`  Code: ${error.code}`);
            console.log(`  Message: ${error.message}`);
        } else {
            console.log(`OK (found ${data ? data.length : 0} rows)`);
        }
    }

    console.log('\nTesting cart join query...');
    const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('*, product:products(*, seller:profiles!seller_id(full_name))')
        .limit(1);

    if (cartError) {
        console.log('Cart Join FAIL');
        console.log(`  Code: ${cartError.code}`);
        console.log(`  Message: ${cartError.message}`);
        console.log('  Full Error:', JSON.stringify(cartError, null, 2));
    } else {
        console.log('Cart Join OK');
    }
}

testConnection();
