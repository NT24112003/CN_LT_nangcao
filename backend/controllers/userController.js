const User = require("../models/userModel")

class userController {

    async getUser(req, res) {
        try {
            const user = await User.findById(req.user.id);
            console.log(user)
            res.render("views/pages/profile", { user });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy danh sách user", error });
        }
    }
    logout(req, res) {
        res.clearCookie('token'); // Xóa token cookie
        req.session?.destroy(() => { // Nếu bạn dùng session
            res.status(200).json({ message: "Đã logout" });
        });
    }
    async upateUser(req, res) {
        try {
            const { name, age, email, oldPassword, newPassword } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(404).send('Không tìm thấy người dùng.');
            // Validation
            if (!name || name.length > 20) return res.status(400).send('Tên không hợp lệ.');
            if (age && age >= 100) return res.status(400).send('Tuổi không hợp lệ.');

                if(oldPassword!== user.password) return res.status(400).send('Mật khẩu cũ không đúng.')
                if (oldPassword === newPassword) return res.status(400).send('Mật khẩu mới phải khác mật khẩu cũ.');
            
            user.name = name;
            user.age = age;
            user.password = newPassword;
            await user.save();
            res.redirect('/home');

        } catch (error) {
            res.status(500).json({ message: "Lỗi khi cập nhật user", error });
        }
    }
}
module.exports = new userController;