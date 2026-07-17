async function run() {
  const res = await fetch('http://localhost:4000/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'http500@example.com',
      name: 'HTTP 500',
      password: 'StrongPassword123!'
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
