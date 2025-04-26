document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('assignTaskForm');
  
    form.addEventListener('submit', function(event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    });
    const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success') === 'true') {
    alert('🎉 Giao nhiệm vụ thành công!');
    // Xóa tham số để tránh hiện lại khi reload
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
   
  
  });