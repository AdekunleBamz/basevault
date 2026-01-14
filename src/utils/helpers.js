/**
 * Utility functions for formatting, validation, and common operations
 */

import { BASESCAN_TX_URL, BASESCAN_ADDRESS_URL } from './constants';

/**
 * Format an Ethereum address for display
 * @param {string} address - The full Ethereum address
 * @param {number} prefixLength - Characters to show at start
 * @param {number} suffixLength - Characters to show at end
 */
export function formatAddress(address, prefixLength = 6, suffixLength = 4) {
  if (!address) return '';
  if (address.length < prefixLength + suffixLength) return address;
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Format ETH balance with specified decimal places
 * @param {string|number} balance - The balance to format
 * @param {number} decimals - Number of decimal places
 */
export function formatETH(balance, decimals = 4) {
  if (!balance && balance !== 0) return '-.----';
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (isNaN(num)) return '-.----';
  return num.toFixed(decimals);
}

/**
 * Format large numbers with commas
 * @param {string|number} num - The number to format
 */
export function formatNumber(num) {
  if (!num && num !== 0) return '-';
  const number = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(number)) return '-';
  return number.toLocaleString();
}

/**
 * Format a percentage value
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places
 */
export function formatPercent(value, decimals = 2) {
  if (!value && value !== 0) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a date relative to now
 * @param {Date|number} date - The date to format
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const target = date instanceof Date ? date : new Date(date);
  const diff = target - now;
  const absDiff = Math.abs(diff);
  
  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(absDiff / 3600000);
  const days = Math.floor(absDiff / 86400000);
  
  const suffix = diff > 0 ? 'from now' : 'ago';
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ${suffix}`;
  if (hours < 24) return `${hours}h ${suffix}`;
  return `${days}d ${suffix}`;
}

/**
 * Format a countdown timer
 * @param {number} milliseconds - Time remaining in ms
 */
export function formatCountdown(milliseconds) {
  if (milliseconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  return {
    days: Math.floor(milliseconds / (1000 * 60 * 60 * 24)),
    hours: Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((milliseconds % (1000 * 60)) / 1000),
  };
}

/**
 * Pad a number with leading zeros
 * @param {number} num - The number to pad
 * @param {number} size - Total length of string
 */
export function padNumber(num, size = 2) {
  return String(num).padStart(size, '0');
}

/**
 * Validate an Ethereum address
 * @param {string} address - The address to validate
 */
export function isValidAddress(address) {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if address is zero address
 * @param {string} address - The address to check
 */
export function isZeroAddress(address) {
  return address === '0x0000000000000000000000000000000000000000';
}

/**
 * Validate ETH amount
 * @param {string} amount - The amount to validate
 * @param {string} max - Maximum allowed amount
 */
export function isValidAmount(amount, max) {
  if (!amount) return false;
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) return false;
  if (max && num > parseFloat(max)) return false;
  return true;
}

/**
 * Get BaseScan URL for transaction
 * @param {string} hash - Transaction hash
 */
export function getTxUrl(hash) {
  return `${BASESCAN_TX_URL}/${hash}`;
}

/**
 * Get BaseScan URL for address
 * @param {string} address - Ethereum address
 */
export function getAddressUrl(address) {
  return `${BASESCAN_ADDRESS_URL}/${address}`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce a function
 * @param {function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle a function
 * @param {function} fn - Function to throttle
 * @param {number} limit - Minimum time between calls
 */
export function throttle(fn, limit = 300) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Safely parse JSON with fallback
 * @param {string} str - JSON string to parse
 * @param {any} fallback - Fallback value on error
 */
export function safeParseJSON(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Generate a random ID
 * @param {number} length - Length of ID
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Clamp a number between min and max
 * @param {number} num - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Calculate percentage
 * @param {number} value - The value
 * @param {number} total - The total
 */
export function calculatePercent(value, total) {
  if (!total || total === 0) return 0;
  return (value / total) * 100;
}
