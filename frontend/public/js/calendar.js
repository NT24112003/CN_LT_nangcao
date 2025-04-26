let overall = null;
function openEventModal() {
  const el = overall;
  const date = el.getAttribute('data-date');
  console.log("Ngày được chọn:", date);

  // Reset form
  document.getElementById('eventForm').reset();

  // Gán lại ngày sau khi reset
  document.getElementById('eventDate').value = date;

  document.querySelector('#eventModal .modal-title').textContent = "Tạo sự kiện";
  document.getElementById('submitButton').textContent = "Xác nhận";
  document.getElementById('eventForm').action = "/event/create";
  document.getElementById('eventForm').onsubmit = null;

  const listModal = bootstrap.Modal.getInstance(document.getElementById('eventListModal'));
  if (listModal) listModal.hide();

  setTimeout(() => {
    new bootstrap.Modal(document.getElementById("eventModal")).show();
  }, 300);
}
function openEventListModal(el) {


  const eventList = JSON.parse(el.dataset.events);
  overall = el;
  const dateStr = el.getAttribute('data-date');
  document.querySelector('.modal-title').textContent = `Sự kiện trong ngày ${dateStr}`;
  const container = document.getElementById("eventListContainer");
  container.innerHTML = "";


  const events = eventList.filter(event => {
    const start = new Date(event.startTime).toLocaleString().split('T')[0];
    const end = new Date(event.endTime).toLocaleString().split('T')[0];
    return start && end;
  });
  ;


  if (events.length === 0) {
    container.innerHTML = "<p>Không có sự kiện nào trong ngày này.</p>";
  } else {
    events.forEach(event => {
      console.log("Sự kiện trong ngày:", event);
      const eventStr = JSON.stringify(event).replace(/"/g, '&quot;');
      const div = document.createElement("div");
      div.className = "mb-2 p-2 border rounded";
      div.setAttribute("data-event-id", event.id);
      if (event.assignedBy) {
        div.classList.add("bg-warning");
        div.innerHTML = `
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <strong>${event.title}</strong><br>
              ${new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              ${new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br>
              <span class="text-danger fw-bold">Người giao: ${event.assignedBy}</span>
            </div>
            <div>
              <a class="btn btn-sm btn-secondary" href="/event/${event._id}">Xem chi tiết</a>
            </div>
          </div>
        `;
      } else {


        div.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <strong>${event.title}</strong><br>
            ${new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
            ${new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           <div class="mt-1 action-buttons" style="display: none;">
                <button class="btn btn-sm btn-warning me-2" onclick="editEvent('${event.id}', ${eventStr})">Sửa</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEvent('${event.id}')">Xoá</button>
                <a class="btn btn-sm btn-secondary" href="/event/${event.id}">Chi tiết</a>
                <!-- Icon chuông -->
                <i id="bellToggle-${event.id}"  class="bi bi-bell fs-4 m-2"  style="cursor: pointer; color: ${event.reminderEnabled ? 'yellow' : 'gray'};"  name="reminderEnabled"  onclick="notification('${event.id}','${event.reminderEnabled}')"></i>
                
          </div>
          </i>
          </div>
          <div class="ms-3 small" style="display: none;">${event.description}</div>
          </div>
          `;
      }
      div.addEventListener("click", e => {
        if (e.target.tagName !== "BUTTON") {
          const desc = div.querySelector('.small');
          const actions = div.querySelector('.action-buttons');
          const isVisible = desc.style.display === "block";

          desc.style.display = isVisible ? "none" : "block";
          actions.style.display = isVisible ? "none" : "block";

        }
      });

      container.appendChild(div);
    });
  }

  new bootstrap.Modal(document.getElementById("eventListModal")).show();
}

// thông báo nhắc nhở

function notification(id, reminderEnabled) {
  const bellIcon = document.getElementById(`bellToggle-${id}`);
  reminderEnabled = reminderEnabled === "true";
  console.log("Nhắc nhở cho sự kiện:", id, reminderEnabled);
  if (!reminderEnabled) {
    const eventListModalEl = document.getElementById("eventListModal");
    const eventListModal = bootstrap.Modal.getInstance(eventListModalEl) || new bootstrap.Modal(eventListModalEl);
    eventListModal.hide();

    // Đợi khi modal ẩn hoàn toàn, thì show cái tiếp theo
    eventListModalEl.addEventListener("hidden.bs.modal", function () {
      const reminderModalEl = document.getElementById("reminderModal");
      const reminderModal = bootstrap.Modal.getInstance(reminderModalEl) || new bootstrap.Modal(reminderModalEl);
      reminderModal.show();
    }, { once: true }); // chỉ lắng nghe 1 lần duy nhất

    // Gắn sự kiện lưu nhắc nhở
    const saveBtn = document.getElementById("saveReminder");
    saveBtn.onclick = () => {
      const minutes = parseInt(document.getElementById("reminderMinutes").value);
      const email = document.getElementById("reminderEmail").value;

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        alert("Email không hợp lệ!");
        return;
      }

      if (isNaN(minutes) || minutes <= 0) {
        alert("Số phút nhắc trước không hợp lệ!");
        return;
      }

      fetch(`/event/set-reminder/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id,
          minutes,
          email,
          reminderEnabled: true
        })
      })
        .then(res => res.json())
        .then(response => {
          bellIcon.style.color = "#ffc107"; // màu vàng
          bellIcon.dataset.notification = "true";

          bootstrap.Modal.getInstance(document.getElementById("reminderModal")).hide();
          console.log("Nhắc nhở đã được thiết lập thành công!");
          window.location.reload();
        })
        .catch(err => {
          console.error("Lỗi khi lưu nhắc nhở:", err);
          alert("Lỗi khi lưu nhắc nhở");
        });
    };
  } else {
    // Nếu đang bật => gọi API để tắt
    fetch(`/event/disable-reminder/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id,
        reminderEnabled: false
      })
    })
      .then(res => res.json())
      .then(response => {
        console.log("Nhắc nhở đã tắt thành công!");
        bellIcon.style.color = "gray";

        window.location.reload();
      })
      .catch(err => {
        console.error("Lỗi khi tắt nhắc nhở:", err);
      });
  }
}







function editEvent(id, event) {
  document.querySelector('#eventModal .modal-title').textContent = "Chỉnh sửa sự kiện";
  document.getElementById('submitButton').textContent = "Lưu thay đổi";

  document.getElementById('titleInput').value = event.title;
  document.getElementById('descriptionInput').value = event.description;
  document.getElementById('eventDate').value = event.startTime.slice(0, 10);
  document.getElementById('startTimeInput').value = event.startTime.slice(11, 16);
  document.getElementById('endTimeInput').value = event.endTime.slice(11, 16);

  const form = document.getElementById('eventForm');
  form.action = `/event/update/${id}`;
  form.onsubmit = e => {
    e.preventDefault();
    if (!confirm("Bạn muốn sửa dữ liệu?")) return;

    const updated = {
      title: form.title.value,
      description: form.description.value,
      startTime: `${form.date.value}T${form.startTime.value}:00.000Z`,
      endTime: `${form.date.value}T${form.endTime.value}:00.000Z`,
    };

    fetch(`/event/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
      .then(res => res.ok ? res.json() : Promise.reject("Lỗi cập nhật"))
      .then(() => {
        alert("Cập nhật thành công!");
        location.reload();
      })
      .catch(err => {
        console.error(err);
        alert("Đã xảy ra lỗi.");
      });
  };

  new bootstrap.Modal(document.getElementById("eventModal")).show();
}

function deleteEvent(id) {
  if (!confirm("Bạn thật sự muốn xóa?")) return;

  fetch(`/event/delete/${id}`, { method: "DELETE" })
    .then(res => res.ok ? res.json() : Promise.reject("Lỗi xóa"))
    .then(() => {
      alert("Đã xoá sự kiện.");
      document.querySelector(`[data-event-id="${id}"]`)?.remove();
    })
    .catch(err => {
      console.error(err);
      alert("Có lỗi xảy ra.");
    });
}


function checkEndTime(){
  const startTimeInput = document.getElementById('startTimeInput');
const endTimeInput = document.getElementById('endTimeInput');
const timeError = document.getElementById('timeError');

function validateTime() {
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;

  if (endTime && startTime && endTime <= startTime) {
    timeError.classList.remove('d-none');
    endTimeInput.classList.add('is-invalid');
  } else {
    timeError.classList.add('d-none');
    endTimeInput.classList.remove('is-invalid');
  }
}

startTimeInput.addEventListener('input', validateTime);
endTimeInput.addEventListener('input', validateTime);

}
checkEndTime()


// Validation: startTime < endTime
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('eventForm');
  const startInput = document.getElementById('startTimeInput');
  const endInput = document.getElementById('endTimeInput');
  const errorDiv = document.getElementById('startTimeError');

  form.addEventListener('submit', e => {
      if (startInput.value >= endInput.value) {
          e.preventDefault();
          errorDiv.style.display = 'block';
          return false;
      }
      errorDiv.style.display = 'none';
  });

  startInput.addEventListener('input', () => {
      if (startInput.value < endInput.value) {
          errorDiv.style.display = 'none';
      }
  });
});

// Validation: startTime < endTime with endTime error
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('eventForm');
  const startInput = document.getElementById('startTimeInput');
  const endInput = document.getElementById('endTimeInput');
  const startErrorDiv = document.getElementById('startTimeError');
  const endErrorDiv = document.getElementById('endTimeError');
  const overlapErrorDiv = document.getElementById('overlapError');

  form.addEventListener('submit', e => {
      const start = startInput.value;
      const end   = endInput.value;
      // 1) Kiểm tra thời gian bắt đầu < kết thúc
      if (start >= end) {
          e.preventDefault();
          startErrorDiv && (startErrorDiv.style.display = 'none');
          endErrorDiv.style.display     = 'block';
          overlapErrorDiv.style.display = 'none';
          return false;
      }
      // 2) Kiểm tra trùng giờ với sự kiện khác trong ngày
      if (overall) {
          const existingEvents = JSON.parse(overall.dataset.events);
          for (let ev of existingEvents) {
              const evStart = new Date(ev.startTime).toTimeString().substr(0,5);
              const evEnd   = new Date(ev.endTime).toTimeString().substr(0,5);
              if (start < evEnd && end > evStart) {
                  e.preventDefault();
                  startErrorDiv && (startErrorDiv.style.display = 'none');
                  endErrorDiv.style.display   = 'none';
                  overlapErrorDiv.style.display = 'block';
                  return false;
              }
          }
      }
      // 3) Hợp lệ, ẩn tất cả thông báo
      startErrorDiv && (startErrorDiv.style.display = 'none');
      endErrorDiv.style.display     = 'none';
      overlapErrorDiv.style.display = 'none';
      return true;
  });
  // Ẩn lỗi khi user chỉnh lại thời gian kết thúc
  endInput.addEventListener('input', () => {
      overlapErrorDiv.style.display = 'none';
      const start = startInput.value;
      const end = endInput.value;
      if (start < end) {
          endErrorDiv.style.display = 'none';
      }
  });
});