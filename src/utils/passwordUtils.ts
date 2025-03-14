
/**
 * Generates a random password with specified complexity
 * @returns A random password string
 */
export function generateRandomPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  
  // Ensure at least one character from each category
  password += getRandomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ"); // Uppercase
  password += getRandomChar("abcdefghijklmnopqrstuvwxyz"); // Lowercase
  password += getRandomChar("0123456789"); // Number
  password += getRandomChar("!@#$%^&*()_+"); // Special char
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Shuffle the password to avoid predictable patterns
  return shuffleString(password);
}

/**
 * Gets a random character from a string
 */
function getRandomChar(str: string): string {
  return str.charAt(Math.floor(Math.random() * str.length));
}

/**
 * Shuffles a string
 */
function shuffleString(str: string): string {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}
