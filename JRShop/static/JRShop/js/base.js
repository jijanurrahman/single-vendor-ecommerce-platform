// Auto-dismiss messages after 5 seconds
setTimeout(() => {
    const messages = document.querySelectorAll('.alert');
    messages.forEach(msg => {
        msg.style.animation = 'slideInRight 0.5s ease-out reverse';
        setTimeout(() => msg.remove(), 500);
    });
}, 5000);
