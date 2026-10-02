/** Normalize USB keyboard-wedge scanner input before lookup. */
export function normalizeScanCode(raw: string): string {
  let code = raw.trim().replace(/\s/g, '');
  // Some scanners prefix ]C1 or similar (Code 128 symbology)
  if (code.startsWith(']C1')) code = code.slice(3);
  if (code.startsWith(']E0')) code = code.slice(3);
  return code;
}
