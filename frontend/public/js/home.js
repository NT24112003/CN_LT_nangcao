
let isExpanded = false;


function changeTab(tabName) {
    // Lưu tab hiện tại vào localStorage
    localStorage.setItem('activeTab', tabName);

    // Ẩn tất cả nội dung tab
    document.querySelectorAll('.tab-contentList').forEach(tab => {
        tab.classList.add('d-none');
    });

    // Hiện tab được chọn
    document.getElementById(tabName + '-content').classList.remove('d-none');
    console.log('Tab changed to:', tabName);

    // Đổi nút sidebar thành active
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabName + 'Btn').classList.add('active');
}

// Handle the "Enter" key in the todo input
document.addEventListener('DOMContentLoaded', function () {

    const path = window.location.pathname;

    // Đọc tab được lưu trong localStorage và mở lại
    const savedTab = localStorage.getItem('activeTab') || 'calendar';
    changeTab(savedTab);

    // Handle the "Enter" key in the todo input
    const newTaskInput = document.getElementById('new-task');
    if (newTaskInput) {
        newTaskInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                addTodoItem();
            }
        });
    }


    // Initialize collapsible plan months
    const collapseButtons = document.querySelectorAll('.plan-collapse-btn');
    collapseButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.getAttribute('data-bs-target');
            const icon = this.querySelector('.bi');
            if (icon.classList.contains('bi-chevron-down')) {
                icon.classList.replace('bi-chevron-down', 'bi-chevron-up');
            } else {
                icon.classList.replace('bi-chevron-up', 'bi-chevron-down');
            }
        });
    });
  
}
);

function changeScreen() {
    const toggleBtn = document.getElementById('toggleSizeBtn');
    const toggleIcon = document.getElementById('toggleIcon');

    if (!toggleBtn || !toggleIcon) return;
    toggleBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        toggleIcon.classList.toggle('bi-arrows-fullscreen', !isExpanded);
        toggleIcon.classList.toggle('bi-arrows-angle-contract', isExpanded);
        const tabId = localStorage.getItem('activeTab') || 'calendar';
        const currentPath = window.location.pathname;
        if (currentPath === '/home/' + tabId) {
            window.location.href = '/home';
        } else {
            window.location.href = '/home/' + tabId;
        }
    });
}
changeScreen();



