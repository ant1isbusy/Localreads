/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['"EB Garamond"', 'serif'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                accent: {
                    DEFAULT: '#3A7AFF',
                    light: '#E8F0FF',
                },
            },
        },
    },
    plugins: [],
}