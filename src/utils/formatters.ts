// Format currency in FCFA (XOF)
export function formatFCFA(amount: number): string {
  const rounded = Math.round(amount || 0);
  // French number format with non-breaking space
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(rounded);
  return `${formatted} FCFA`;
}

// Format date in French
export function formatDateFR(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

// Format short date
export function formatShortDateFR(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

// Calculate valid until date given start date and days
export function calculateValidUntil(startDate: string, days: number): string {
  try {
    const d = new Date(startDate || new Date().toISOString());
    d.setDate(d.getDate() + (days || 15));
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

// Clean and normalize Senegalese phone number for WhatsApp wa.me link
// Example inputs: "77 123 45 67", "+221 771234567", "00221771234567", "771234567"
// Returns: "221771234567" (digits only, with country code 221)
export function cleanPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // If starts with 00221, remove leading 00
  if (digits.startsWith('00221')) {
    digits = digits.slice(2);
  }
  // If starts with 221 and is 11 or 12 digits, keep as is
  else if (digits.startsWith('221') && digits.length >= 11) {
    // ok
  }
  // If starts with 0 and length is 10 (e.g. French style), adjust or check
  else if (digits.length === 9 && ['70', '75', '76', '77', '78', '33', '30', '88'].some(prefix => digits.startsWith(prefix))) {
    digits = '221' + digits;
  }
  // Default fallback if starts with 7 or 3 and 9 digits
  else if (digits.length === 9) {
    digits = '221' + digits;
  }

  return digits;
}

// Format display phone number for Senegal
export function formatDisplayPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  // If 9 digits (standard SN without country code): XX XXX XX XX
  if (cleaned.length === 9) {
    return `+221 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
  }
  // If 12 digits (with 221): +221 XX XXX XX XX
  if (cleaned.startsWith('221') && cleaned.length === 12) {
    const sn = cleaned.slice(3);
    return `+221 ${sn.slice(0, 2)} ${sn.slice(2, 5)} ${sn.slice(5, 7)} ${sn.slice(7, 9)}`;
  }
  return phone;
}

// Generate unique Quote number
export function generateQuoteNumber(existingQuotesCount: number): string {
  const currentYear = new Date().getFullYear();
  const sequence = String(existingQuotesCount + 1).padStart(3, '0');
  return `DEV-${currentYear}-${sequence}`;
}

// Calculate totals
export function calculateQuoteFinancials(quote: {
  items: { quantity: number; unitPrice: number; discountPercent?: number }[];
  applyTax: boolean;
  taxRate: number;
  globalDiscountPercent: number;
  depositPercent: number;
}) {
  // Subtotal of lines
  const subtotalGross = (quote.items || []).reduce((acc, item) => {
    const lineGross = (item.quantity || 0) * (item.unitPrice || 0);
    const lineDiscount = item.discountPercent ? lineGross * (item.discountPercent / 100) : 0;
    return acc + (lineGross - lineDiscount);
  }, 0);

  // Global discount
  const globalDiscountAmount = quote.globalDiscountPercent
    ? subtotalGross * (quote.globalDiscountPercent / 100)
    : 0;
  
  const subtotalNet = Math.max(0, subtotalGross - globalDiscountAmount);

  // Tax
  const taxAmount = quote.applyTax && quote.taxRate ? subtotalNet * (quote.taxRate / 100) : 0;

  // Total TTC / Total Net
  const totalAmount = subtotalNet + taxAmount;

  // Deposit (Acompte)
  const depositAmount = quote.depositPercent ? totalAmount * (quote.depositPercent / 100) : 0;
  const remainingBalance = totalAmount - depositAmount;

  return {
    subtotalGross,
    globalDiscountAmount,
    subtotalNet,
    taxAmount,
    totalAmount,
    depositAmount,
    remainingBalance,
  };
}
