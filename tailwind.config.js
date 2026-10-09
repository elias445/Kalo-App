/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: '#07090E',
        surface: '#0E131B',
        surface2: '#151B26',
        line: 'rgba(255,255,255,0.08)',
        muted: '#8B94A7',
        dim: '#8B94A7',
        brand: '#0A5CFF',
        cyan: '#00D1FF',
        ok: '#22C55E',
        danger: '#F43F5E',
        violet: '#8B5CF6',
      },
    },
  },
  plugins: [],
}
