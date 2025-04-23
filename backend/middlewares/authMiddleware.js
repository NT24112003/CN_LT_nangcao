const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.cookies?.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next(); // ✅ nếu xác thực JWT thành công thì đi tiếp
        } catch (err) {
            console.log("Token không hợp lệ hoặc đã hết hạn");
            res.clearCookie("token");
        }
    }

    // Nếu không có token hoặc token không hợp lệ, fallback sang session
    if (req.session?.user) {
        req.user = req.session.user; 
        return next();
    }

    console.log("Không có token và session. Chuyển hướng đến trang đăng nhập.");
    return res.redirect("/auth/login");
};

module.exports = authMiddleware;
