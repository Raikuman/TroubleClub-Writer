/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./pages/**/*.html", "./components/**/*.html"],
    theme: {
        extend: {
            colors: {
                'tc-night':'#04000D',
                'tc-black':'#000714',
                'tc-blue':'#00AEFF',
                'tc-white':'#FBDBE9',
                'tc-red':'#FD016F',
                'tc-purple':'#2E0D44',
            }
        },
    },
    plugins: [],
}