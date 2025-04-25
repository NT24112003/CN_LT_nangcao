const Event = require("../models/eventModel")
const User = require("../models/userModel")
const Task = require("../models/taskModal")
const jwt = require("jsonwebtoken");
const path = require("path")
const axios = require("axios")

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
            const confideTask = await Task.find();
            if (!eventsList) {
                eventsList = {
                    email: user.email,
                    events: [],
                    todolist: []
                };
            }
            res.json(confideTask);

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
            let tasks = await Task.find({ assignedBy: user.email });


            if (!eventsList) {
                eventsList = {
                    email: user.email,
                    events: [],
                    todolist: []
                };
            }
            const events = eventsList.events;

            res.render("views/pages/home", { title: "Home Page", user, eventsList, tasks });

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
            let eventsList = await Event.findOne({ email: user.email });

            // xử lí lịch hiện thị theo ngày
            const events = eventsList.events;
            const toLocalDate = (isoString) => {
                const date = new Date(isoString);
                const tzOffset = date.getTimezoneOffset() * 60000;
                const localDate = new Date(date - tzOffset);
                return localDate.toISOString().substring(0, 10);
            };
            if (!eventsList) {
                eventsList = {
                    email: user.email,
                    events: [],
                    todolist: []
                };
            }
            const eventsByDate = {};

            events.forEach(event => {
                const dateStr = toLocalDate(event.startTime);
                if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
                eventsByDate[dateStr].push(event);
            });
            const remindersStatus = eventsList.events.map(event => event.reminderEnabled);
            res.render("views/pages/calendar", { title: "Calender", user, eventsList, eventsByDate, remindersStatus });
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
            let eventsList = await Event.findOne({ email: user.email });
            let entrustedEvents = await Task.find({ assignedTo: user.email });

            // Nếu không có sự kiện, tạo eventsList mặc định
            if (!eventsList) {
                eventsList = {
                    email: user.email,
                    events: [],
                    todolist: []
                };
            }
            const events = eventsList.events;



            //  nhóm sự kiện theo ngày
            const eventsByDate = {};

            // TINH TOAN DATE
            // Chuyển đổi thời gian UTC sang giờ địa phương
            const toLocalDate = (isoString) => {
                const date = new Date(isoString);
                const tzOffset = date.getTimezoneOffset() * 60000;
                const localDate = new Date(date - tzOffset);
                return localDate.toISOString().substring(0, 10);
            };
            // TASK:
            // Lấy danh sách sự kiện được ủy quyền
            entrustedEvents.forEach(event => {
                let dateStr = toLocalDate(event.startTime);
                if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
                eventsByDate[dateStr].push(event);
            });
            // EVENT
            // Lấy danh sách sự kiện của người dùng
            events.forEach(event => {
                let dateStr = toLocalDate(event.startTime);
                if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
                eventsByDate[dateStr].push(event);
            });


            // Tính toán thông tin cho lịch
            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0);
            const startDay = (firstDay.getDay() + 6) % 7; // Bắt đầu từ Chủ nhật
            const totalDays = lastDay.getDate();
            const totalCells = Math.ceil((startDay + totalDays) / 7) * 7;





            // Trả về dữ liệu lịch và sự kiện
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

    async confideTaskShow(req, res) {

        try {
            const token = req.cookies?.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // lấy user
            const userId = decoded.id;
            const user = await User.findById(userId);
            // lấy event
            const eventsList = await Event.findOne({ email: user.email });
            res.render("views/pages/confideTask", { title: "confideTask", eventsList, user });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy danh sách event", error });
            //  res.redirect("/auth/login")
        }
    }
    async taskManagerShow(req, res) {

        try {
            const token = req.cookies?.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // lấy user
            const userId = decoded.id;
            const user = await User.findById(userId);
            // lấy event
            const eventsList = await Event.findOne({ email: user.email });
            let tasks = await Task.find({ assignedBy: user.email });

            res.render("views/pages/taskManager", { title: "taskManager", eventsList, user, tasks });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy danh sách event", error });
            //  res.redirect("/auth/login")
        }
    }
    async taskManagerDataShow(req, res) {

        try {
            const token = req.cookies?.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // lấy user
            const userId = decoded.id;
            const user = await User.findById(userId);
            // lấy event
            const eventsList = await Event.findOne({ email: user.email });
            let tasks = await Task.find({ assignedBy: user.email });

            res.json(tasks)


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




async downloadFile(req, res) {
    try {
        const task = await Task.findOne({ "receivedFiles._id": req.params.id });

        if (!task) return res.status(404).send("Không tìm thấy task");

        const file = task.receivedFiles.find(f => f._id.toString() === req.params.id);

        if (!file) return res.status(404).send("Không tìm thấy file");

        // Tải file từ Cloudinary
        const response = await axios.get(file.url, { responseType: "stream" });

        // Set tên file tải về đúng định dạng
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${encodeURIComponent(file.filename)}"`
        );

        // Set loại nội dung của file từ phản hồi của Cloudinary
        res.setHeader('Content-Type', response.headers['content-type']);

        // Gửi stream về cho client
        response.data.pipe(res);

    } catch (err) {
        console.error("Lỗi khi tải file:", err);
        res.status(500).send("Lỗi khi tải file");
    }
}
}

module.exports = new homeController;