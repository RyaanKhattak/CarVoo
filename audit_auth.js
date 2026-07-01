const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frycwnarvowuvnnqetsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function audit() {
    console.log('--- STARTING AUTH AUDIT ---');

    // 1. Sign In
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'carvoo321@gmail.com',
        password: 'C@rV001.0'
    });

    if (authError) {
        console.error('❌ Sign-in Error:', authError.message);
        return;
    }

    const user = authData.user;
    console.log('✅ Signed in successfully!');
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);
    console.log('User Metadata Role:', user.user_metadata?.role || 'NOT SET');

    // 2. Check Profile in DB
    console.log('\n--- CHECKING PROFILE RECORD ---');
    const { data: profile, error: prfError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (prfError) {
        console.error('❌ Profile Fetch Error:', prfError.message);
    } else {
        console.log('✅ Profile found in DB');
        console.log('   Role:', profile.role);
        console.log('   Approved:', profile.is_approved);
    }

    // 3. Test Data Fetching (RLS check)
    console.log('\n--- TESTING RLS PERMISSIONS ---');

    const tests = [
        { table: 'profiles', select: 'count', description: 'Total Profiles (Admin Only?)' },
        { table: 'products', select: 'count', description: 'Total Products' },
        { table: 'orders', select: 'count', description: 'Total Orders (Admin Only)' },
        { table: 'categories', select: 'count', description: 'Total Categories' }
    ];

    for (const test of tests) {
        const { count, error } = await supabase
            .from(test.table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`❌ ${test.description} (${test.table}): FAIL - ${error.message}`);
        } else {
            console.log(`✅ ${test.description} (${test.table}): SUCCESS - Count: ${count}`);
        }
    }

    // 4. Test Analytics specific query
    console.log('\n--- TESTING ANALYTICS QUERY ---');
    const { data: analyticsData, error: analyticsError } = await supabase
        .from('orders')
        .select('total_amount, created_at');

    if (analyticsError) {
        console.error('❌ Analytics Query Error:', analyticsError.message);
    } else {
        console.log(`✅ Analytics Query Success! Records: ${analyticsData.length}`);
    }
}

audit().catch(console.error);
