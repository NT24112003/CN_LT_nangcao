const jwt = require("jsonwebtoken");
const Event = require("../models/eventModel");
const User = require("../models/userModel");

class notificationController {
       async setNotification(req, res) {
          const { minutes, email, id, reminderEnabled } = req.body;
          console.log("du lieu leen :", req.body);
          try {
            // Xác thực token và lấy thông tin người dùng
            const token = req.cookies?.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            const eventsList = await Event.findOne({ email: user.email });
             const targetEvent = eventsList.events.find(ev => ev.id === id);
             if (!targetEvent) {
                return res.status(404).json({ error: "Không tìm thấy sự kiện" });
             }
    
                targetEvent.reminderMinutes = minutes;
                targetEvent.reminderEmail = email;
                targetEvent.reminderEnabled = true;
        
            await eventsList.save();
        
        
            return res.json({ success: true });
          } catch (err) {
            console.error("Lỗi khi lưu nhắc nhở:", err);
            return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
          }
        }
        
    
    
        async disableReminder(req, res) {
          const { id, reminderEnabled } = req.body;
          console.log("du lieu leen :", req.body);
          try {
            // Xác thực token và lấy thông tin người dùng
            const token = req.cookies?.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            const eventsList = await Event.findOne({ email: user.email });
             const targetEvent = eventsList.events.find(ev => ev.id === id);
             if (!targetEvent) {
                return res.status(404).json({ error: "Không tìm thấy sự kiện" });
             }
                targetEvent.reminderEnabled = false;
        
            await eventsList.save();
        
        
            return res.json({ success: true });
          } catch (err) {
            console.error("Lỗi khi lưu nhắc nhở:", err);
            return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
          }
        }

       
        
}
module.exports = new notificationController();