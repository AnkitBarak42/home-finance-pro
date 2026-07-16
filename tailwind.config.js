/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1117",
        panel: "#171A24",
        panel2: "#1E2230",
        border: "#23283A",
        borderSoft: "#1A1D28",
        muted: "#6B7186",
        muted2: "#8890A6",
        text: "#EDEFF7",
        coral: "#FF6B5B",
        mint: "#38D39F",
        amber: "#F0B429",
        violet: "#8C7AE6",
      },
      fontFamily: {
        sans: ["Sora", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        fab: "0 8px 24px rgba(255,107,91,0.3)",
      },
    },
  },
  plugins: [],
};
