    
  let tasks=[];
    let files=[];
   

    
    // Biến lưu trữ nhiệm vụ và file hiện tại đang được xem
    let currentTaskId = null;
    let currentFileId = null;


    function formatDate(task) {
       // đổi ngày tháng năm sang định dạng dd/mm/yyyy
     const end = new Date(task.endTime);  
     const start = new Date(task.startTime);
     const timeRange = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
     const date = start.toLocaleDateString('vi-VN'); // Format kiểu Việt Nam: dd/mm/yyyy
     const dateEnd = start.toLocaleDateString('vi-VN'); // Format kiểu Việt Nam: dd/mm/yyyy
     return { timeRange, date, dateEnd };
 
    }
   
    // Hiển thị danh sách nhiệm vụ
    function renderTasks(tasks) {
      const taskList = document.getElementById('taskList');
      taskList.innerHTML = '';
      

      if(tasks.length === 0) {
        taskList.innerHTML = '<tr><td colspan="5" class="text-center">Không có nhiệm vụ nào</td></tr>';
      }

      tasks.forEach(task => {
        const row = document.createElement('tr');
        row.className = 'task-item';
        
     // Tạo badge dựa vào trạng thái
        let statusBadge = '';
            if (task.status === 'completed') {
              statusBadge = '<span class="badge badge-success">Hoàn thành</span>';
            } else if (task.status === 'in-progress') {
              statusBadge = '<span class="badge badge-warning">Đang làm</span>';
            } else if (task.status === 'overdue') {
              statusBadge = '<span class="badge badge-danger">Quá hạn</span>';
            } else if (task.status === 'submitted') {
              statusBadge = '<span class="badge badge-info">Đã nộp</span>';
            } else { // Trạng thái còn lại là 'pending'
              statusBadge = '<span class="badge badge-info">Chưa bắt đầu</span>';
            }
          
        row.innerHTML = `
          <td>${task.title}</td>
           <td>
            ${formatDate(task).timeRange}<br/>
            ${formatDate(task).date}
            </td>
          <td><span class="user-email">${task.assignedTo}</span></td>
          <td>${statusBadge}</td>
          <td class="text-center"><span class="detail-link" onclick="showTaskDetail('${task._id}')">[Chi tiết]</span></td>
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
      const task = tasks.find(t => t._id === taskId);
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
            <p><strong>Người nhận:</strong> <span class="user-email">${task.assignedTo}</span></p>
            <p><strong>Thời gian bắt đầu:</strong> ${formatDate(task).timeRange}</p>
            <p><strong>Thời gian kết thúc:</strong> ${formatDate(task).date}</p>
          </div>
          <div class="col-md-6">
            <p><strong>Trạng thái:</strong> ${statusBadge}</p>
           
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
      document.getElementById('currentDeadline').value = formatDate(task).date +"-----"+ formatDate(task).timeRange ;
      
      const taskDetailModal = new bootstrap.Modal(document.getElementById('taskDetailModal'));
      taskDetailModal.show();
    }
    
   
    
    // Xác nhận xóa file
    function confirmDeleteFile(fileId, fileName) {
      currentFileId = fileId;
      document.getElementById('fileNameToDelete').textContent = fileName;
      
      const deleteFileModal = new bootstrap.Modal(document.getElementById('deleteFileModal'));
      deleteFileModal.show();
      
      return false; // Ngăn chặn hành vi mặc định của thẻ a
    }
    
    // Xóa file
   document.getElementById('confirmDeleteBtn').addEventListener('click', async function () {
  try {
    const response = await fetch(`/task/delete/${currentTaskId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert(`Đã xóa file ID ${currentFileId}`);

      // Ẩn modal
      const deleteFileModal = bootstrap.Modal.getInstance(document.getElementById('deleteFileModal'));
      deleteFileModal.hide();

      // Cập nhật giao diện (ví dụ: reload page hoặc xóa phần tử khỏi DOM)
      document.getElementById(`file-${currentFileId}`).remove();
    } else {
      alert("Xóa file thất bại!");
    }
  } catch (err) {
    console.error(err);
    alert("Lỗi khi kết nối server!");
  }
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
    async function filterTasks() {
      const title = document.getElementById('taskSearch').value.toLowerCase();
      const status = document.getElementById('taskStatus').value;
      const date = document.getElementById('taskDate').value;

    const query = new URLSearchParams();
    if(title) query.append( "title",title);
    if(status) query.append("status",status);
    if(date) query.append("date",date);
    try {
      const res = await fetch(`/task/searchListTask?${query.toString()}`);
      const tasks = await res.json();
      console.log("tasksLits",tasks);
      renderTasks(tasks); 
    } catch (err) {
      console.error("Lỗi khi lọc nhiệm vụ:", err);
    }
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
    document.getElementById('revokeTaskBtn').addEventListener('click', function () {
      if (confirm('Bạn có chắc chắn muốn thu hồi nhiệm vụ này?')) {
        fetch(`/task/delete/${currentTaskId}`, {
          method: 'DELETE',
        })
        .then(response => {
          if (!response.ok) throw new Error('Xóa thất bại');
          return response.json();
        })
        .then(data => {
          addNotification('Đã thu hồi nhiệm vụ thành công', 'success');
          const taskDetailModal = bootstrap.Modal.getInstance(document.getElementById('taskDetailModal'));
          taskDetailModal.hide();
          location.reload(); // Reload trang để cập nhật danh sách nhiệm vụ
        })
        .catch(error => {
          console.error(error);
          addNotification('Thu hồi nhiệm vụ thất bại', 'error');
        });
      }
    });
      // Mở modal gia hạn thời gian
    document.getElementById('extendDeadlineBtn').addEventListener('click', function() {
      const task = tasks.find(t => t._id === currentTaskId);
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
      
      // Gửi yêu cầu cập nhật endTime qua API
  fetch(`/task/patch/${currentTaskId}`, {
    method: 'PATCH', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      endTime: newDeadline,
      reason: reason
    })
  })
  .then(response => {
    if (!response.ok) throw new Error('Cập nhật thất bại');
    return response.json();
  })
  .then(data => {
    alert(`Đã gia hạn nhiệm vụ  đến: ${newDeadline}`);
    
    // Đóng modal
    const extendDeadlineModal = bootstrap.Modal.getInstance(document.getElementById('extendDeadlineModal'));
    extendDeadlineModal.hide();
    
    location.reload();

    
  })
  .catch(error => {
    console.error(error);
    alert('Lỗi khi gia hạn nhiệm vụ');
  });


    });

    // Khởi tạo dữ liệu khi trang được tải
    document.addEventListener('DOMContentLoaded', function() {
        // Dữ liệu nhiệm vụ
   fetch('/home/taskManagerData')
   .then(response => response.json())
   .then(data =>{
      tasks.push(...data)
      renderTasks(tasks);
      renderFiles();
      updateStats();
      updateNotificationBadge();
      const fileList = tasks.map(task => task.submittedFile)
      files.push(...fileList)
     
   })
    .catch(error => console.error('Error fetching task data:', error));
     // Dữ liệu file đã nộp
   
    dateInput()

    });




   // Hàm để format ngày giờ theo định dạng datetime-local
   function dateInput() {
    function formatDateForInput(date) {
        // Lấy múi giờ địa phương của người dùng
        const localDate = new Date(date);
        
        // Lấy năm, tháng, ngày, giờ và phút theo định dạng ISO cho input
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const hours = String(localDate.getHours()).padStart(2, '0');
        const minutes = String(localDate.getMinutes()).padStart(2, '0');
        
        // Trả về chuỗi theo định dạng yyyy-MM-ddTHH:mm
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
  
    window.onload = function () {
        const currentTime = new Date();
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');
        
        // Gán giá trị mặc định cho startTime là ngày giờ hiện tại của người dùng
        startTimeInput.value = formatDateForInput(currentTime);
        
        // Tạo endTime ít nhất 5 phút sau startTime
        const endTime = new Date(currentTime.getTime() + 5 * 60 * 1000);  // Cộng thêm 5 phút
        endTimeInput.value = formatDateForInput(endTime);
    };
}
console.log("task",tasks);
console.log("files",files);










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