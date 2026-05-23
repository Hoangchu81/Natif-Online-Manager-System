import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // === NATIF Brand Colors ===
        natif: {
          primary: {
            DEFAULT: '#1f3892',
            hover: '#163075',
            light: '#2b5ab5',
            50: '#eef2ff',
            100: '#dbeafe',
            500: '#1f3892',
            600: '#163075',
            700: '#102456',
          },
          cyan: {
            DEFAULT: '#48C6EF',
            50: '#ecfeff',
            100: '#cffafe',
            500: '#48C6EF',
            600: '#0891b2',
          },
          green: {
            DEFAULT: '#6FD33D',
            50: '#dcfce7',
            100: '#bbf7d0',
            500: '#6FD33D',
            600: '#16a34a',
          },
          dark: {
            DEFAULT: '#0A1628',
            800: '#0f172a',
            900: '#0A1628',
          },
          warm: {
            bg: '#F8FAFC',
          },
        },

        // === Semantic Colors ===
        success: '#059669',
        warning: '#d97706',
        danger: '#dc2626',
        info: '#0891b2',

        // === Workflow Status Colors ===
        workflow: {
          draft: { bg: '#f1f5f9', text: '#475569' },
          submitted: { bg: '#fffbeb', text: '#d97706' },
          received: { bg: '#ecfeff', text: '#0891b2' },
          assigned: { bg: '#eef2ff', text: '#4f46e5' },
          preliminary_review: { bg: '#faf5ff', text: '#7c3aed' },
          expert_review: { bg: '#fff1f2', text: '#e11d48' },
          summarized: { bg: '#fef3c7', text: '#b45309' },
          dept_approved: { bg: '#dcfce7', text: '#16a34a' },
          dept_rejected: { bg: '#fee2e2', text: '#dc2626' },
          approved: { bg: '#dcfce7', text: '#16a34a' },
          rejected: { bg: '#fee2e2', text: '#dc2626' },
        },

        // === Role Colors ===
        role: {
          admin: { bg: '#dbeafe', text: '#1d4ed8' },
          moderator: { bg: '#e0e7ff', text: '#4338ca' },
          enterprise: { bg: '#dcfce7', text: '#16a34a' },
          expert: { bg: '#fef3c7', text: '#b45309' },
          officer: { bg: '#ecfeff', text: '#0891b2' },
          dept_head: { bg: '#f3e8ff', text: '#7c3aed' },
          director: { bg: '#fee2e2', text: '#dc2626' },
          clerk: { bg: '#f1f5f9', text: '#475569' },
        },
      },

      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },

      // === Spacing (4px base grid) ===
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      // === Border Radius ===
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },

      // === Shadows ===
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'header': '0 1px 3px rgba(0,0,0,0.06)',
        'modal': '0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)',
        'dropdown': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
      },

      // === Typography ===
      fontSize: {
        hero: ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.01em' }],
        display: ['clamp(2rem, 3vw, 3rem)', { lineHeight: '1.15', fontWeight: '700' }],
        h1: ['clamp(1.75rem, 2.5vw, 2.25rem)', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.25', fontWeight: '600' }],
        h3: ['1.125rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.65' }],
        tiny: ['0.6875rem', { lineHeight: '1.3', fontWeight: '500' }],
      },

      // === Animation & Motion ===
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },

      // === Z-Index ===
      zIndex: {
        dropdown: '50',
        sticky: '40',
        header: '50',
        modal: '100',
        toast: '150',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
