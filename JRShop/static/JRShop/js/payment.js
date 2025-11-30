// Payment Processing Page JavaScript

console.log('Payment.js loaded');

// Animate progress steps
const steps = document.querySelectorAll('.step');
steps.forEach((step, index) => {
    step.style.animationDelay = (index * 0.1) + 's';
});

// Simulate payment processing
document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment processing started...');

    // Add pulse animation to security items
    const securityItems = document.querySelectorAll('.security-item');
    securityItems.forEach((item, index) => {
        item.style.animation = `fadeIn 0.6s ease-out ${index * 0.15}s both`;
    });

    // Simulate payment gateway redirect after 3 seconds
    // In production, this would be handled by the backend
    setTimeout(() => {
        console.log('Redirecting to payment gateway...');
        // The actual redirect happens via the backend response
    }, 3000);
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .payment-card {
        animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

console.log('Payment.js initialized');
