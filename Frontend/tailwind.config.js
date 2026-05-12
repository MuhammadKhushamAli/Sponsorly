/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ── Override only the brand tokens; keep all Tailwind defaults ──────
      colors: {
        // Primary: warm brown — #8A5F41 (dark) · #A77F60 (mid) · #F3E4C9 (light/cream)
        primary: {
          50:  '#fdf8f3',
          100: '#f9ede0',
          200: '#f3e4c9',   // ← #F3E4C9 cream
          300: '#e8c8a4',
          400: '#d4a87a',
          500: '#a77f60',   // ← #A77F60 medium brown
          600: '#8a5f41',   // ← #8A5F41 dark brown  (main brand)
          700: '#6e4a30',
          800: '#52371f',
          900: '#3a2412',
        },

        // Secondary: deeper earthy brown (keeps old "secondary" role)
        secondary: {
          50:  '#faf5f0',
          100: '#f2e3d2',
          200: '#e5c9a8',
          300: '#d4a87a',
          400: '#bf8a58',
          500: '#8a5f41',
          600: '#74502f',
          700: '#5e3f22',
          800: '#472f17',
          900: '#30200e',
        },

        // Accent: lime-yellow — #CCD67F
        accent: {
          50:  '#f9fbea',
          100: '#f2f6cf',
          200: '#e8f0a5',
          300: '#ccd67f',   // ← #CCD67F lime-yellow  (accent base)
          400: '#b8c55e',
          500: '#a0ae42',
          600: '#82902f',
          700: '#63701f',
          800: '#455014',
          900: '#2c340a',
        },

        // Neutral gray: warm-tinted (overrides Tailwind's cool gray)
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

        // Semantic tokens (keep non-blue status colors)
        error:   '#c0392b',
        success: '#6b8f2b',
        warning: '#c97a1a',
        info:    '#8a5f41',   // brown "info" (no blue)

        // Keep full default red/green/yellow/orange for status usage
        // (these are already in Tailwind defaults via extend)
      },

      backgroundImage: {
        // All brand gradients — warm earth tones only (replaces old purple ones)
        'gradient-brand':   'linear-gradient(135deg, #8a5f41 0%, #a77f60 100%)',
        'gradient-vibrant': 'linear-gradient(135deg, #a77f60 0%, #ccd67f 100%)',
        'gradient-cool':    'linear-gradient(135deg, #6e4a30 0%, #8a5f41 100%)',
        'gradient-warm':    'linear-gradient(135deg, #8a5f41 0%, #ccd67f 100%)',
        'gradient-dark':    'linear-gradient(135deg, #3a2412 0%, #6e4a30 100%)',
        'gradient-cream':   'linear-gradient(135deg, #f3e4c9 0%, #e8c8a4 100%)',
        'gradient-accent':  'linear-gradient(135deg, #ccd67f 0%, #a0ae42 100%)',
      },

      boxShadow: {
        'brand': '0 10px 30px rgba(138, 95, 65, 0.28)',
        'sm':    '0 1px 2px 0 rgba(26, 21, 17, 0.06)',
        'md':    '0 4px 6px -1px rgba(26, 21, 17, 0.10)',
        'lg':    '0 10px 15px -3px rgba(26, 21, 17, 0.12)',
        'xl':    '0 20px 25px -5px rgba(26, 21, 17, 0.15)',
        '2xl':   '0 25px 50px -12px rgba(26, 21, 17, 0.22)',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },

      backgroundClip: ['text'],
    },
  },
  plugins: [],
}
