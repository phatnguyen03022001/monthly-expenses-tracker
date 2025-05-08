/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs', // Quét tất cả các tệp .ejs trong thư mục views
    './public/**/*.html', // Nếu bạn có các tệp HTML khác
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
