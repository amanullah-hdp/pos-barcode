/** Map SQLite / internal errors to staff-friendly API messages. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : typeof err === 'string' ? err : '';

  if (msg.includes('UNIQUE constraint failed: brands.name')) {
    return 'A brand with this name already exists.';
  }
  if (msg.includes('UNIQUE constraint failed: categories.name')) {
    return 'A category with this name already exists.';
  }
  if (msg.includes('UNIQUE constraint failed: staff.staff_code')) {
    return 'A staff member with this ID already exists.';
  }
  if (msg.includes('UNIQUE constraint failed: products.sku')) {
    return 'A product with this SKU already exists.';
  }
  if (msg.includes('UNIQUE constraint failed: products.barcode')) {
    return 'A product with this barcode already exists.';
  }
  if (msg.includes('UNIQUE constraint failed: customers.')) {
    return 'A customer with these details already exists.';
  }
  if (msg.includes('UNIQUE constraint failed')) {
    return 'This name or code is already in use. Please choose another.';
  }
  if (msg.includes('FOREIGN KEY constraint failed')) {
    return 'This change is not allowed because other records depend on it.';
  }
  if (msg.includes('CHECK constraint failed')) {
    return 'One of the values is not allowed. Check amounts and quantities.';
  }
  if (/SQLITE_|constraint failed|syntax error|no such column/i.test(msg)) {
    return fallback;
  }

  if (msg.trim()) return msg;
  return fallback;
}
