/**
 * Validates Казахстан ИИН (Individual Identification Number)
 * Format: 12 digits (YYMMDD + 6 digits)
 */
export function validateIIN(iin: string): boolean {
  if (!iin || iin.length !== 12) return false;
  if (!/^\d{12}$/.test(iin)) return false;

  // Validate birth date
  const year = parseInt(iin.substring(0, 2));
  const month = parseInt(iin.substring(2, 4));
  const day = parseInt(iin.substring(4, 6));

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Checksum validation
  const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const weights2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += parseInt(iin[i]) * weights1[i];
  }

  let checksum = sum % 11;
  if (checksum === 10) {
    sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += parseInt(iin[i]) * weights2[i];
    }
    checksum = sum % 11;
  }

  return checksum === parseInt(iin[11]);
}

/**
 * Validates Казахстан БИН (Business Identification Number)
 * Format: 12 digits
 */
export function validateBIN(bin: string): boolean {
  if (!bin || bin.length !== 12) return false;
  if (!/^\d{12}$/.test(bin)) return false;

  // BIN checksum validation (similar to IIN)
  const weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += parseInt(bin[i]) * weights[i];
  }

  const checksum = sum % 11;
  return checksum === parseInt(bin[11]);
}

/**
 * Format phone number (Kazakhstan)
 * Input: 7771234567
 * Output: +7 (777) 123-45-67
 */
export function formatPhoneKZ(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 11) return phone;

  const match = cleaned.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
  }

  return phone;
}
