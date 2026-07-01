const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = 'https://frycwnarvowuvnnqetsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanup() {
    console.log('--- STARTING CLEANUP ---');

    const dummyId = '00000000-0000-0000-0000-000000000000';

    // 1. Delete products associated with dummy seller
    console.log('Removing products for dummy seller...');
    const { error: prodErr } = await supabase
        .from('products')
        .delete()
        .eq('seller_id', dummyId);

    if (prodErr) console.error('Error removing products:', prodErr);
    else console.log('Products removed successfully.');

    // 2. Delete dummy profile
    console.log('Removing dummy profile...');
    const { error: profErr } = await supabase
        .from('profiles')
        .delete()
        .eq('id', dummyId);

    if (profErr) console.error('Error removing profile:', profErr);
    else console.log('Profile removed successfully.');

    // 3. Remove "Carvoo Genuine" brand if it only has dummy products (optional/aggressive)
    // For now, let's just stick to the dummy seller data.

    console.log('--- CLEANUP COMPLETE ---');
}

cleanup();
