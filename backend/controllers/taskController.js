const Task = require('../models/taskModal');

class taskController{
    async createTask(req, res) {
        try {
           
            const {
                title,
                description,
                assignedBy,
                assignedTo,
                startTime,
                deadline
            } = req.body;
            if (!title || !description || !assignedBy || !assignedTo || !startTime || !deadline) {
                return res.status(400).json({ message: "Thiếu thông tin cần thiết để tạo task" });
            }
            // Tạo task mới với các trường bổ sung
            const newTask = new Task({
                title,
                description,
                assignedBy,
                assignedTo,
                startTime,
                deadline,
                status: "pending", 
                history: [
                    {
                        action: "assigned",
                        user: assignedBy,
                        timestamp: new Date(startTime)
                    }
                ],
                reminderSent: false
            });

            // Lưu task vào cơ sở dữ liệu
            await newTask.save();
            console.log("Task created successfully:", newTask);
            // Phản hồi thành công
            res.status(201).json({ message: "Task created successfully", task: newTask });
        } catch (error) {
            console.error("Error creating task:", error);
            res.status(500).json({ message: "Lỗi khi tạo task", error });
        }
    }
    updateTask(req,res){
        
    }
    deleteTask(req,res){
        
    }

}

module.exports = new taskController();