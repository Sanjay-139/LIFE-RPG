/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3525cd',
        'primary-container': '#4f46e5',
        'on-primary': '#ffffff',
        'on-primary-container': '#dad7ff',
        'primary-fixed': '#e2dfff',
        'primary-fixed-dim': '#c3c0ff',
        'on-primary-fixed': '#0f0069',
        'on-primary-fixed-variant': '#3323cc',

        secondary: '#855300',
        'secondary-container': '#fea619',
        'secondary-fixed': '#ffddb8',
        'secondary-fixed-dim': '#ffb95f',
        'on-secondary': '#ffffff',
        'on-secondary-fixed': '#2a1700',
        'on-secondary-fixed-variant': '#653e00',
        'on-secondary-container': '#684000',

        tertiary: '#005338',
        'tertiary-container': '#006e4b',
        'tertiary-fixed': '#6ffbbe',
        'tertiary-fixed-dim': '#4edea3',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#67f4b7',
        'on-tertiary-fixed': '#002113',
        'on-tertiary-fixed-variant': '#005236',

        surface: '#faf8ff',
        'surface-bright': '#faf8ff',
        'surface-dim': '#d2d9f4',
        'surface-variant': '#dae2fd',
        'on-surface-variant': '#464555',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f3ff',
        'surface-container': '#eaedff',
        'surface-container-high': '#e2e7ff',
        'surface-container-highest': '#dae2fd',
        'on-surface': '#131b2e',
        background: '#faf8ff',
        'on-background': '#131b2e',

        outline: '#777587',
        'outline-variant': '#c7c4d8',

        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        // Attributes semantic tokens
        'stat-strength': '#d97706',
        'stat-intellect': '#7c3aed',
        'stat-vitality': '#0284c7',
        'stat-discipline': '#059669',
        'stat-charisma': '#e11d48',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        modal: '0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 10px 10px -5px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
