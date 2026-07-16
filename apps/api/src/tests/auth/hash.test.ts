import { HashUtil } from '../../utils/hash.util';

describe('HashUtil', () => {
  it('should hash a password and verify it correctly', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await HashUtil.hash(password);
    
    expect(hash).not.toBe(password);
    
    const isValid = await HashUtil.compare(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await HashUtil.hash(password);
    
    const isValid = await HashUtil.compare('WrongPassword', hash);
    expect(isValid).toBe(false);
  });
});
