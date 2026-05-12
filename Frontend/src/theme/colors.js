// Modular color system for Sponsorly
// Warm earth-tone palette: brown, cream, lime-yellow

export const colors = {
  // Primary — warm brown (anchor: #8A5F41 dark, #A77F60 mid, #F3E4C9 light)
  primary: {
    50:  '#fdf8f3',
    100: '#f9ede0',
    200: '#f3dfc9',   // ≈ #F3E4C9 cream
    300: '#e8c8a4',
    400: '#d4a87a',
    500: '#a77f60',   // #A77F60 medium brown
    600: '#8a5f41',   // #8A5F41 dark brown
    700: '#6e4a30',
    800: '#52371f',
    900: '#3a2412',
  },

  // Secondary — deeper earthy brown (darker than primary)
  secondary: {
    50:  '#faf5f0',
    100: '#f2e3d2',
    200: '#e5c9a8',
    300: '#d4a87a',
    400: '#bf8a58',
    500: '#8a5f41',   // same as primary-600 — rich dark brown
    600: '#74502f',
    700: '#5e3f22',
    800: '#472f17',
    900: '#30200e',
  },

  // Accent — lime yellow (#CCD67F and its family)
  accent: {
    50:  '#f9fbea',
    100: '#f2f6cf',
    200: '#e8f0a5',
    300: '#ccd67f',   // #CCD67F lime-yellow
    400: '#b8c55e',
    500: '#a0ae42',
    600: '#82902f',
    700: '#63701f',
    800: '#455014',
    900: '#2c340a',
  },

  // Neutral gray (warm-tinted, no blue)
  gray: {
    50:  '#faf9f7',
    100: '#f4f1ec',
    200: '#ebe6de',
    300: '#d9d0c4',
    400: '#b5a898',
    500: '#8c7d6d',
    600: '#6b5e50',
    700: '#4d4236',
    800: '#312a21',
    900: '#1a1511',
  },

  // Status — no blue
  success: '#6b8f2b',   // earthy green
  warning: '#c97a1a',   // amber-brown
  error:   '#c0392b',   // warm red
  info:    '#8a5f41',   // use primary brown for "info"

  // Basics
  white:       '#ffffff',
  black:       '#1a1511',
  transparent: 'transparent',
};

// Brand gradients — all warm, no blue/teal/purple
export const gradients = {
  brand:   'linear-gradient(135deg, #8a5f41 0%, #a77f60 100%)',
  vibrant: 'linear-gradient(135deg, #a77f60 0%, #ccd67f 100%)',
  warm:    'linear-gradient(135deg, #8a5f41 0%, #ccd67f 100%)',
  cream:   'linear-gradient(135deg, #f3e4c9 0%, #e8c8a4 100%)',
  dark:    'linear-gradient(135deg, #3a2412 0%, #6e4a30 100%)',
};

// Shadows (warm-tinted)
export const shadows = {
  sm:     '0 1px 2px 0 rgba(138, 95, 65, 0.06)',
  md:     '0 4px 6px -1px rgba(138, 95, 65, 0.12)',
  lg:     '0 10px 15px -3px rgba(138, 95, 65, 0.14)',
  xl:     '0 20px 25px -5px rgba(138, 95, 65, 0.16)',
  '2xl':  '0 25px 50px -12px rgba(138, 95, 65, 0.22)',
  brand:  '0 10px 40px rgba(138, 95, 65, 0.25)',
};
