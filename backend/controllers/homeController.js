const Event = require("../models/eventModel")
const User = require("../models/userModel")
const jwt = require("jsonwebtoken");


class homeController {
    async dataShow(req, res) {
        try {

            const token = req.cookies?.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // lấy user
            const userId = decoded.id;
            const user = await User.findById(userId);
            // lấy event
            const eventsList = await Event.findOne({ email: user.email });
            res.json(eventsList);

        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy danh sách event", error });
            //  res.redirect("/auth/login")
        }
    }
    async homeShow(req, res) {
        try {

            const token = req.cookies?.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // lấy user
            const userId = decoded.id;
            const user = await User.findById(userId);
            // lấy event
            let eventsList = await Event.findOne({ email: user.email });

            if (!eventsList) {
                // KHÔNG cần dùng new Event() — chỉ cần object thường
                eventsList = {
                    email: user.email,
                    events: [],
                    todolist: []
                };
            }
            // xử lí lịch hiện thị theo ngày
            const events = eventsList.events;
            const eventsByDate = {};
            events.forEach(event => {
                const dateStr = new Date(event.startTime).toISOString().substring(0, 10);
                if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
                eventsByDate[dateStr].push(event);
            });

            res.render("views/pages/home", { title: "Home Page", user, eventsList, eventsByDate });

        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy danh sách event", error });
            //  res.redirect("/auth/login")
        }
    }
    async calendarShow(req, res) {
        try {

            const token = req.cookies?.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // lấy user
            const userId = decoded.id;
            const user = await User.findById(userId);
            // lấy event
            const eventsList = await Event.findOne({ email: user.email });

              // xử lí lịch hiện thị theo ngày
              const events = eventsList.events;
              const eventsByDate = {};
              events.forEach(event => {
                  const dateStr = new Date(event.startTime).toISOString().substring(0, 10);
                  if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
                  eventsByDate[dateStr].push(event);
              });
              const remindersStatus = eventsList.events.map(event => event.reminderEnabled);
              console.log("eventsList:",remindersStatus);
            res.render("views/pages/calendar", { title: "Calender",user, eventsList,eventsByDate,remindersStatus });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy danh sách event", error });
            //  res.redirect("/auth/login")
        }

    }
    async calendarShowData(req, res) {
        try {
            const { month, year } = req.query;

            const token = req.cookies?.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            const eventsList = await Event.findOne({ email: user.email });

            const events = eventsList.events;
            const eventsByDate = {};
            events.forEach(event => {
                const dateStr = new Date(event.startTime).toISOString().substring(0, 10);
                if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
                eventsByDate[dateStr].push(event);
            });

            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0);
            const startDay = (firstDay.getDay() + 6) % 7;
            const totalDays = lastDay.getDate();
            const totalCells = Math.ceil((startDay + totalDays) / 7) * 7;

            res.json({ year, month, eventsByDate, totalCells, startDay, totalDays });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy danh sách event", error });
        }
    }
    async todolistShow(req, res) {

        try {
            const token = req.cookies?.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // lấy user
            const userId = decoded.id;
            const user = await User.findById(userId);
            // lấy event
            const eventsList = await Event.findOne({ email: user.email });
            res.render("views/pages/todolist", { title: "Todolist", eventsList });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy danh sách event", error });
            //  res.redirect("/auth/login")
        }
    }

    async planShow(req, res) {

        try {

            const token = req.cookies?.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // lấy user
            const userId = decoded.id;
            const user = await User.findById(userId);
            // lấy event
            const eventsList = await Event.findOne({ email: user.email });
            res.render("views/pages/plan", { title: "plan", eventsList });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy danh sách event", error });
            //  res.redirect("/auth/login")
        }
    }
    async profileShow(req, res) {
        const token = req.cookies?.token;
        try {
            // ✅ Giải mã token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;
            const user = await User.findById(userId);
            res.render("views/pages/profile", { title: "Profile", user });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy danh sách user", error });
        }
    }
}
module.exports = new homeController;