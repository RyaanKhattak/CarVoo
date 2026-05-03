import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://frycwnarvowuvnnqetsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
    console.log('--- TESTING AUTH ---');

    // Sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'carvoo321@gmail.com',
        password: 'C@rV001.0'
    });

    if (signInError) {
        console.error('Sign in failed:', signInError.message);
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('No user logged in after sign-in.');
        return;
    }
    console.log('Logged in as:', user.email, 'ID:', user.id);
    console.log('User Role in Metadata:', user.user_metadata?.role || 'none');

    // Check JWT via session
    const { data: { session } } = await supabase.auth.getSession();
    const roleInJwt = session?.user?.user_metadata?.role;
    console.log('Role found in JWT Session:', roleInJwt);

    console.log('\n--- CHECKING PROFILE RECORD ---');
    const { data: profile, error: prfError } = await supabase
        .from('profiles')
        .select('role, is_approved')
        .eq('id', user.id)
        .maybeSingle();

    if (prfError) console.error('Profile Retrieval Error:', prfError.message);
    else if (!profile) console.log('Profile record NOT FOUND in DB');
    else console.log('Profile Role in DB:', profile.role, 'Approved:', profile.is_approved);

    console.log('\n--- TESTING PROFILES FETCH ---');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(5);
    if (pError) console.error('Profiles Fetch Error:', pError.message);
    else console.log('Profiles found:', profiles?.length || 0);

    console.log('\n--- TESTING PRODUCTS FETCH ---');
    const { data: products, error: prError } = await supabase.from('products').select('name').limit(5);
    if (prError) console.error('Products Fetch Error:', prError.message);
    else console.log('Products found:', products?.length || 0);

    console.log('\n--- TESTING ORDERS FETCH ---');
    const { data: orders, error: oError } = await supabase.from('orders').select('id').limit(5);
    if (oError) console.error('Orders Fetch Error:', oError.message);
    else console.log('Orders found:', orders?.length || 0);
}

testFetch();
