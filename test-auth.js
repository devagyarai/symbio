const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log('Login Response keys:', Object.keys(parsed));
    
    if (parsed.accessToken) {
      console.log('Token snippet:', parsed.accessToken.substring(0, 20) + '...');
      
      // Decode token
      const payload = JSON.parse(Buffer.from(parsed.accessToken.split('.')[1], 'base64').toString());
      console.log('Decoded payload:', payload);

      const dashOptions = {
        hostname: 'localhost',
        port: 4000,
        path: '/dashboard/overview',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + parsed.accessToken,
        },
      };
      
      const dashReq = http.request(dashOptions, (dashRes) => {
        let dashData = '';
        dashRes.on('data', (c) => dashData += c);
        dashRes.on('end', () => {
          console.log('Dashboard status:', dashRes.statusCode);
          console.log('Dashboard Response:', dashData.substring(0, 200));
        });
      });
      dashReq.end();
    } else {
      console.log('Failed to login:', parsed);
    }
  });
});

req.write(JSON.stringify({ email: 'admin@symbio.com', password: 'Password123!' }));
req.end();
