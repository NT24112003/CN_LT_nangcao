const ExcelJS = require('exceljs');
const Task = require('../models/taskModal'); // hoặc đường dẫn đến model thực tế

async function exportTasksToExcel(req, res) {
  try {
    const tasks = await Task.find(); 

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách nhiệm vụ');

    // Tiêu đề cột
    worksheet.columns = [
      { header: 'Tiêu đề', key: 'title', width: 30 },
      { header: 'Người giao', key: 'assignedBy', width: 25 },
      { header: 'Người nhận', key: 'assignedTo', width: 25 },
      { header: 'Ngày bắt đầu', key: 'startTime', width: 20 },
      { header: 'Ngày kết thúc', key: 'endTime', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 15 },
    ];

    // Dữ liệu
    tasks.forEach(task => {
      worksheet.addRow({
        title: task.title,
        assignedBy: task.assignedBy,
        assignedTo: task.assignedTo,
        startTime: task.startTime ? new Date(task.startTime).toLocaleString() : '',
        endTime: task.endTime ? new Date(task.endTime).toLocaleString() : '',
        status: task.status
      });
    });

    // Header cho download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=NhiemVu.xlsx');

    // Xuất file
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Lỗi xuất Excel:', err);
    res.status(500).json({ message: 'Lỗi khi xuất file Excel' });
  }
}

module.exports = { exportTasksToExcel };
