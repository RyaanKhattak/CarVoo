import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://frycwnarvowuvnnqetsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listPolicies() {
    console.log('--- AUDITING COMPLEX JOINS (AUTHENTICATED) ---');

    // Sign in as admin
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'carvoo321@gmail.com',
        password: 'C@rV001.0'
    });

    if (signInError) {
        console.error('Sign in failed:', signInError.message);
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    console.log('Logged in as:', user?.email);

    const tests = [
        { name: 'Products + Profiles', table: 'products', query: '*, profiles(full_name)' },
        { name: 'Orders + Profiles', table: 'orders', query: '*, profiles(full_name)' },
        { name: 'Order Items + Orders', table: 'order_items', query: '*, order:orders(*)' },
        { name: 'Order Items + Products', table: 'order_items', query: '*, product:products(name)' },
        { name: 'Messages + Profiles', table: 'messages', query: '*, sender:profiles!sender_id(full_name), receiver:profiles!receiver_id(full_name)' }
    ];

    for (const test of tests) {
        console.log(`\nTesting: ${test.name}`);
        const { error } = await supabase.from(test.table).select(test.query).limit(1);
        if (error) {
            console.log(`❌ ${test.name}: ${error.message}`);
        } else {
            console.log(`✅ ${test.name}: Access OK`);
        }
    }
}

listPolicies();
