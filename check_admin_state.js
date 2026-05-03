const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frycwnarvowuvnnqetsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const email = 'carvoo321@gmail.com';

async function checkState() {
    console.log(`Checking state for ${email}...`);

    try {
        // 1. Check profiles
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('full_name', 'Carvoo Admin') // Since we don't have ID here easily without auth
            .maybeSingle();

        if (profileError) console.error('Profile Err:', profileError);
        console.log('Profile found by name:', profile);

        // Alternatively check all profiles to see what we have
        const { data: allProfiles, error: allErr } = await supabase.from('profiles').select('id, full_name, role').limit(10);
        console.log('Recent profiles:', allProfiles);

    } catch (error) {
        console.error('Check failed:', error.message);
    }
}

checkState();
