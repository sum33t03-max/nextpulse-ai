/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          900: '#05070D',
          800: '#0B0F19',
          700: '#121826',
          600: '#1A2338',
        },
        cyber: {
          cyan: '#00F0FF',
          magenta: '#FF007A',
          amber: '#FFB800',
          lime: '#00FF66',
          violet: '#8A2BE2',
        }
      },
      fontFamily: {
        mono: ['Outfit', 'Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'neon-magenta': '0 0 15px rgba(255, 0, 122, 0.4)',
        'neon-lime': '0 0 15px rgba(0, 255, 102, 0.4)',
        'hud-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'hud-grid': 'linear-gradient(to right, rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.15), transparent 70%)',
      }
    },
  },
  plugins: [],
}
