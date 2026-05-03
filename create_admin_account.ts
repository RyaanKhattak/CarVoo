import { createClient } from '@supabase/supabase-js';

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
                console.log('User already exists. Refreshing session...');
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (signInError) throw signInError;

                const user = signInData.user;
                console.log('User logged in. Updating profile to admin...');

                const { error: metaError } = await supabase.auth.updateUser({
                    data: { role: 'admin', full_name: fullName }
                });
                if (metaError) console.error('Error updating auth metadata:', metaError);
                else console.log('Auth metadata updated to admin.');

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
            console.log('User created. Creating profile...');
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    role: 'admin',
                    full_name: fullName
                });

            if (profileError) {
                console.error('Profile creation error:', profileError.message);
                console.log('Note: If email confirmation is required, profile might need to be created after email verification.');
            } else {
                console.log('Admin profile created successfully.');
            }
        }

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Error creating admin:', message);
    }
}

createAdmin();
