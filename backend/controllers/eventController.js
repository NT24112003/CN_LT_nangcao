const jwt = require("jsonwebtoken");
const Event = require("../models/eventModel");
const User = require("../models/userModel");


class eventController {
   async getEvent(req, res) {

      try {
         const events = await Event.find();
         res.render("views/pages/home", { title: "Home Page", events });
      } catch (error) {
         res.status(500).json({ message: "Lỗi khi lấy danh sách event", error });
      }
   }

   async getEventDetails(req, res) {
      try {
         const events = await Event.find();
         res.render("views/pages/details", { title: "Home Page", events });
      }catch (error) {
         res.status(500).json({ message: "Lỗi khi lấy danh sách event details", error });
      }
   }
   async createEvent(req, res) {

      try {
         const token = req.cookies?.token;
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         const user = await User.findById(decoded.id);
         const email = user.email;
         if (!email) {
            return res.status(401).send("User not authenticated");
         }

         const { title, description, startTime, endTime, date } = req.body;


         const startDateTime = new Date(`${date}T${startTime}`);
         const endDateTime = new Date(`${date}T${endTime}`);

         const newEvent = {
            id: Date.now(),
            title,
            description,
            startTime: startDateTime,
            endTime: endDateTime
         };

         // Tìm người dùng theo email và push sự kiện mới vào danh sách events
         const updatedUser = await Event.findOneAndUpdate(
            { email },
            { $push: { events: newEvent } },
            { new: true, upsert: true }
         );
         await updatedUser.save();
         res.redirect("/home");
      } catch (error) {
         console.error("Lỗi tạo sự kiện:", error);
         res.status(500).send("Có lỗi xảy ra khi tạo sự kiện");
      }
   };


   async updateEvent(req, res) {
      const { title, description, startTime, endTime } = req.body
      const start = new Date(startTime);
      const end = new Date(endTime);
      const eventId = req.params.id;
      console.log("Start date:", req.body);
      console.log("End date:", end);
      
      try {
         const token = req.cookies?.token;
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         const user = await User.findById(decoded.id);
         const eventsList = await Event.findOne({ email: user.email });
         const targetEvent = eventsList.events.find(ev => ev.id === eventId)
      //   console.log("targetEvent tr",targetEvent)
            targetEvent.title= title,
            targetEvent.description = description,
            targetEvent.startTime= start,
            targetEvent.endTime= end
      //   console.log("targetEvent sau",targetEvent)
         await eventsList.save()
         res.status(200).json({ message: "Cập nhật thành công" });
      } catch (err) {
         console.error(err);
         res.status(500).send("Lỗi khi cập nhật sự kiện");
      }
   }


   
   async deleteEvent(req, res) {
      try {
         const token = req.cookies?.token;
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         const user = await User.findById(decoded.id);
         const eventId = req.params.id;
   
         // Xóa sự kiện khỏi mảng events
         const events = await Event.findOneAndUpdate(
            { email: user.email },
            { $pull: { events: { id: eventId } } }, // Sử dụng $pull để xóa sự kiện khỏi mảng
            { new: true }
         );

         await events.save()

   
         res.json("đã xóa thanh công")
      } catch (err) {
         console.error("Lỗi khi xoá sự kiện:", err);
         res.status(500).send("Lỗi khi xoá sự kiện");
      }
   }
}   
module.exports = new eventController;