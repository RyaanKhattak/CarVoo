-- ==============================================================================
-- Script to create 500 fake users with Pakistani names, addresses, and phones in Supabase
-- This script inserts into auth.users and public.profiles using a transaction.
-- ==============================================================================

-- Ensure pgcrypto extension is available for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

BEGIN;

-- 1. Create a temporary table to store the generated users so we can link profiles
CREATE TEMP TABLE new_users (
  id UUID,
  email TEXT,
  password_hash TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT
) ON COMMIT DROP;

-- 2. Generate 500 users with random Pakistani names, addresses, and phone numbers
WITH config AS (
    SELECT
        ARRAY[
            'Muhammad', 'Ali', 'Ahmed', 'Hassan', 'Hussain', 'Bilal', 'Usman', 'Umar', 'Hamza', 'Saad',
            'Fatima', 'Ayesha', 'Zainab', 'Maryam', 'Sana', 'Sadia', 'Hina', 'Rabia', 'Sara', 'Khadija',
            'Imran', 'Kamran', 'Rizwan', 'Adnan', 'Salman', 'Fahad', 'Waqas', 'Asif', 'Kashif', 'Nasir',
            'Zeeshan', 'Farhan', 'Noman', 'Shahid', 'Javed', 'Tariq', 'Sohail', 'Rehan', 'Adeel', 'Yasir',
            'Amna', 'Iqra', 'Nida', 'Sobia', 'Uzma', 'Farah', 'Saira', 'Kiran', 'Mehwish', 'Samina'
        ] AS first_names,
        ARRAY[
            'Khan', 'Malik', 'Raja', 'Shah', 'Ahmed', 'Ali', 'Hussain', 'Bhatti', 'Chaudhry', 'Sheikh',
            'Cheema', 'Jutt', 'Butt', 'Iqbal', 'Rizvi', 'Syed', 'Qureshi', 'Ansari', 'Siddiqui', 'Baig',
            'Mirza', 'Kazmi', 'Hashmi', 'Gilani', 'Bukhari', 'Dar', 'Wain', 'Warraich', 'Gondal', 'Bajwa',
            'Arain', 'Dogar', 'Mughal', 'Rana', 'Satti', 'Abbasi', 'Nawaz', 'Sharif', 'Zardari', 'Bhutto',
            'Farooq', 'Saeed', 'Rashid', 'Latif', 'Akhtar', 'Yousaf', 'Rehman', 'Aziz', 'Mahmood', 'Hider'
        ] AS last_names,
        ARRAY[
            'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
            'Hyderabad', 'Bahawalpur', 'Sargodha', 'Abbottabad', 'Sukkur', 'Mardan', 'Kasur', 'Rahim Yar Khan', 'Sahiwal', 'Okara'
        ] AS cities
),
random_indices AS (
    -- Generate random indices for 500 rows
    SELECT
        floor(random() * 50 + 1)::int AS f_idx,
        floor(random() * 50 + 1)::int AS l_idx,
        floor(random() * 20 + 1)::int AS c_idx,
        floor(random() * 100 + 1)::int AS house_num,
        floor(random() * 20 + 1)::int AS street_num,
        -- Generate properly padded random phone suffix (7 digits)
        lpad(floor(random() * 10000000)::text, 7, '0') AS phone_suffix,
        -- Generate random mobile code between 300 and 349
        (300 + floor(random() * 50)::int)::text AS mobile_code
    FROM generate_series(1, 500)
),
data_gen AS (
    SELECT
        (SELECT first_names FROM config)[f_idx] || ' ' || (SELECT last_names FROM config)[l_idx] AS full_name,
        (SELECT cities FROM config)[c_idx] AS city,
        house_num,
        street_num,
        '+92 ' || mobile_code || ' ' || phone_suffix AS phone_number
    FROM random_indices
)
INSERT INTO new_users (id, email, password_hash, full_name, phone, address)
SELECT
  gen_random_uuid(),
  lower(regexp_replace(full_name, '\s+', '.', 'g')) || '_' || substring(gen_random_uuid()::text from 1 for 8) || '@example.com',
  crypt('password123', gen_salt('bf')),
  full_name,
  phone_number,
  'House ' || house_num || ', Street ' || street_num || ', ' || city || ', Pakistan'
FROM data_gen;

-- 3. Insert into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  id,
  'authenticated',
  'authenticated',
  email,
  password_hash,
  now(), -- email_confirmed_at
  now(), -- last_sign_in_at
  '{"provider": "email", "providers": ["email"]}',
  jsonb_build_object('full_name', full_name), -- Store name in user_metadata too
  now(),
  now(),
  '',
  '',
  '',
  ''
FROM new_users;

-- 4. Insert into public.profiles
INSERT INTO public.profiles (
  id,
  full_name,
  role,
  is_approved,
  address,
  phone,
  created_at,
  updated_at
)
SELECT
  id,
  full_name,
  'buyer', -- Default role
  true,    -- Approved by default
  address,
  phone,
  now(),
  now()
FROM new_users;

-- 5. Insert into auth.identities
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  id,
  jsonb_build_object('sub', id, 'email', email),
  'email',
  id,
  now(),
  now(),
  now()
FROM new_users;

COMMIT;

-- Verification
SELECT count(*) as "New Users Created" FROM public.profiles WHERE created_at > (now() - interval '1 minute');
SELECT full_name, email, public.profiles.phone, address FROM public.profiles JOIN auth.users ON public.profiles.id = auth.users.id ORDER BY public.profiles.created_at DESC LIMIT 10;
