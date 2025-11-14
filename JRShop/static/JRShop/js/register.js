// Style form fields
document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]').forEach(input => {
    input.classList.add('form-input');
    input.setAttribute('autocomplete', 'off');
});

// Password strength checker
const password1 = document.getElementById('id_password1');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');

if (password1) {
    password1.addEventListener('input', function() {
        const value = this.value;
        let strength = 0;
        
        if (value.length >= 8) strength++;
        if (value.match(/[a-z]+/)) strength++;
        if (value.match(/[A-Z]+/)) strength++;
        if (value.match(/[0-9]+/)) strength++;
        if (value.match(/[$@#&!]+/)) strength++;

        const percentage = (strength / 5) * 100;
        strengthBar.style.width = percentage + '%';

        if (strength <= 2) {
            strengthBar.style.background = 'linear-gradient(to right, #ef4444, #dc2626)';
            strengthText.textContent = 'Weak password';
            strengthText.style.color = '#ef4444';
        } else if (strength <= 3) {
            strengthBar.style.background = 'linear-gradient(to right, #f59e0b, #d97706)';
            strengthText.textContent = 'Medium password';
            strengthText.style.color = '#f59e0b';
        } else {
            strengthBar.style.background = 'linear-gradient(to right, #10b981, #059669)';
            strengthText.textContent = 'Strong password';
            strengthText.style.color = '#10b981';
        }
    });
}

// Password confirmation validation
const password2 = document.getElementById('id_password2');
if (password1 && password2) {
    password2.addEventListener('input', function() {
        if (this.value && this.value !== password1.value) {
            this.classList.add('error');
        } else {
            this.classList.remove('error');
        }
    });
}

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

// Form validation
document.getElementById('registerForm').addEventListener('submit', function(e) {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Creating Account...';
});
