/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: "#2C1320",
          dark: "#1A0B13",
          light: "#421D31",
          soft: "#5B3347",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E6CA65",
          // darker than the original #997B1E so gold text on light grounds passes 4.5:1
          dark: "#806618",
          pale: "#F3E6BF",
        },
        blush: "#F7EBE8",
        champagne: "#F9F5F0",
        ivory: "#FDFBF7",
        sand: "#EADFCF",
        muted: "#6E6359",
      },
      fontFamily: {
        serif: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "display-sm": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "display-md": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        "display-lg": ["4rem", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        luxury: "0 20px 50px rgba(44, 19, 32, 0.12)",
        "luxury-hover": "0 25px 60px rgba(44, 19, 32, 0.2)",
        soft: "0 1px 2px rgba(44, 19, 32, 0.04), 0 6px 20px -6px rgba(44, 19, 32, 0.10)",
        lift: "0 2px 4px rgba(44, 19, 32, 0.04), 0 22px 44px -14px rgba(44, 19, 32, 0.22)",
        float: "0 30px 80px -20px rgba(26, 11, 19, 0.45)",
        "gold-glow": "0 10px 28px -10px rgba(212, 175, 55, 0.65)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #E6CA65 0%, #D4AF37 50%, #B8932A 100%)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "step-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "step-in-left": {
          from: { opacity: "0", transform: "translateX(-24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "sheet-down": {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        draw: { to: { strokeDashoffset: "0" } },
        "confetti-fall": {
          "0%": { transform: "translate3d(0,-10px,0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translate3d(var(--dx, 0px), 340px, 0) rotate(540deg)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 320ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 240ms ease-out both",
        "scale-in": "scale-in 240ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "step-in-right": "step-in-right 300ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "step-in-left": "step-in-left 300ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "sheet-down": "sheet-down 240ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "sheet-up": "sheet-up 280ms cubic-bezier(0.16, 1, 0.3, 1) both",
        pop: "pop 420ms cubic-bezier(0.16, 1, 0.3, 1) both",
        draw: "draw 500ms 200ms ease-out forwards",
      },
    },
  },
  plugins: [],
};
