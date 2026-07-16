import { JwtUtil } from '../../utils/jwt.util';

describe('JwtUtil', () => {
  it('should generate and verify an access token', () => {
    const payload = { userId: '123' };
    const token = JwtUtil.generateAccessToken(payload);
    
    expect(token).toBeDefined();
    
    const decoded = JwtUtil.verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });

  it('should generate and verify a refresh token', () => {
    const payload = { userId: '123' };
    const token = JwtUtil.generateRefreshToken(payload);
    
    expect(token).toBeDefined();
    
    const decoded = JwtUtil.verifyRefreshToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });
});
