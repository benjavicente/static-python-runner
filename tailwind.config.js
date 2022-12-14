/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "code": "#191D24",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
