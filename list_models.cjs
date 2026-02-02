const https = require('https');

const apiKey = 'AIzaSyDYvUlUJiLwHerQVITZK_pL7hbGEYryLzw'; // Using the key found in .env

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models?key=${apiKey}`,
    method: 'GET',
};

console.log('Listing available models...');

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            if (json.models) {
                console.log('Available Models:');
                json.models.forEach(m => {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                        console.log(`- ${m.name}`);
                    }
                });
            } else {
                console.log('Error:', body);
            }
        } catch (e) {
            console.log('Error parsing response:', body);
        }
    });
});

req.on('error', (e) => {
    console.error(`Request failed: ${e.message}`);
});

req.end();
