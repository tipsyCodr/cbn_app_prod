/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
          primary: "#444D5D",
          accented: "#042117",
          green: "#008000",
          orange: "#ff7f00",
      },
      fontFamily: {
        sans: ['InterVariable'],
      },
    },
  },
  plugins: [],
}

