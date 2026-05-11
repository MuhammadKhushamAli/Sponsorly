// Modular color system for Sponsorly
// Creative gradient theme with vibrant accents

export const colors = {
  // Primary Gradient (Purple to Blue)
  primary: {
    50: '#faf8ff',
    100: '#f3ebff',
    200: '#e8d5ff',
    300: '#d4a5ff',
    400: '#b870ff',
    500: '#9d4edd', // Main brand color
    600: '#7b2cbf',
    700: '#5a189a',
    800: '#3c096c',
    900: '#240046',
  },

  // Secondary Gradient (Orange to Pink)
  secondary: {
    50: '#fff8f3',
    100: '#ffe8d6',
    200: '#ffd4b4',
    300: '#ffb87c',
    400: '#ff9a56',
    500: '#ff6b35', // Vibrant orange
    600: '#f55100',
    700: '#cc3700',
    800: '#992700',
    900: '#661a00',
  },

  // Accent (Teal)
  accent: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Teal accent
    600: '#0d9488',
    700: '#0f766e',
    800: '#134e4a',
    900: '#0d3331',
  },

  // Neutral
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Special
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// Gradients for creative backgrounds
export const gradients = {
  brand: 'linear-gradient(135deg, #9d4edd 0%, #5a189a 100%)',
  vibrant: 'linear-gradient(135deg, #ff6b35 0%, #ff9a56 100%)',
  cool: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
  warm: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
  dark: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  brand: '0 10px 40px rgba(157, 78, 221, 0.2)',
};
