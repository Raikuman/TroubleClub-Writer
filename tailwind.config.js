/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "pages/conversations.html", "pages/interactions.html"],
    theme: {
        extend: {
            colors: {
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