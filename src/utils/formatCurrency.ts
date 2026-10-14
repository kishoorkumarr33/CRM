/**
 * Indian Rupee (INR - ₹) formatting utilities
 */

/**
 * Formats a numeric value into standard Indian Rupee notation (e.g. ₹1,50,000)
 */
export function formatINR(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '₹0';
  }
  const rounded = Math.round(value);
  return `₹${rounded.toLocaleString('en-IN')}`;
}

/**
 * Formats a numeric value with compact Indian scale:
 * e.g. ₹50K, ₹1.5L (Lakhs), ₹2.4Cr (Crores)
 */
export function formatINRCompact(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '₹0';
  }
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 10000000) {
    // Crores
    const cr = abs / 10000000;
    return `${sign}₹${cr % 1 === 0 ? cr : cr.toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    // Lakhs
    const lakh = abs / 100000;
    return `${sign}₹${lakh % 1 === 0 ? lakh : lakh.toFixed(1)}L`;
  }
  if (abs >= 1000) {
    // Thousands
    const k = abs / 1000;
    return `${sign}₹${k % 1 === 0 ? k : k.toFixed(1)}k`;
  }
  return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`;
}
