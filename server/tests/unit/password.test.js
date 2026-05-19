describe('Password Validation Logic', () => {
  // Extracting the exact regex used in the application for unit testing
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  const validatePassword = (password) => passwordRegex.test(password);

  it('should accept a strong password with at least 8 chars, 1 uppercase, 1 lowercase, and 1 number', () => {
    expect(validatePassword('StrongPass123')).toBe(true);
    expect(validatePassword('aB345678')).toBe(true);
  });

  it('should reject passwords shorter than 8 characters', () => {
    expect(validatePassword('Str1ng')).toBe(false);
  });

  it('should reject passwords without an uppercase letter', () => {
    expect(validatePassword('weakpass123')).toBe(false);
  });

  it('should reject passwords without a lowercase letter', () => {
    expect(validatePassword('WEAKPASS123')).toBe(false);
  });

  it('should reject passwords without a number', () => {
    expect(validatePassword('StrongPassword')).toBe(false);
  });

  it('should accept passwords containing special characters (optional but allowed)', () => {
    expect(validatePassword('Str0ngP@ss!')).toBe(true);
  });
});
