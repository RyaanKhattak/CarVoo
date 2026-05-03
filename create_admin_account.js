const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frycwnarvowuvnnqetsw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const email = 'carvoo321@gmail.com';
const password = 'C@rV001.0';
const fullName = 'Carvoo Admin';

async function createAdmin() {
    console.log(`Starting admin creation for ${email}...`);

    try {
        // 1. Sign up
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: 'admin',
                    full_name: fullName
                }
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log('User already registered. Signing in...');
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (signInError) throw signInError;

                const user = signInData.user;
                console.log(`User ${user.id} logged in. Setting role to admin...`);

                const { error: updateError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        role: 'admin',
                        full_name: fullName
                    });

                if (updateError) throw updateError;
                console.log('Admin profile updated successfully.');
            } else {
                throw authError;
            }
        } else if (authData.user) {
            console.log('User created successfully. ID:', authData.user.id);
            console.log('Attempting to create/update profile...');
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    role: 'admin',
                    full_name: fullName
                });

            if (profileError) {
                console.error('Profile operation error:', profileError.message);
                console.log('Tip: If email confirmation is required, you might need to verify your email first.');
            } else {
                console.log('Admin profile initialized successfully.');
            }
        }

    } catch (error) {
        console.error('CRITICAL ERROR:', error.message);
    }
}

createAdmin();
