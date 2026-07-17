import { AuthService } from './apps/api/src/auth/auth.service';

async function test() {
  try {
    const data = {
      email: 'test500_twice@example.com',
      name: 'Test Twice',
      password: 'StrongPassword123!'
    };
    await AuthService.register(data);
    console.log('First registration success');
    
    await AuthService.register(data);
    console.log('Second registration success (should not happen)');
  } catch (err) {
    console.error('Error occurred on second registration:');
    console.error(err);
  }
}

test();
