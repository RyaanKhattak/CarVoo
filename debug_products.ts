import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    const logStream = fs.createWriteStream('d:/Carvoo/debug_output.txt');
    function log(msg: string) {
        console.log(msg);
        logStream.write(msg + '\n');
    }

    log('Checking products...');

    // 1. Count all products
    const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        log(`Error counting products: ${JSON.stringify(countError)}`);
        return;
    }

    log(`Total products in DB: ${count}`);

    // 2. Check statuses
    const { data: products, error: dataError } = await supabase
        .from('products')
        .select('id, name, status, seller_id');

    if (dataError) {
        log(`Error fetching products: ${JSON.stringify(dataError)}`);
        return;
    }

    if (products && products.length > 0) {
        log('Products found:');
        products.forEach(p => {
            log(`- ${p.name} (${p.id}): Status = ${p.status}`);
        });

        const approvedCount = products.filter(p => p.status === 'approved').length;
        log(`Approved products count: ${approvedCount}`);

        // 3. Inspect specific product details
        const p = products[0];
        log(`INSPECTING PRODUCT: ${p.name} (${p.id})`);

        const { data: fullProduct, error: fullError } = await supabase
            .from('products')
            .select('*, brand_id, category_id, seller_id, model_id')
            .eq('id', p.id)
            .single();

        if (fullError) {
            log(`Error fetching full product details: ${JSON.stringify(fullError)}`);
        } else {
            log(`Full Details: brand_id=${fullProduct.brand_id}, category_id=${fullProduct.category_id}, seller_id=${fullProduct.seller_id}`);
        }

        // 4. Test the join query used in the app
        log('Testing App Query...');
        const { data: joinData, error: joinError } = await supabase
            .from('products')
            .select('*, brand:brands(name), model:models(name), category:categories(name, slug), seller:profiles(id, full_name)')
            .eq('id', p.id);

        if (joinError) {
            log(`Join Query Error: ${JSON.stringify(joinError)}`);
        } else {
            log(`Join Query Success. Data: ${JSON.stringify(joinData, null, 2)}`);
        }
    } else {
        log('No products returned by query.');
    }

    logStream.end();
}

checkProducts();
