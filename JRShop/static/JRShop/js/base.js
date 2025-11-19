// Auto-dismiss messages after 5 seconds with animation
document.addEventListener('DOMContentLoaded', function() {
    const messages = document.querySelectorAll('.alert');
    
    messages.forEach((msg, index) => {
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            margin-left: auto;
            padding: 0;
            opacity: 0.6;
            transition: opacity 0.3s ease;
        `;
        closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
        closeBtn.onmouseout = () => closeBtn.style.opacity = '0.6';
        closeBtn.onclick = () => dismissMessage(msg);
        msg.appendChild(closeBtn);
        
        // Auto-dismiss after 5 seconds
        const timeout = setTimeout(() => dismissMessage(msg), 5000);
        
        // Clear timeout on hover
        msg.onmouseenter = () => clearTimeout(timeout);
        msg.onmouseleave = () => {
            const newTimeout = setTimeout(() => dismissMessage(msg), 3000);
        };
    });
});

function dismissMessage(msg) {
    msg.classList.add('dismiss');
    setTimeout(() => msg.remove(), 500);
}
