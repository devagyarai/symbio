import { AuthService } from './apps/api/src/auth/auth.service';

async function test() {
  try {
    const res = await AuthService.register({
      email: 'test500@example.com',
      name: 'Test 500',
      password: 'StrongPassword123!'
    });
    console.log('Success:', res);
  } catch (err) {
    console.error('Error occurred:');
    console.error(err);
  }
}

test();
