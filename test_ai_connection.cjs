const https = require('https');

const apiKey = 'AIzaSyDYvUlUJiLwHerQVITZK_pL7hbGEYryLzw';
const data = JSON.stringify({
    contents: [{
        parts: [{
            text: 'Hello, are you working?'
        }]
    }]
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing Gemini API connection...');

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            if (json.candidates && json.candidates.length > 0) {
                console.log('SUCCESS: AI responded!');
                console.log('Response:', json.candidates[0].content.parts[0].text);
            } else {
                console.log('Warning: Valid response but no candidates?', body);
            }
        } catch (e) {
            console.log('Error parsing response:', body);
        }
    });
});

req.on('error', (e) => {
    console.error(`Request failed: ${e.message}`);
});

req.write(data);
req.end();
