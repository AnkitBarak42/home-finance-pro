/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F4F5FC",
        panel: "#FFFFFF",
        panel2: "#F8F9FD",
        border: "#ECEEF6",
        borderSoft: "#F1F2F9",
        muted: "#6B7186",
        muted2: "#8890A6",
        text: "#1D2033",
        coral: "#F0506B",
        mint: "#1FAE7C",
        amber: "#F5A623",
        violet: "#5B4FE8",
        violet2: "#7A6FF0",
      },
      fontFamily: {
        sans: ["Sora", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        fab: "0 10px 24px rgba(91,79,232,0.35)",
        card: "0 4px 18px rgba(60,66,110,0.06)",
      },
    },
  },
  plugins: [],
};
