    // Dữ liệu nhiệm vụ
    const tasks = [
      {
        id: 1,
        title: "Viết báo cáo",
        startDate: "10/04",
        endDate: "13/04",
        dateRange: "10/04 - 13/04",
        assignee: "user@gmail.com",
        status: "Đang làm",
        priority: "Cao",
        progress: 65,
        description: "Viết báo cáo tổng kết hoạt động quý 1 năm 2025.",
        notes: "Cần bổ sung phần phân tích đánh giá kết quả."
      },
      {
        id: 2,
        title: "Thiết kế banner",
        startDate: "15/04",
        endDate: "20/04",
        dateRange: "15/04 - 20/04",
        assignee: "designer@gmail.com",
        status: "Chưa bắt đầu",
        priority: "Trung bình",
        progress: 0,
        description: "Thiết kế banner quảng cáo cho sự kiện sắp tới.",
        notes: "Tuân thủ theo hướng dẫn thiết kế của công ty."
      },
      {
        id: 3,
        title: "Cập nhật website",
        startDate: "08/04",
        endDate: "12/04",
        dateRange: "08/04 - 12/04",
        assignee: "developer@gmail.com",
        status: "Hoàn thành",
        priority: "Cao",
        progress: 100,
        description: "Cập nhật nội dung và giao diện trang chủ website.",
        notes: "Đã hoàn thành và đưa lên môi trường production."
      }
    ];
    
    // Dữ liệu file đã nộp
    const files = [
      {
        id: 1,
        name: "report.docx",
        uploader: "user@gmail.com",
        uploadDate: "13/04"
      },
      {
        id: 2,
        name: "banner_design.psd",
        uploader: "designer@gmail.com",
        uploadDate: "17/04"
      },
      {
        id: 3,
        name: "website_update.zip",
        uploader: "developer@gmail.com",
        uploadDate: "12/04"
      }
    ];
    
    // Biến lưu trữ nhiệm vụ và file hiện tại đang được xem
    let currentTaskId = null;
    let currentFileId = null;
    
    // Hiển thị danh sách nhiệm vụ
    function renderTasks() {
      const taskList = document.getElementById('taskList');
      taskList.innerHTML = '';
      
      tasks.forEach(task => {
        const row = document.createElement('tr');
        row.className = 'task-item';
        
        // Tạo badge dựa vào trạng thái
        let statusBadge = '';
        if (task.status === 'Hoàn thành') {
          statusBadge = '<span class="badge badge-success">Hoàn thành</span>';
        } else if (task.status === 'Đang làm') {
          statusBadge = '<span class="badge badge-warning">Đang làm</span>';
        } else if (task.status === 'Quá hạn') {
          statusBadge = '<span class="badge badge-danger">Quá hạn</span>';
        } else {
          statusBadge = '<span class="badge badge-info">Chưa bắt đầu</span>';
        }
        
        row.innerHTML = `
          <td>${task.title}</td>
          <td>${task.dateRange}</td>
          <td><span class="user-email">${task.assignee}</span></td>
          <td>${statusBadge}</td>
          <td class="text-center"><span class="detail-link" onclick="showTaskDetail(${task.id})">[Chi tiết]</span></td>
        `;
        taskList.appendChild(row);
      });
    }
    
    // Hiển thị danh sách file
    function renderFiles() {
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = '';
      
      files.forEach(file => {
        const row = document.createElement('tr');
        row.className = 'file-item';
        
        // Xác định biểu tượng file dựa trên loại file
        let fileIcon = 'fas fa-file';
        if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
          fileIcon = 'fas fa-file-word';
        } else if (file.name.endsWith('.pdf')) {
          fileIcon = 'fas fa-file-pdf';
        } else if (file.name.endsWith('.psd')) {
          fileIcon = 'fas fa-file-image';
        } else if (file.name.endsWith('.zip') || file.name.endsWith('.rar')) {
          fileIcon = 'fas fa-file-archive';
        }
        
        row.innerHTML = `
          <td><span class="user-email">${file.uploader}</span></td>
          <td><i class="${fileIcon} me-2"></i>${file.name}</td>
          <td>${file.uploadDate}</td>
          <td class="text-center"><a href="#" class="action-icon"><i class="fas fa-link"></i></a></td>
          <td class="text-center"><a href="#" class="action-icon delete-icon" onclick="confirmDeleteFile(${file.id}, '${file.name}')"><i class="fas fa-trash"></i></a></td>
        `;
        fileList.appendChild(row);
      });
    }
    
    // Hiển thị chi tiết nhiệm vụ
    function showTaskDetail(taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      currentTaskId = taskId;
      
      // Tạo badge dựa vào trạng thái
      let statusBadge = '';
      if (task.status === 'Hoàn thành') {
        statusBadge = '<span class="badge badge-success">Hoàn thành</span>';
      } else if (task.status === 'Đang làm') {
        statusBadge = '<span class="badge badge-warning">Đang làm</span>';
      } else if (task.status === 'Quá hạn') {
        statusBadge = '<span class="badge badge-danger">Quá hạn</span>';
      } else {
        statusBadge = '<span class="badge badge-info">Chưa bắt đầu</span>';
      }
      
      const taskDetailContent = document.getElementById('taskDetailContent');
      taskDetailContent.innerHTML = `
        <div class="row mb-3">
          <div class="col-md-6">
            <p><strong>Tiêu đề:</strong> ${task.title}</p>
            <p><strong>Người nhận:</strong> <span class="user-email">${task.assignee}</span></p>
            <p><strong>Thời gian bắt đầu:</strong> ${task.startDate}</p>
            <p><strong>Thời gian kết thúc:</strong> ${task.endDate}</p>
          </div>
          <div class="col-md-6">
            <p><strong>Trạng thái:</strong> ${statusBadge}</p>
            <p><strong>Mức độ ưu tiên:</strong> ${task.priority}</p>
            <p><strong>Tiến độ:</strong> 
              <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${task.progress}%;" 
                  aria-valuenow="${task.progress}" aria-valuemin="0" aria-valuemax="100">
                  ${task.progress}%</div>
              </div>
            </p>
          </div>
        </div>
        <div class="mb-3">
          <h6 class="section-heading">Mô tả</h6>
          <div class="task-description">${task.description}</div>
        </div>
        <div class="mb-3">
          <h6 class="section-heading">Ghi chú bổ sung</h6>
          <div class="task-description">${task.notes}</div>
        </div>
      `;
      
      document.getElementById('taskDetailModalLabel').textContent = `Chi tiết nhiệm vụ: ${task.title}`;
      document.getElementById('currentDeadline').value = task.endDate;
      
      const taskDetailModal = new bootstrap.Modal(document.getElementById('taskDetailModal'));
      taskDetailModal.show();
    }
    
    // Mở modal gia hạn thời gian
    document.getElementById('extendDeadlineBtn').addEventListener('click', function() {
      const task = tasks.find(t => t.id === currentTaskId);
      if (!task) return;
      
      document.getElementById('extendDeadlineModalLabel').textContent = `Gia hạn thời gian cho nhiệm vụ: ${task.title}`;
      
      const taskDetailModal = bootstrap.Modal.getInstance(document.getElementById('taskDetailModal'));
      taskDetailModal.hide();
      
      const extendDeadlineModal = new bootstrap.Modal(document.getElementById('extendDeadlineModal'));
      extendDeadlineModal.show();
    });
    
    // Xác nhận gia hạn thời gian
    document.getElementById('confirmExtendBtn').addEventListener('click', function() {
      const newDeadline = document.getElementById('newDeadline').value;
      const reason = document.getElementById('reason').value;
      
      if (!newDeadline || !reason) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
      }
      
      // Thực hiện xử lý gia hạn (trong thực tế sẽ gọi API)
      alert(`Đã gia hạn nhiệm vụ ID ${currentTaskId} đến: ${newDeadline}`);
      
      // Đóng modal
      const extendDeadlineModal = bootstrap.Modal.getInstance(document.getElementById('extendDeadlineModal'));
      extendDeadlineModal.hide();
    });
    
    // Xác nhận xóa file
    function confirmDeleteFile(fileId, fileName) {
      currentFileId = fileId;
      document.getElementById('fileNameToDelete').textContent = fileName;
      
      const deleteFileModal = new bootstrap.Modal(document.getElementById('deleteFileModal'));
      deleteFileModal.show();
      
      return false; // Ngăn chặn hành vi mặc định của thẻ a
    }
    
    // Xóa file
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
      // Thực hiện xử lý xóa file (trong thực tế sẽ gọi API)
      alert(`Đã xóa file ID ${currentFileId}`);
      
      // Đóng modal
      const deleteFileModal = bootstrap.Modal.getInstance(document.getElementById('deleteFileModal'));
      deleteFileModal.hide();
    });
    
    // Chuyển đổi tab
    function showTab(tabName) {
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
      });
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      
      document.getElementById(`${tabName}-content`).classList.remove('hidden');
      document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    // Notification System
    let notifications = [];
    
    function addNotification(message, type = 'info') {
      const notification = {
        id: Date.now(),
        message,
        type,
        timestamp: new Date()
      };
      notifications.unshift(notification);
      updateNotificationBadge();
      renderNotifications();
    }

    function updateNotificationBadge() {
      const badge = document.querySelector('.notification-badge');
      badge.textContent = notifications.length;
      badge.style.display = notifications.length > 0 ? 'block' : 'none';
    }

    function renderNotifications() {
      const list = document.getElementById('notificationList');
      list.innerHTML = notifications.map(notif => `
        <div class="notification-item">
          <div class="small text-muted">${notif.timestamp.toLocaleTimeString()}</div>
          <div>${notif.message}</div>
        </div>
      `).join('');
    }

    function toggleNotifications() {
      const panel = document.getElementById('notificationPanel');
      panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    }

    // Statistics Functions
    function updateStats() {
      const timeframe = document.getElementById('statsTimeframe').value;
      const user = document.getElementById('statsUser').value;

      updateTaskStatusChart();
      updateCompletionTimeChart();
    }

    function updateTaskStatusChart() {
      const ctx = document.getElementById('taskStatusChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Hoàn thành', 'Đang làm', 'Chưa bắt đầu', 'Quá hạn'],
          datasets: [{
            data: [30, 40, 20, 10],
            backgroundColor: [
              'rgba(0, 200, 83, 0.7)',
              'rgba(255, 171, 0, 0.7)',
              'rgba(0, 176, 255, 0.7)',
              'rgba(255, 82, 82, 0.7)'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: 'rgb(224, 224, 224)'
              }
            },
            title: {
              display: true,
              text: 'Phân bố trạng thái nhiệm vụ',
              color: 'rgb(224, 224, 224)'
            }
          }
        }
      });
    }

    function updateCompletionTimeChart() {
      const ctx = document.getElementById('completionTimeChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
          datasets: [{
            label: 'Nhiệm vụ hoàn thành',
            data: [12, 19, 3, 5, 2, 3, 7],
            backgroundColor: 'rgba(41, 121, 255, 0.7)'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'rgb(224, 224, 224)'
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'rgb(224, 224, 224)'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'rgb(224, 224, 224)'
              }
            },
            title: {
              display: true,
              text: 'Số lượng nhiệm vụ hoàn thành theo ngày',
              color: 'rgb(224, 224, 224)'
            }
          }
        }
      });
    }

    // Filter Functions
    function filterTasks() {
      const search = document.getElementById('taskSearch').value.toLowerCase();
      const status = document.getElementById('taskStatus').value;
      const date = document.getElementById('taskDate').value;

      const filtered = tasks.filter(task => {
        const matchSearch = task.title.toLowerCase().includes(search) ||
                          task.assignee.toLowerCase().includes(search);
        const matchStatus = !status || task.status === status;
        // Add date filtering logic here
        return matchSearch && matchStatus;
      });

      renderFilteredTasks(filtered);
    }

    function filterFiles() {
      const search = document.getElementById('fileSearch').value.toLowerCase();
      const date = document.getElementById('fileDate').value;

      const filtered = files.filter(file => {
        const matchSearch = file.name.toLowerCase().includes(search) ||
                          file.uploader.toLowerCase().includes(search);
        // Add date filtering logic here
        return matchSearch;
      });

      renderFilteredFiles(filtered);
    }

    // Task Withdrawal
    document.getElementById('revokeTaskBtn').addEventListener('click', function() {
      if (confirm('Bạn có chắc chắn muốn thu hồi nhiệm vụ này?')) {
        // Add task withdrawal logic here
        addNotification('Đã thu hồi nhiệm vụ thành công', 'success');
        const taskDetailModal = bootstrap.Modal.getInstance(document.getElementById('taskDetailModal'));
        taskDetailModal.hide();
      }
    });

    // Khởi tạo dữ liệu khi trang được tải
    document.addEventListener('DOMContentLoaded', function() {
      renderTasks();
      renderFiles();
      updateStats();
      updateNotificationBadge();
    });