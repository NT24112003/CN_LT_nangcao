let overall = null;
let targetDate= null;
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
  console.log("Sự kiện được chọn:", eventList);
  overall = el;
  const dateStr = el.getAttribute('data-date');
  targetDate= dateStr;
  document.querySelector('.modal-title').textContent = `Sự kiện trong ngày ${dateStr}`;
  const container = document.getElementById("eventListContainer");
  container.innerHTML = "";


  const selectedDate = new Date(dateStr);
  const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

  const events = eventList.filter(event => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    return start <= endOfDay && end >= startOfDay;
  });

  if (events.length === 0) {
    container.innerHTML = "<p>Không có sự kiện nào trong ngày này.</p>";
  } else {
    events.forEach(event => {
      const eventStr = JSON.stringify(event).replace(/"/g, '&quot;');

      const div = document.createElement("div");
      div.className = "mb-2 p-2 border rounded";
      div.setAttribute("data-event-id", event.id);

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
          </div>
          </div>
          <div class="ms-3 small" style="display: none;">${event.description}</div>
        </div>
      `;

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



function notification() {
  let reminderEnabled = false;
 
  const bellIcon = document.getElementById("bellToggle");

  bellIcon.addEventListener("click", () => {
    if (!reminderEnabled) {
      const modal = new bootstrap.Modal(document.getElementById("reminderModal"));
      modal.show();
    } else {
      reminderEnabled = false;
      bellIcon.style.color = "gray";
      $.ajax({
        method: "POST",
        url: "/event/disable-reminder",
        data: {
          targetDate: targetDate,
        },
        success: function (response) {
          console.log("Nhắc nhở đã tắt thành công!");
        },
        error: function (response) {
          console.log("Lỗi khi tắt nhắc nhở:");
        }
      });
    }
  });
  document.getElementById("saveReminder").addEventListener("click", () => {
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
    $.ajax({
      url: "/event/set-reminder",
      method: "POST",
      data: {
        minutes,
        email,
        targetDate: targetDate  
      },
      success: function (response) {
        reminderEnabled = true;
        bellIcon.style.color = "#ffc107"; // màu vàng
        bootstrap.Modal.getInstance(document.getElementById("reminderModal")).hide();
        console.log("Nhắc nhở đã được thiết lập thành công!");
      },
      error: function (err) {
        alert("Lỗi khi lưu nhắc nhở");
      }
    });
  });
}
notification();

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


