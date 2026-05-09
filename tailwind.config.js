/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        gold: "#CCBDA3",
        cream: "#EBE3D7",
        light: "#F5F0EB",
        white: "#FFFFFF",
        success: "#00C853",
        warning: "#FFB300",
        danger: "#F44336",
        info: "#2196F3",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        playfair: ['"Playfair Display"', "serif"],
      },
      boxShadow: {
        sm: "0 2px 4px rgba(0, 0, 0, 0.05)",
        md: "0 4px 8px rgba(0, 0, 0, 0.1)",
        lg: "0 8px 16px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwind-scrollbar")],
};
