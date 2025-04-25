const jwt = require("jsonwebtoken");
const Event = require("../models/eventModel");
const User = require("../models/userModel");
const Task = require("../models/taskModal")


function buildLocalDateTime(dateStr, timeStr) {
   const [year, month, day] = dateStr.split('-').map(Number);
   const [hour, minute] = timeStr.split(':').map(Number);
   return new Date(year, month - 1, day, hour, minute);
 }

class EventController {

   

   async getEvent(req, res) {

      try {
         const events = await Event.find();
         
         res.render("views/pages/home", { title: "Home Page", events });
      } catch (error) {
         res.status(500).json({ message: "Lỗi khi lấy danh sách event", error });
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


        const startDateTime = buildLocalDateTime(date, startTime);
      const endDateTime = buildLocalDateTime(date, endTime);
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
         targetEvent.title = title,
            targetEvent.description = description,
            targetEvent.startTime = start,
            targetEvent.endTime = end
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
         const events = await Event.find(
            { email: user.email },
            { $pull: { events: { id: eventId } } },
            { new: true }
         );

         await events.save()


         res.json("đã xóa thanh công")
      } catch (err) {
         console.error("Lỗi khi xoá sự kiện:", err);
         res.status(500).send("Lỗi khi xoá sự kiện");
      }
   }
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
    

    async getEventDetails(req, res) {
    try {
        const id = req.params.id;

        // Xác thực người dùng
        const token = req.cookies?.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        // Lấy danh sách sự kiện và nhiệm vụ
        const eventsList = await Event.findOne({ email: user.email }).lean();
        const entrustedTasks = await Task.find({ assignedTo: user.email }).lean();

        // Chuẩn hóa dữ liệu sự kiện
        const events = eventsList.events.map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            startTime: event.startTime,
            endTime: event.endTime,
            assignedBy: null, 
            receivedFiles: [],
            type: 'event' 
        }));

        // Chuẩn hóa dữ liệu nhiệm vụ
        const tasks = entrustedTasks.map(task => ({
            id: task._id.toString(),
            title: task.title,
            description: task.description,
            startTime: task.startTime,
            endTime: task.deadline || task.startTime, // Nếu không có deadline, dùng startTime
            assignedBy: task.assignedBy, 
            receivedFiles: task.receivedFiles || [] ,
            type: 'task' 
        }));

        // Kết hợp và sắp xếp danh sách
        const combinedEvents = [...events, ...tasks].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        // Tìm sự kiện hiện tại, sự kiện trước và sự kiện tiếp theo
        const index = combinedEvents.findIndex(e => e.id === id);
        const event = combinedEvents[index];
        const prevEvent = index > 0 ? combinedEvents[index - 1] : null;
        const nextEvent = index < combinedEvents.length - 1 ? combinedEvents[index + 1] : null;
        console.log(combinedEvents);
        // Render giao diện
        res.render("views/pages/details", {
            title: "Home Page",
            event,
            prevEventId: prevEvent?.id,
            nextEventId: nextEvent?.id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách event details", error });
    }
}


     
}

module.exports = new EventController();
