
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullQuery() {
    console.log('\nTesting FULL getProducts query with all joins...');
    const selectString = '*, brand:brands(name), model:models(name), category:categories(name, slug), seller:profiles(id, full_name)';

    const { data, error } = await supabase
        .from('products')
        .select(selectString)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('FULL QUERY ERROR:');
        console.error(JSON.stringify(error, null, 2));
    } else {
        console.log('Full Query Successful!');
        console.log('Result count:', data?.length);
        if (data && data.length > 0) {
            console.log('First item joined data:', {
                brand: data[0].brand,
                model: data[0].model,
                category: data[0].category,
                seller: data[0].seller
            });
        }
    }
}

async function runTests() {
    await testFullQuery();
}

runTests();
