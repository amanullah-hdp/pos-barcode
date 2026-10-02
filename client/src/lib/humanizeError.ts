/** Last line of defense if a raw DB message reaches the client. */
export function humanizeError(message: string): string {
  if (!message) return 'Something went wrong. Please try again.';
  if (message.includes('UNIQUE constraint failed: brands.name')) {
    return 'A brand with this name already exists.';
  }
  if (message.includes('UNIQUE constraint failed: categories.name')) {
    return 'A category with this name already exists.';
  }
  if (message.includes('UNIQUE constraint failed')) {
    return 'This name or code is already in use. Please choose another.';
  }
  if (/SQLITE_|constraint failed|no such column|syntax error/i.test(message)) {
    return 'Something went wrong. Please try again or contact support.';
  }
  return message;
}
