/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary-rgb) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover-rgb) / <alpha-value>)',
        },
        brand: {
          DEFAULT: 'rgb(var(--primary-rgb) / <alpha-value>)',
          light: '#E0F2FE',
          soft: '#F0F9FF',
          hover: 'rgb(var(--primary-hover-rgb) / <alpha-value>)',
        },
        app: {
          bg: '#F8FAFC',
          sidebar: '#FFFFFF',
          border: '#E2E8F0',
        },
        msg: {
          sent: '#E0F2FE',
          received: '#FFFFFF',
          charcoal: '#0F172A',
        },
        surface: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        success: '#22C55E',
      },
      borderRadius: {
        chat: '14px',
        card: '16px',
        btn: '12px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(14, 165, 233, 0.08)',
        card: '0 2px 12px rgba(15, 23, 42, 0.04)',
        float: '0 4px 20px rgba(14, 165, 233, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
