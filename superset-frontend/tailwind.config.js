/* eslint-disable theme-colors/no-literal-colors */
const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  important: true,
  theme: {
    extend: {
      keyframes: {
        enter: {
          from: {
            transform: 'scale(.9)',
            opacity: 0,
          },
          to: {
            transform: 'scale(1)',
            opacity: 1,
          },
        },
        leave: {
          from: {
            transform: 'scale(1)',
            opacity: 1,
          },
          to: {
            transform: 'scale(0.9)',
            opacity: 0,
          },
        },
      },
      animation: {
        enter: 'enter 0.2s ease-out',
        leave: 'leave 0.15s ease-in forwards',
        'spin-slow': 'spin 4s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-radial-to-br':
          'radial-gradient(73.06% 93.83% at 19.34% 32.57%, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)',
      },
      fontSize: {
        tiny: '.675rem',
      },
      fontFamily: {
        sans: ["'Inter'", ...defaultTheme.fontFamily.sans],
      },
      textColor: {
        skin: {
          primary: '#595959',
          secondary: '#8C8C8C',
          title: '#262626',
          // disable: colors.gray[600],
        },
      },
      backgroundColor: {
        skin: {
          light: '#FFFFFF',
          DEFAULT: '#F5F5F5',
          tableHeader: '#FAFAFA',
          selected: colors.gray[800],
        },
      },
      colors: {
        // skin: {
        primaryLight: '#fcd88d',
        primary: '#FA8C16',
        secondary: '#40A9FF',
        border: '#D9D9D9',
        divider: '#F0F0F0',
        disable: '#BFBFBF',
        // },
      },
    },
  },
  plugins: [],
};
