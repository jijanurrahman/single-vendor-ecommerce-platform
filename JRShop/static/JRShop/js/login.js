// Add floating animation to form inputs on focus
document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
        this.parentElement.style.transition = 'transform 0.3s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
    });
});

// Add ripple effect to button
document.querySelector('.btn-submit').addEventListener('click', function(e) {
    let ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.6)';
    ripple.style.width = ripple.style.height = '100px';
    ripple.style.left = e.offsetX - 50 + 'px';
    ripple.style.top = e.offsetY - 50 + 'px';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
});

// Add keyframe for ripple
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        from {
            transform: scale(0);
            opacity: 1;
        }
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
