/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#ff0000",
          foreground: "#ffffff",
          50: "#fff5f5",
          100: "#ffe3e3",
          200: "#ffc9c9",
          300: "#ffa8a8",
          400: "#ff8787",
          500: "#ff0000",
          600: "#e60000",
          700: "#cc0000",
          800: "#b30000",
          900: "#990000",
        },
        secondary: {
          DEFAULT: "#ffcc00",
          foreground: "#000000",
          50: "#fffef0",
          100: "#fffde0",
          200: "#fffbc0",
          300: "#fff9a0",
          400: "#fff780",
          500: "#ffcc00",
          600: "#e6b800",
          700: "#cca400",
          800: "#b39000",
          900: "#997c00",
        },
        accent: {
          DEFAULT: "#ffcc00",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#1a1a1a",
          foreground: "#a1a1aa",
        },
        border: "#2a2a2a",
        card: {
          DEFAULT: "#0a0a0a",
          foreground: "#ffffff",
        },
        destructive: "#ff4444",
        success: "#00cc44",
        warning: "#ffaa00",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "glow": "glow 2s ease-in-out infinite alternate",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px #ffcc00, 0 0 10px #ffcc00, 0 0 15px #ffcc00" },
          "100%": { boxShadow: "0 0 10px #ffcc00, 0 0 20px #ffcc00, 0 0 30px #ffcc00" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px #ff0000, 0 0 10px #ff0000" },
          "50%": { boxShadow: "0 0 20px #ff0000, 0 0 30px #ff0000" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
        "gradient-secondary": "linear-gradient(135deg, #ffcc00 0%, #e6b800 100%)",
        "gradient-accent": "linear-gradient(135deg, #ffcc00 0%, #ffaa00 100%)",
        "gradient-dark": "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(255, 0, 0, 0.5)",
        "glow-secondary": "0 0 20px rgba(255, 204, 0, 0.5)",
        "glow-accent": "0 0 20px rgba(255, 204, 0, 0.3)",
      },
    },
  },
  plugins: [],
}
