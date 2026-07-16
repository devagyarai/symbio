import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const HashUtil = {
  /**
   * Hashes a plaintext string (e.g. password)
   */
  async hash(plaintext: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(plaintext, salt);
  },

  /**
   * Compares a plaintext string with a hash
   */
  async compare(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  },
};
