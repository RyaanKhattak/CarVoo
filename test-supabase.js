const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables. Check .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
    console.log('--- Testing getProducts query ---');
    try {
        const selectString = `
            *,
            brand:brands(name),
            model:models(name),
            category:categories(name, slug),
            seller:profiles(id, full_name)
        `;

        const { data, error } = await supabase
            .from('products')
            .select(selectString)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Query Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('Success! Fetched', data.length, 'products.');
            if (data.length > 0) {
                console.log('Sample Product:', JSON.stringify(data[0], null, 2));
            }
        }
    } catch (err) {
        console.error('Node Execution Error:', err);
    }
}

testFetch();
