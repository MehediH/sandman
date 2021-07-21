module.exports = {
  mode: "",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    borderRadius: {
      none: "0",
      sm: "0.125rem",
      DEFAULT: "0.25rem",
      DEFAULT: "4px",
      md: "0.375rem",
      lg: "0.5rem",
      full: "9999px",
      large: "12px",
      extraLarge: "50px",
    },
    fontFamily: {
      dela: ["Dela Gothic One", "monospace"],
      code: ["Inconsolata", "monospace"],
    },
  },
  variants: {
    extend: {},
    scrollbar: ['dark']
  },
  plugins: [require("@tailwindcss/forms"), require('tailwind-scrollbar'),
  ],
};
