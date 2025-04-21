const jwt = require("jsonwebtoken");
const Event = require("../models/eventModel");
const User = require("../models/userModel");

class EventController {
   
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
      const id = req.params.id;

      const token = req.cookies?.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      const eventsList = await Event.findOne({ email: user.email });
      const event = eventsList.events.find(e => e.id === id);

      // Sắp xếp sự kiện theo startTime
      const sortedEvents = eventsList.events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

      const index = sortedEvents.findIndex(e => e.id === id);

      const prevEvent = index > 0 ? sortedEvents[index - 1] : null;
      const nextEvent = index < sortedEvents.length - 1 ? sortedEvents[index + 1] : null;
      res.render("views/pages/details", {
         title: "Home Page", event,
         prevEventId: prevEvent?.id,
         nextEventId: nextEvent?.id
      });
   } catch (error) {
      console.error(error);
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
      const events = await Event.findOneAndUpdate(
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
   const { minutes, email, targetDate } = req.body;
   try {
     if (!minutes || !email || !targetDate) {
       return res.status(400).json({ error: 'Thiếu thông tin' });
     }
 
     const token = req.cookies?.token;
     const decoded = jwt.verify(token, process.env.JWT_SECRET);
     const user = await User.findById(decoded.id);
     const eventsList = await Event.findOne({ email: user.email });
 
     if (!eventsList || !Array.isArray(eventsList.events)) {
       return res.status(404).json({ error: 'Không tìm thấy danh sách sự kiện' });
     }
 
     let updatedCount = 0;
 
     eventsList.events.forEach(ev => {
      console.log("ev.date:", ev.startTime);
       const eventDate = new Date(ev.startTime).toISOString().split("T")[0];
       if (eventDate === targetDate) {
         ev.reminderMinutes = minutes;
         ev.reminderEmail = email;
         ev.reminderEnabled = true;
         updatedCount++;
       }
     });
 
     if (updatedCount === 0) {
       return res.status(404).json({ error: 'Không có sự kiện nào trong ngày này' });
     }
 
     await eventsList.save();
 
     console.log("Đã cập nhật nhắc nhở cho ${updatedCount} sự kiện vào ngày ${targetDate}");
 
     return res.json({ success: true, updatedEvents: updatedCount });
 
   } catch (err) {
     console.error("Lỗi khi lưu nhắc nhở:", err);
     return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
   }
 }
 

   async disableNotification(req, res) {
      const { targetDate } = req.body;
      console.log("req.body", req.body);
      try {
        if (!targetDate) {
          return res.status(400).json({ error: 'Thiếu thông tin' });
        }
    
        const token = req.cookies?.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        const eventsList = await Event.findOne({ email: user.email });
    
        if (!eventsList || !Array.isArray(eventsList.events)) {
          return res.status(404).json({ error: 'Không tìm thấy danh sách sự kiện' });
        }
    
        let updatedCount = 0;
    
        eventsList.events.forEach(ev => {
         console.log("ev.date:", ev.startTime);
          const eventDate = new Date(ev.startTime).toISOString().split("T")[0];
          if (eventDate === targetDate) {
            ev.reminderEnabled = false;
            updatedCount++;
          }
        });
    
        if (updatedCount === 0) {
          return res.status(404).json({ error: 'Không có sự kiện nào trong ngày này' });
        }
    
        await eventsList.save();
    
        console.log("Đã cập nhật nhắc nhở cho ${updatedCount} sự kiện vào ngày ${targetDate}");
    
        return res.json({ success: true, updatedEvents: updatedCount });
    
      } catch (err) {
        console.error("Lỗi khi lưu nhắc nhở:", err);
        return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
      }
   }


}

module.exports = new EventController();
