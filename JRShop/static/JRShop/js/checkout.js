// Checkout Page JavaScript

console.log('Checkout.js loaded');

// Calculate tax and total on page load
document.addEventListener('DOMContentLoaded', function() {
    calculateTaxAndTotal();
});

function calculateTaxAndTotal() {
    const subtotalText = document.querySelector('.summary-row .value')?.textContent || '৳0';
    const subtotal = parseFloat(subtotalText.replace('৳', '').trim());
    
    if (!isNaN(subtotal)) {
        const tax = subtotal * 0.1;
        const total = subtotal + tax;
        
        const taxElement = document.getElementById('tax-amount');
        const totalElement = document.getElementById('total-amount');
        
        if (taxElement) {
            taxElement.textContent = '৳' + tax.toFixed(2);
        }
        if (totalElement) {
            totalElement.textContent = '৳' + total.toFixed(2);
        }
    }
}

// Form validation
const checkoutForm = document.querySelector('.checkout-form');

if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
        // Add loading animation to submit button
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<span>Processing...</span>';
            submitBtn.disabled = true;
        }
    });
}

// Input focus animations
const inputs = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');

inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });

    // Add animation on input
    input.addEventListener('input', function() {
        this.style.borderColor = '#6366f1';
    });
});

// Smooth scroll to form on error
window.addEventListener('load', function() {
    const errorMessages = document.querySelectorAll('.error-message');
    if (errorMessages.length > 0) {
        const firstError = errorMessages[0];
        firstError.closest('.form-group').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

// Real-time form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{10,11}$/;
    return re.test(phone);
}

const emailInput = document.querySelector('input[type="email"]');
const phoneInput = document.querySelector('input[name="phone"]');

if (emailInput) {
    emailInput.addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = '#e5e7eb';
        }
    });
}

if (phoneInput) {
    phoneInput.addEventListener('blur', function() {
        if (this.value && !validatePhone(this.value)) {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = '#e5e7eb';
        }
    });
}

// Animate progress steps
const steps = document.querySelectorAll('.step');
steps.forEach((step, index) => {
    step.style.animationDelay = (index * 0.1) + 's';
});

// Add ripple effect to buttons
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('Checkout.js initialized');
