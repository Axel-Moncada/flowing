/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // si usas la carpeta /app
  ],
  theme: {
    extend: {
      colors: {
        verde: "#00ff88", // tu color del scrollbar
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
