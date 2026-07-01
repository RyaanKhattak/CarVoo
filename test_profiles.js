const https = require('https');

const url = 'https://frycwnarvowuvnnqetsw.supabase.co/rest/v1/profiles?select=id&limit=1';
const options = {
    headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWN3bmFydm93dXZubnFldHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDk2MzIsImV4cCI6MjA4NjUyNTYzMn0.hs9shPp8b5FJJugxWISNiLPNBQquVl_PBwmDc0KtYe8'
    }
};

https.get(url, options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
});
