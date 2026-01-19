/**
 * Validation utilities for forms
 * Supports Kazakhstan phone formats and standard email validation
 */

// Kazakhstan phone number regex: +7 or 8, followed by 10 digits
const KZ_PHONE_REGEX = /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;

// Standard email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate Kazakhstan phone number
 * Accepts formats: +77001234567, 87001234567, 7001234567, +7 700 123 45 67, etc.
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Optional field
  }

  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Check length
  if (cleaned.length < 10 || cleaned.length > 12) {
    return {
      isValid: false,
      error: 'Номер должен содержать 10-11 цифр',
    };
  }

  // Check format
  if (!KZ_PHONE_REGEX.test(phone)) {
    return {
      isValid: false,
      error: 'Неверный формат номера. Пример: +7 700 123 45 67',
    };
  }

  return { isValid: true };
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: true }; // Optional field
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      error: 'Неверный формат email. Пример: user@example.com',
    };
  }

  return { isValid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName} обязательно для заполнения`,
    };
  }
  return { isValid: true };
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationResult => {
  if (value && value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} должно содержать минимум ${minLength} символов`,
    };
  }
  return { isValid: true };
};

/**
 * Validate positive number
 */
export const validatePositiveNumber = (value: number, fieldName: string): ValidationResult => {
  if (isNaN(value) || value < 0) {
    return {
      isValid: false,
      error: `${fieldName} должно быть положительным числом`,
    };
  }
  return { isValid: true };
};

/**
 * Format phone number for display
 * Converts 77001234567 to +7 700 123 45 67
 */
export const formatPhoneDisplay = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11 && (cleaned.startsWith('7') || cleaned.startsWith('8'))) {
    return `+7 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }

  if (cleaned.length === 10) {
    return `+7 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }

  return phone;
};

/**
 * Phone input mask handler
 * Auto-formats as user types
 */
export const handlePhoneInput = (value: string): string => {
  // Remove all non-digits
  let digits = value.replace(/\D/g, '');

  // Remove leading 8 and replace with 7
  if (digits.startsWith('8') && digits.length > 1) {
    digits = '7' + digits.slice(1);
  }

  // Limit to 11 digits
  digits = digits.slice(0, 11);

  // Format the number
  if (digits.length === 0) return '';
  if (digits.length <= 1) return '+' + digits;
  if (digits.length <= 4) return `+${digits.slice(0, 1)} ${digits.slice(1)}`;
  if (digits.length <= 7) return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4)}`;
  if (digits.length <= 9) return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
};
