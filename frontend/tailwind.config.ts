import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        natif: {
          blue: '#1f3892',
          'blue-light': '#2b5ab5',
          cyan: '#48C6EF',
          green: '#6FD33D',
          dark: '#0A1628',
          'bg-warm': '#F8FAFC',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'header': '0 1px 3px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
