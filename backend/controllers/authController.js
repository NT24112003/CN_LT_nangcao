
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const Events = require("../models/eventModel");
const Users = require("../models/userModel");
class authController {
    getRegister(req, res) {
        res.render("views/auth/register", {
            title: "Register",
            error: req.query.error || null,
            success: req.query.success || null,
            showHeader: false,  // Tắt header
            showFooter: false,   // Tắt footer
            formData: {}
        })
    }
    async addRegister(req, res) {
        try {
            const { name, age, email, password } = req.body;
            const exists = await Users.findOne({ email: email });
    
            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: 'User này đã tồn tại!'
                 }); 
            }
            // const hashed = await bcrypt.hash(password, 10);
            const newUser = new Users({ name, age, email, password, role: "user" });
            await newUser.save();
    
            return res.json({
                success: true,
                message: 'Đăng ký thành công! Hãy đăng nhập để tiếp tục.'
            });
    
        } catch (error) {
            console.error("Error: ", error);
            return res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi đăng ký!'
            });
        }
    }
    getLogin(req, res) {
        res.render("views/auth/login", {
            title: "Login",
            error: req.flash('error')[0] || req.query.error || null,
            success: req.flash('success')[0] || req.query.success || null,
            showHeader: false,
            showFooter: false
        })
    }

    async addLogin(req, res) {
        try {
            const { email, password } = req.body;
            const user = await Users.findOne({ email });
    
            if (!user || !(bcrypt.compareSync(password, user.password) || password === user.password)) {
                req.flash('error', 'Sai tên đăng nhập hoặc mật khẩu!');
                console.log("Sai tên đăng nhập hoặc mật khẩu!");
                return res.redirect("/auth/login");
            }
    
            const token = jwt.sign(
                { id: user.id, name: user.name },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE_IN }
            );
    
            res.cookie('token', token, { httpOnly: true });
            return res.redirect("/home");
            
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            req.flash('error', 'Đã xảy ra lỗi trong quá trình đăng nhập.');
            return res.redirect("/auth/login");
        }
    }
    
    getConfirm(req, res) {
        res.render("views/auth/confirm", {
            title: "Confirm",
            showHeader: false,  // Tắt header
            showFooter: false   // Tắt footer
        })
    }
    
}
module.exports = new authController;