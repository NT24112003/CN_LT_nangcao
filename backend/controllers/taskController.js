const Task = require('../models/taskModal');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const cloudinary = require('../middlewares/uploadFile/cloudinary');
const axios = require('axios');
const mongoose = require('mongoose');


class taskController {
  async createTask(req, res) {
    try {
      // Lấy thông tin từ form
      const { title, description, assignedBy, assignedTo, startTime, endTime } = req.body;
      const file = req.file;  // file từ Multer middleware

      if (!title || !description || !assignedTo || !startTime || !endTime) {
        return res.status(400).json({ message: "Thiếu thông tin cần thiết để tạo task" });
      }

      let status = 'pending';  // Mặc định là 'pending'
      const currentTime = new Date();
      const taskStartTime = new Date(startTime);
      const taskEndTime = new Date(endTime);

      if (taskStartTime > currentTime) {
        status = 'pending';
      } else if (taskStartTime <= currentTime && taskEndTime >= currentTime) {
        status = 'in-progress';
      } else if (taskEndTime < currentTime) {
        // Nếu đã quá hạn, kiểm tra file đã nộp
        if (!req.body.submittedFile || req.body.submittedFile.length === 0) {
          status = 'overdue';  // Quá hạn mà chưa nộp
        } else {
          status = 'submitted';  // Đã nộp
        }
      }

      // Nếu có file, upload lên Cloudinary
      let receivedFiles = [];
      if (file) {
        const fileSize = file.size;

        // Sử dụng upload_stream để upload file lên Cloudinary
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', public_id: file.originalname.split('.')[0] },  // Tự động nhận diện loại file
          async (error, result) => {
            if (error) {
              console.error('Error uploading to Cloudinary:', error);
              return res.status(500).json({ message: "Lỗi khi tải lên Cloudinary", error });
            }
            const fileExtension = result.format;

            // Lưu thông tin file vào receivedFiles
            receivedFiles.push({
              filename: result.public_id + '.' + fileExtension,
              url: result.secure_url,
              format: fileExtension,
              size: fileSize,
            });

            // Lưu thông tin task vào database
            const newTask = new Task({
              title,
              description,
              assignedBy,
              assignedTo,
              startTime,
              endTime,
              status,  // Gán trạng thái tính toán vào task
              receivedFiles,
            });

            // Lưu task vào cơ sở dữ liệu
            await newTask.save();
            console.log("Task created successfully:", newTask);
            // Trả về phản hồi thành công
            res.redirect("/home?success=true");
          }
        ).end(file.buffer);
      } else {
        // Nếu không có file, tạo task mà không có trường receivedFiles
        const newTask = new Task({
          title,
          description,
          assignedBy,
          assignedTo,
          startTime,
          endTime,
          status,  // Gán trạng thái tính toán vào task
          receivedFiles,
        });

        // Lưu task vào cơ sở dữ liệu
        await newTask.save();
        console.log("Task created successfully:", newTask);
        // Trả về phản hồi thành công
        res.redirect("/home?success=true");
      }

    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Lỗi khi tạo task", error });
    }
  }




  updateTask(req, res) {

  }
  async deleteTask(req, res) {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Không tìm thấy nhiệm vụ' });
      }
      res.json({ message: 'Đã thu hồi nhiệm vụ thành công' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi server khi thu hồi nhiệm vụ' });
    }
  }
  async patchTask(req, res) {
    try {
      const { endTime, reason } = req.body;

      // Kiểm tra xem có dữ liệu không
      if (!endTime || !reason) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
      }

      // Cập nhật endTime của nhiệm vụ
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        {
          endTime: new Date(endTime), // Chuyển đổi thành dạng Date
          $push: { // Thêm lý do gia hạn vào lịch sử
            history: { reason, endTime, date: new Date() }
          }
        },
        { new: true }
      );
      console.log("Task updated successfully:", task);

      if (!task) {
        return res.status(404).json({ message: 'Nhiệm vụ không tìm thấy' });
      }

      res.json({ message: 'Gia hạn thành công', task });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi server khi gia hạn' });
    }
  }

  async submitTask(req, res) {
    try {
      const taskId = req.params.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "Vui lòng chọn file để nộp" });
      }

      const fileSize = file.size;

      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', public_id: file.originalname.split('.')[0] },
        async (error, result) => {
          if (error) {
            console.error('Lỗi khi tải lên Cloudinary:', error);
            return res.status(500).json({ message: "Lỗi khi tải lên Cloudinary", error });
          }

          const fileExtension = result.format;

          const submittedFileData = {
            filename: result.public_id + '.' + fileExtension,
            url: result.secure_url,
            format: fileExtension,
            size: fileSize,
            submittedAt: new Date()
          };

          // Cập nhật task
          const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
              $push: {
                submittedFile: submittedFileData,
                history: {
                  action: 'Nộp bài',
                  user: req.user?.email || 'unknown',
                  timestamp: new Date()
                }
              },
              status: 'submitted'
            },
            { new: true }
          );

          console.log("Task updated:", updatedTask);
          res.status(200).json({ message: "Nộp bài thành công", task: updatedTask });
        }
      );

      stream.end(file.buffer);

    } catch (error) {
      console.error("Lỗi khi nộp bài:", error);
      res.status(500).json({ message: "Lỗi khi nộp bài", error });
    }
  }


  async searchListFile(req, res) {
    try {
      const token = req.cookies?.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      const user = await User.findById(userId);
  
      const { title, date } = req.body;

      const matchConditions = [];
  
      matchConditions.push({ assignedBy: user.email });
  
      // Regex tìm tên file nếu có từ khóa
      if (title) {
        const searchRegex = new RegExp(title, 'i');
        matchConditions.push({ 'submittedFile.filename': searchRegex });
      }
  
      // Tạo startOfDay và endOfDay thủ công nếu có ngày
      let start, end;
      if (date) {
        const selectDate = new Date(date);
        start = new Date(selectDate.setHours(0, 0, 0, 0));
        end = new Date(selectDate.setHours(23, 59, 59, 999));
  
        matchConditions.push({
          'submittedFile.submittedAt': {
            $gte: start,
            $lte: end,
          },
        });
      }
  
      // Tìm task khớp điều kiện
      const tasks = await Task.find({
        $and: matchConditions,
        submittedFile: { $exists: true, $ne: [] },
      });
  
      // Lọc ra file đúng điều kiện trong submittedFile
      const filteredFiles = [];
      for (const task of tasks) {
        const matchedFiles = task.submittedFile.filter(file => {
          const matchesTitle = title ? file.filename.toLowerCase().includes(title.toLowerCase()) : true;
          const matchesDate = date ? (
            new Date(file.submittedAt) >= start && new Date(file.submittedAt) <= end
          ) : true;
          return matchesTitle && matchesDate;
        });
  
        filteredFiles.push(...matchedFiles);
      }
  
      res.json(filteredFiles);
    } catch (error) {
      console.error("Error searching file:", error);
      res.status(500).json({ message: "Lỗi khi tìm kiếm file", error });
    }
  }
  
  async searchListTask(req, res) {
    try {
      const token = req.cookies?.token;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      const user = await User.findById(userId);

      // Xây dựng query để lọc nhiệm vụ của người dùng trước khi áp dụng các điều kiện tìm kiếm
      const { title, status, date } = req.query;
      const query = { assignedBy: user.email };  // Lọc nhiệm vụ theo người giao

      if (title) {
        query.title = { $regex: title, $options: "i" };  // Tìm kiếm theo tiêu đề
      }

      if (status) {
        const statusMap = {
          "Hoàn thành": "completed",
          "Đang làm": "in-progress",
          "Chưa bắt đầu": "pending",
          "Quá hạn": "overdue"
        };
        query.status = statusMap[status] || status;  // Ánh xạ trạng thái
      }

      if (date) {
        const selectDate = new Date(date);
        const nextDate = new Date(date);
        nextDate.setDate(selectDate.getDate() + 1);
        query.startTime = {  // Lọc theo thời gian bắt đầu
          $gte: selectDate,
          $lt: nextDate
        };
      }

      // Tìm các nhiệm vụ với query đã xây dựng
      const tasks = await Task.find(query).sort({ createdAt: -1 });
    

      res.json(tasks);
    } catch (error) {
      console.error("Error searching tasks:", error);
      res.status(500).json({ message: "Lỗi khi tìm kiếm task", error });
    }
  }

  async downloadFile(req, res) {
    try {

      const { id } = req.params; // Lấy ID từ params

      // Chuyển ID từ chuỗi thành ObjectId
      const objectId = new mongoose.Types.ObjectId(id);

      const task = await Task.findOne({ "submittedFile._id": objectId });


      if (!task) {
        return res.status(404).send("File not found");
      }

      const file = task.submittedFile.find(f => f._id.toString() === id); // Lấy thông tin tệp

      if (!file) {
        return res.status(404).send("File not found in task");
      }

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
    } catch (error) {
      console.error("Lỗi khi tải file:", error);
      res.status(500).send("Lỗi khi tải file");
    }
  }

  async deleteFile(req, res) {
    try {
      const { id } = req.params;

      // Chuyển ID từ chuỗi thành ObjectId
      const objectId = new mongoose.Types.ObjectId(id);

      const task = await Task.findOne({ "submittedFile._id": objectId });

      if (!task) {
        return res.status(404).send("File not found");
      }

      // Tìm và xóa tệp trong mảng submittedFile
      const fileIndex = task.submittedFile.findIndex(f => f._id.toString() === id);

      if (fileIndex !== -1) {
        const fileToDelete = task.submittedFile[fileIndex];

        // Xóa tệp khỏi cơ sở dữ liệu
        task.submittedFile.splice(fileIndex, 1);

        // Xóa tệp trên Cloudinary bằng public_id
        const publicId = fileToDelete.url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);

        await task.save();

        // Chỉ gọi res.json một lần, sau khi tất cả các tác vụ hoàn tất
        return res.json({ message: "File deleted successfully" });
      }

      return res.status(404).send("File not found in task");
    } catch (error) {
      console.error("Lỗi khi xóa file:", error);
    }
  }




    async stats(req, res) {

      const { timeframe, user } = req.body;
      try{  

          // Lọc theo người dùng nếu có
          const query = {};
          if (user) {
            query.assignedTo = user;
          }
      
          // Lọc theo khoảng thời gian (7 ngày gần đây, tháng này,...)
          if (timeframe === '7days') {
            const date = new Date();
            date.setDate(date.getDate() - 6); // Từ 7 ngày trước
            query.createdAt = { $gte: date };
          } else if (timeframe === '30days') {
            const date = new Date();
            date.setDate(date.getDate() - 29);
            query.createdAt = { $gte: date };
          }
      
          const tasks = await Task.find(query);
          // Thống kê trạng thái
          const statusStats = {
            'in-progress': 0,
            pending: 0,
            overdue: 0,
            submitted: 0
          };
      
          const dayStats = { T2: 0, T3: 0, T4: 0, T5: 0, T6: 0, T7: 0, CN: 0 };
      
          tasks.forEach(task => {
            if (statusStats[task.status] !== undefined) {
              statusStats[task.status]++;
            }
      
            if ( task.status === 'submitted' && task.updatedAt) {
              const day = new Date(task.updatedAt).getDay(); 
              const key = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day];
              dayStats[key]++;
            }
          });
          res.json({ statusStats, dayStats });
      
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Lỗi khi lấy thống kê' });
        }
      }
    
  }



module.exports = new taskController();