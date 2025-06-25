import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        black: '#242424',
        grey: '#F3F3F3',
        'dark-grey': '#6B6B6B',
        red: '#FF4E4E',
        transparent: 'transparent',
        twitter: '#1DA1F2',
        purple: '#8B46FF',
        // no need to spread defaultTheme.colors here
      },

      fontSize: {
        sm: '12px',
        base: '14px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '38px',
        '5xl': '50px',
      },

      fontFamily: {
        poppins: ['Poppins', ...defaultTheme.fontFamily.sans],
        ubuntu: ['Ubuntu', ...defaultTheme.fontFamily.sans],
        lavish: ['"Lavishly Yours"', 'cursive'],
        inter: ['Inter', ...defaultTheme.fontFamily.sans],
        gelasio: ['Gelasio', 'serif'],
      },

      textShadow: {
        goldThick: `0.3px 0.8px 0px rgba(255, 185, 0, 1),
                    0.6px 1px 0px rgba(255, 185, 0, 1)`, 
      },
    },
  },
  plugins: [],
};
