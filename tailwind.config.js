/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Chlorophyll AI Design System by Stitch MCP
        background: "#0a0f0b",
        surface: "#0a0f0b",
        surface_container_low: "#0f150f",
        surface_container: "#151b15",
        surface_container_high: "#1b211b",
        surface_container_highest: "#202820",
        surface_variant: "#202820",
        surface_bright: "#262e26",
        primary: "#6bfe9c",
        primary_container: "#1fc46a",
        primary_dim: "#5bef90",
        on_primary: "#005f2f",
        on_primary_container: "#003417",
        secondary: "#c1ecd4",
        secondary_container: "#274e3d",
        tertiary: "#f4ffc6",
        tertiary_container: "#d5fa42",
        tertiary_dim: "#caee36",
        outline: "#727770",
        outline_variant: "#444943",
        on_surface_variant: "#a7ada5",
        on_surface: "#f9fef5",
        error: "#ff716c",
        error_container: "#9f0519",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow-pulse': 'glowPulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(107, 254, 156, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(107, 254, 156, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}
