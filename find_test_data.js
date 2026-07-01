const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frycwnarvowuvnnqetsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findSellerAndOrder() {
    // 1. Sign in as admin to see all data (if possible)
    await supabase.auth.signInWithPassword({
        email: 'carvoo321@gmail.com',
        password: 'C@rV001.0'
    });

    // 2. Find a seller
    const { data: sellers } = await supabase.from('profiles').select('id, email').eq('role', 'seller');
    if (!sellers || sellers.length === 0) {
        console.log('No sellers found.');
        return;
    }
    const seller = sellers[0];
    console.log(`Found seller: ${seller.email} (${seller.id})`);

    // 3. Find an order with items from this seller
    const { data: orderItems } = await supabase
        .from('order_items')
        .select('order_id, product:products(seller_id)')
        .eq('product.seller_id', seller.id)
        .limit(1);

    if (!orderItems || orderItems.length === 0) {
        console.log('No orders found for this seller.');
        return;
    }
    console.log(`Found order ID: ${orderItems[0].order_id}`);
}

findSellerAndOrder();
