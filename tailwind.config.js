/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'

export default {
  darkMode: 'class', // 启用 class 策略
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  safelist: [
    'prose', 'prose-h1', 'prose-h2', 'prose-h3', 'prose-p', 'prose-ul', 'prose-li', 'prose-code'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1677ff',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            pre: {
              padding: '0',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}