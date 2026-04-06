/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "outline-variant": "#dbc2b0",
        "on-primary-fixed-variant": "#6e3900",
        "on-error-container": "#93000a",
        "secondary-container": "#eae1da",
        "surface-container-highest": "#e8e1db",
        "on-surface-variant": "#554336",
        "tertiary": "#a23917",
        "surface-container-high": "#eee7e0",
        "inverse-primary": "#ffb77d",
        "on-tertiary-fixed": "#3a0a00",
        "on-tertiary-fixed-variant": "#842503",
        "tertiary-fixed": "#ffdbd1",
        "surface-container": "#f4ede6",
        "on-primary": "#ffffff",
        "error-container": "#ffdad6",
        "outline": "#887364",
        "on-background": "#1e1b17",
        "primary-fixed": "#ffdcc3",
        "primary-fixed-dim": "#ffb77d",
        "surface-dim": "#e0d9d2",
        "surface-container-low": "#faf2eb",
        "background": "#fff8f2",
        "tertiary-container": "#c2512d",
        "tertiary-fixed-dim": "#ffb59f",
        "inverse-on-surface": "#f7efe9",
        "primary-container": "#b15f00",
        "error": "#ba1a1a",
        "on-surface": "#1e1b17",
        "on-secondary-fixed": "#1f1b17",
        "surface-container-lowest": "#ffffff",
        "surface": "#fff8f2",
        "on-secondary-container": "#6a635e",
        "on-secondary-fixed-variant": "#4b4641",
        "secondary": "#645d58",
        "surface-bright": "#fff8f2",
        "on-tertiary-container": "#fffbff",
        "on-primary-container": "#fffbff",
        "surface-tint": "#904d00",
        "on-tertiary": "#ffffff",
        "secondary-fixed-dim": "#cec5bf",
        "secondary-fixed": "#eae1da",
        "on-secondary": "#ffffff",
        "on-error": "#ffffff",
        "inverse-surface": "#33302c",
        "surface-variant": "#e8e1db",
        "primary": "#8d4b00",
        "on-primary-fixed": "#2f1500"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
