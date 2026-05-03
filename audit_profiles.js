const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frycwnarvowuvnnqetsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listAllProfiles() {
    await supabase.auth.signInWithPassword({
        email: 'carvoo321@gmail.com',
        password: 'C@rV001.0'
    });

    const { data: profiles, error } = await supabase.from('profiles').select('id, full_name, role, is_approved');
    if (error) {
        console.error('Error fetching profiles:', error.message);
        return;
    }
    console.table(profiles);
}

listAllProfiles();
