const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frycwnarvowuvnnqetsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
    try {
        console.log('1. Checking connection...');
        const { data: test, error: testErr } = await supabase.from('products').select('id').limit(1);
        if (testErr) throw testErr;
        console.log('Connection OK.');

        console.log('2. Fetching one product to see columns...');
        const { data: one, error: oneErr } = await supabase.from('products').select('*').limit(1);
        if (oneErr) throw oneErr;
        if (one && one.length > 0) {
            console.log('Columns in products:', Object.keys(one[0]).join(', '));
            console.log('Sample data status:', one[0].status);
        } else {
            console.log('No products found in table.');
        }

        console.log('3. Testing join components individually...');
        const joins = [
            'brands(name)',
            'models(name)',
            'categories(name, slug)',
            'profiles(id, full_name)'
        ];

        for (const j of joins) {
            console.log(`Testing join: ${j}`);
            const { error: jErr } = await supabase.from('products').select(`id, ${j}`).limit(1);
            if (jErr) {
                console.log(`FAIL ${j}:`, jErr.message);
            } else {
                console.log(`SUCCESS ${j}`);
            }
        }

    } catch (e) {
        console.error('DIAGNOSTIC CRASHED:', e.message);
    }
}

diagnose();
