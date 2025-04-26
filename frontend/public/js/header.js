document.addEventListener('DOMContentLoaded', function () {
    // ========================== Khai báo biến ==========================
    const today = new Date();
    let dmSelectedMonth = today.getMonth();
    let dmSelectedYear = today.getFullYear();

    // ========================== Hàm chính ==========================
    dmGenerateYearTable();       // Tạo bảng năm
    dmUpdateDateDisplay();       // Cập nhật hiển thị ngày tháng ban đầu

    // Đánh dấu tháng hiện tại là đã chọn
    const currentMonthElement = document.querySelector(`.dm-month-item[data-dm-month="${dmSelectedMonth}"]`);
    if (currentMonthElement) {
        currentMonthElement.classList.add('dm-selected-item');
    }

    // ========================== Xử lý sự kiện ==========================

    // Khi chọn tháng
    const dmMonthItems = document.querySelectorAll('.dm-month-item');
    dmMonthItems.forEach(cell => {
        cell.addEventListener('click', function () {
            dmMonthItems.forEach(c => c.classList.remove('dm-selected-item'));
            this.classList.add('dm-selected-item');
            dmSelectedMonth = parseInt(this.dataset.dmMonth);
        });
    });

    // Khi click tab năm → sinh lại bảng năm
    document.getElementById('dm-year-tab').addEventListener('click', dmGenerateYearTable);

    // Khi click "Hôm nay"
    document.getElementById('dm-today-btn').addEventListener('click', function () {
        const now = new Date();
        dmSelectedMonth = now.getMonth();
        dmSelectedYear = now.getFullYear();

        // Cập nhật UI
        dmMonthItems.forEach(cell => {
            cell.classList.remove('dm-selected-item');
            if (parseInt(cell.dataset.dmMonth) === dmSelectedMonth) {
                cell.classList.add('dm-selected-item');
            }
        });

        dmGenerateYearTable();
        dmUpdateDateDisplay();
    });

    // Khi nhấn nút xác nhận
    document.getElementById('dm-confirm-btn').addEventListener('click', function () {
        dmUpdateDateDisplay();
        const modal = bootstrap.Modal.getInstance(document.getElementById('dmDateModal'));
        modal.hide();
    });

    // ========================== Hàm phụ ==========================

    // Cập nhật hiển thị ngày tháng trên header
    function dmUpdateDateDisplay() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        document.querySelector('.dm-date-display').textContent = `${monthNames[dmSelectedMonth]} ${dmSelectedYear}`;
        submitDate(dmSelectedMonth + 1, dmSelectedYear); // tháng từ 1-12

        // Hàm global để lấy ngày được chọn
        window.getSelectedDate = function () {
            return {
                month: dmSelectedMonth,
                year: dmSelectedYear
            };
        }
    }

    // Tạo bảng năm động
    function dmGenerateYearTable() {
        const dmYearTable = document.querySelector('#dm-year-table tbody');
        dmYearTable.innerHTML = ''; // Clear nội dung cũ

        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 5;

        let yearIndex = 0;
        let currentRow;

        for (let year = startYear; year <= currentYear + 6; year++) {
            if (yearIndex % 4 === 0) {
                currentRow = document.createElement('tr');
                dmYearTable.appendChild(currentRow);
            }

            const cell = document.createElement('td');
            cell.className = 'dm-year-item';
            cell.setAttribute('data-dm-year', year);
            cell.textContent = year;

            if (year === dmSelectedYear) {
                cell.classList.add('dm-selected-item');
            }

            cell.addEventListener('click', function () {
                document.querySelectorAll('.dm-year-item').forEach(c => c.classList.remove('dm-selected-item'));
                this.classList.add('dm-selected-item');
                dmSelectedYear = parseInt(this.dataset.dmYear);
            });

            currentRow.appendChild(cell);
            yearIndex++;
        }
    }

    // Gửi ngày được chọn lên server
    function submitDate(month, year) {
        fetch(`/home/calendarData?month=${month}&year=${year}`)
            .then(res => res.json())
            .then(data => {
                updateCalendar(data); // Cập nhật lịch
            })
            .catch(err => console.log("Error:", err));
    }

    // ========================== Phần tìm kiếm ==========================
    fetch('/home/data')
        .then(res => res.json())
        .then(userData => {
            const searchInput = document.getElementById('searchInput');
            const searchDate = document.getElementById('searchDate');
            const searchResults = document.getElementById('searchResults');

            // Kích hoạt input phù hợp với loại tìm kiếm
            document.querySelectorAll('input[name="searchType"]').forEach(input => {
                input.addEventListener('change', () => {
                    searchDate.disabled = input.value !== 'date';
                    searchInput.disabled = input.value === 'date';
                });
            });
            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
            

            // Hàm xử lý tìm kiếm
            window.performSearch = function () {
                const type = document.querySelector('input[name="searchType"]:checked').value;
                const term = searchInput.value.toLowerCase();
                const date = searchDate.value;
                searchResults.innerHTML = ''; // clear
              
                let found = [];
              
                if (type === 'title') {
                  const events = userData.events
                    .filter(e => e.title.toLowerCase().includes(term))
                    .map(e => ({ ...e, type: 'event' }));
              
                  const todos = userData.todolist
                    .filter(t => t.title.toLowerCase().includes(term))
                    .map(t => ({ ...t, type: 'todo' }));
              
                  // todo được ưu tiên lên đầu
                  found = [...todos, ...events];
                } else {
                  const selectedDate = new Date(date).toISOString().split('T')[0];
                  found = userData.events
                    .filter(e => new Date(e.startTime).toISOString().split('T')[0] === selectedDate)
                    .map(e => ({ ...e, type: 'event' }));
                }
              
                if (found.length === 0) {
                  searchResults.innerHTML = `<p class="text-muted">Không có kết quả phù hợp.</p>`;
                } else {
                  found.forEach(item => {
                    const icon = item.type === 'event' ? 'bi-calendar-event' : 'bi-check2-square';
                    const isTodo = item.type === 'todo';
                    const link = isTodo ? `/home/todolist?highlight=${item.id}` : `/event/${item.id}`;
                    const badgeColor = isTodo ? 'success' : 'info';
              
                    // Nếu là todolist, thêm class để tô đậm hoặc highlight
                    const todoClass = isTodo ? 'fw-bold bg-light p-2 rounded shadow-sm border' : '';
              
                    searchResults.innerHTML += `
                      <div class="d-flex align-items-center mb-2 ${todoClass}">
                        <i class="bi ${icon} me-2 text-${badgeColor}"></i>
                        <a href="${link}" class="text-decoration-none flex-grow-1">${item.title}</a>
                        <span class="badge bg-${badgeColor} text-uppercase">${item.type}</span>
                      </div>
                    `;
                  });
                }
            };
        })
        .catch(error => console.error("Lỗi khi load dữ liệu:", error));
});

// Placeholder cho chuyển tab
function changeTab(tab) {
}
