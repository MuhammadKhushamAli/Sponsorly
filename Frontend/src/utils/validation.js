/**
 * Form Validation Utilities
 * --------------------------
 * Usage:
 *   import { validate, rules } from '../utils/validation';
 *
 *   const errors = validate(formData, {
 *     title:  [rules.required(), rules.minLen(3), rules.maxLen(80)],
 *     budget: [rules.required(), rules.number(), rules.min(1)],
 *     email:  [rules.required(), rules.email()],
 *   });
 *
 *   if (Object.keys(errors).length) { ... }
 */

// ── Individual rule factories ─────────────────────────────────────────────────
export const rules = {
  required: (msg = 'This field is required') =>
    (val) => {
      if (val === null || val === undefined) return msg;
      if (typeof val === 'string' && !val.trim()) return msg;
      if (Array.isArray(val) && val.length === 0) return msg;
      return null;
    },

  minLen: (n, msg) =>
    (val) => {
      const v = String(val ?? '').trim();
      return v.length < n ? (msg || `Must be at least ${n} characters`) : null;
    },

  maxLen: (n, msg) =>
    (val) => {
      const v = String(val ?? '').trim();
      return v.length > n ? (msg || `Must be at most ${n} characters`) : null;
    },

  min: (n, msg) =>
    (val) => {
      const num = Number(val);
      return isNaN(num) || num < n ? (msg || `Minimum value is ${n}`) : null;
    },

  max: (n, msg) =>
    (val) => {
      const num = Number(val);
      return isNaN(num) || num > n ? (msg || `Maximum value is ${n}`) : null;
    },

  number: (msg = 'Must be a valid number') =>
    (val) => (isNaN(Number(val)) ? msg : null),

  positiveInt: (msg = 'Must be a positive whole number') =>
    (val) => {
      const n = Number(val);
      return !Number.isInteger(n) || n < 0 ? msg : null;
    },

  email: (msg = 'Enter a valid email address') =>
    (val) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !re.test(String(val ?? '')) ? msg : null;
    },

  url: (msg = 'Enter a valid URL (include https://)') =>
    (val) => {
      if (!val) return null; // optional by default
      try { new URL(val); return null; } catch { return msg; }
    },

  minItems: (n, msg) =>
    (val) => {
      const arr = Array.isArray(val) ? val : [];
      return arr.length < n ? (msg || `Select at least ${n} item${n > 1 ? 's' : ''}`) : null;
    },

  maxItems: (n, msg) =>
    (val) => {
      const arr = Array.isArray(val) ? val : [];
      return arr.length > n ? (msg || `Maximum ${n} item${n > 1 ? 's' : ''}`) : null;
    },

  pattern: (regex, msg = 'Invalid format') =>
    (val) => (!regex.test(String(val ?? '')) ? msg : null),

  custom: (fn) => fn, // pass a function (val) => string | null directly
};

// ── Runner ────────────────────────────────────────────────────────────────────
/**
 * @param {Record<string, any>}         data   - form values object
 * @param {Record<string, Function[]>}  schema - field → array of rule functions
 * @returns {Record<string, string>}    errors - only fields with errors
 */
export function validate(data, schema) {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(schema)) {
    for (const rule of fieldRules) {
      const err = rule(data[field]);
      if (err) { errors[field] = err; break; } // first error per field
    }
  }
  return errors;
}

// ── Campaign-specific schemas ─────────────────────────────────────────────────
export const creatorCampaignSchema = {
  title:       [rules.required(), rules.minLen(3), rules.maxLen(80)],
  description: [rules.required(), rules.minLen(10), rules.maxLen(2000)],
  budget:      [rules.required(), rules.number(), rules.min(1)],
};

export const sponsorCampaignSchema = {
  title:       [rules.required(), rules.minLen(3), rules.maxLen(80)],
  description: [rules.required(), rules.minLen(10), rules.maxLen(2000)],
  budget:      [rules.required(), rules.number(), rules.min(1)],
};

// ── Profile schemas ───────────────────────────────────────────────────────────
export const creatorProfileSchema = {
  bio:           [rules.required(), rules.minLen(20), rules.maxLen(500)],
  niche:         [rules.minItems(1, 'Add at least one niche')],
  followersCount:[rules.positiveInt()],
};

export const sponsorProfileSchema = {
  bio:        [rules.required(), rules.minLen(20), rules.maxLen(500)],
  industries: [rules.minItems(1, 'Add at least one industry')],
};

// ── Auth schemas ──────────────────────────────────────────────────────────────
export const loginSchema = {
  email:    [rules.required(), rules.email()],
  password: [rules.required(), rules.minLen(6)],
};

export const signupSchema = {
  name:     [rules.required(), rules.minLen(2), rules.maxLen(50)],
  email:    [rules.required(), rules.email()],
  password: [rules.required(), rules.minLen(8, 'Password must be at least 8 characters')],
  role:     [rules.required('Please select a role')],
};
