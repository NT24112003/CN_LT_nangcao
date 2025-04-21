    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            input.type = input.type === 'password' ? 'text' : 'password';
            btn.querySelector('i').classList.toggle('bi-eye');
            btn.querySelector('i').classList.toggle('bi-eye-slash');
        });
    });
