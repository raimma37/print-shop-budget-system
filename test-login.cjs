const http = require('http');

const body = JSON.stringify({ email: 'admin@grafika.com', password: 'grafika123' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    console.log('Set-Cookie:', res.headers['set-cookie']);
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(body);
req.end();
