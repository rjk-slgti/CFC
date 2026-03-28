/**
 * Utility functions for the Carbon Accounting frontend
 */

/**
 * Format a number with thousand separators and specified decimal places.
 */
export function formatNumber(value, decimals = 2) {
  if (value == null || isNaN(value)) return '0';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format CO2e value with unit suffix.
 */
export function formatEmissions(value, unit = 'kg CO2e') {
  if (value >= 1000) {
    return `${formatNumber(value / 1000, 2)} t ${unit.replace('kg', '').trim()}`;
  }
  return `${formatNumber(value, 2)} ${unit}`;
}

/**
 * Format a date to locale string.
 */
export function formatDate(date, format = 'short') {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  if (format === 'short') {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return d.toISOString().split('T')[0];
}

/**
 * Debounce a function call.
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Get scope display info.
 */
export function getScopeInfo(scope) {
  const map = {
    scope_1: { label: 'Scope 1', description: 'Direct Emissions', color: 'red', bgClass: 'bg-red-50', textClass: 'text-red-700' },
    scope_2: { label: 'Scope 2', description: 'Energy Indirect', color: 'blue', bgClass: 'bg-blue-50', textClass: 'text-blue-700' },
    scope_3: { label: 'Scope 3', description: 'Value Chain', color: 'green', bgClass: 'bg-green-50', textClass: 'text-green-700' },
  };
  return map[scope] || { label: scope, description: '', color: 'gray', bgClass: 'bg-gray-50', textClass: 'text-gray-700' };
}

/**
 * Get grade display info.
 */
export function getGradeDisplay(grade) {
  if (!grade) return '';
  const colors = {
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[grade.color] || colors.gray;
}

/**
 * Get current date in ISO format (YYYY-MM-DD).
 */
export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get first day of current month.
 */
export function firstOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}
