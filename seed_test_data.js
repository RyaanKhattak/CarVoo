const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frycwnarvowuvnnqetsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
    console.log('--- SEEDING START ---');

    // 1. Create a Profile (required as foreign key for product)
    // Note: This usually happens via trigger, but we'll do it manually for the test
    // We need a dummy UUID.
    const dummyId = '00000000-0000-0000-0000-000000000000';
    console.log('Seeding dummy profile...');
    const { error: pErr } = await supabase.from('profiles').upsert({
        id: dummyId,
        full_name: 'System Test Seller',
        role: 'seller'
    });
    if (pErr) console.error('Profile Seed Error:', pErr);

    // 2. Seed a Brand
    console.log('Seeding brand...');
    const { data: brand, error: bErr } = await supabase.from('brands').upsert({ name: 'Carvoo Genuine' }).select();
    if (bErr) console.error('Brand Seed Error:', bErr);

    // 3. Seed a Category
    console.log('Seeding category...');
    const { data: cat, error: cErr } = await supabase.from('categories').upsert({ name: 'Brake Systems', slug: 'brakes' }).select();
    if (cErr) console.error('Category Seed Error:', cErr);

    // 4. Seed a Product
    if (brand && cat) {
        console.log('Seeding product...');
        const { data: product, error: prErr } = await supabase.from('products').upsert({
            name: 'High-Performance Ceramic Brake Pads',
            description: 'Precision-engineered ceramic pads for ultimate stopping power and zero noise.',
            price: 249.99,
            stock_quantity: 50,
            seller_id: dummyId,
            brand_id: brand[0].id,
            category_id: cat[0].id,
            status: 'approved',
            images: ['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800']
        }).select();

        if (prErr) console.error('Product Seed Error:', prErr.message);
        else {
            console.log('Successfully seeded test product!');

            // 5. Seed an Order
            console.log('Seeding order...');
            const { error: orErr } = await supabase.from('orders').upsert({
                buyer_id: dummyId,
                total_amount: 249.99,
                status: 'delivered',
                delivery_address: '123 Test St, Test City',
                payment_method: 'COD'
            });
            if (orErr) console.error('Order Seed Error:', orErr.message);
            else console.log('Successfully seeded test order!');
        }
    }

    console.log('--- SEEDING END ---');
}

seed();
