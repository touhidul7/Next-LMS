import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names safely
 * @param  {...any} inputs 
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency to BDT (৳)
 * @param {number} amount 
 * @returns {string}
 */
export function formatBDT(amount) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Normalize and validate Bangladeshi bKash phone numbers
 * @param {string} phone 
 * @returns {string} normalized phone e.g. 017XXXXXXXX
 */
export function normalizeBkashPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('880')) {
    return cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Create URL-friendly slug from string
 * @param {string} text 
 * @returns {string}
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
