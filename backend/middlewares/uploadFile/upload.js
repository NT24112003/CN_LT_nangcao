// middlewares/upload.js
const multer = require('multer');

// Cấu hình Multer để lưu tạm file vào bộ nhớ
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = upload;
