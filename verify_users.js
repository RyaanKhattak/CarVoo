const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://frycwnarvowuvnnqetsw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyUsers() {
    console.log('Fetching users to verify name randomization...');

    // Fetch last created 20 profiles
    const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('--- Random User Sample ---');
        data.forEach((user, index) => {
            console.log(`${index + 1}. ${user.full_name} (${user.email})`);
        });

        const distinctNames = new Set(data.map(u => u.full_name));
        console.log('\n--- Uniqueness Check ---');
        console.log(`Total Records: ${data.length}`);
        console.log(`Distinct Names: ${distinctNames.size}`);

        if (distinctNames.size < data.length * 0.8) {
            console.warn('WARNING: Low name variance detected. Randomization might still be broken.');
        } else {
            console.log('SUCCESS: High name variance detected. Randomization working.');
        }

    } else {
        console.log('No users found in profiles table.');
    }
}

verifyUsers();
