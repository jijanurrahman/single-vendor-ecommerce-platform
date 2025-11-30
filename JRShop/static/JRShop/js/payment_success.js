// Payment Success Page JavaScript

console.log('Payment Success.js loaded');

// Animate progress steps
const steps = document.querySelectorAll('.step');
steps.forEach((step, index) => {
    step.style.animationDelay = (index * 0.1) + 's';
});

// Confetti animation on success
function createConfetti() {
    const confettiPieces = 50;
    const container = document.querySelector('.success-card');

    for (let i = 0; i < confettiPieces; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.delay = Math.random() * 0.5 + 's';
        confetti.style.backgroundColor = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)];
        container.appendChild(confetti);
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        pointer-events: none;
        animation: confetti-fall 3s ease-in forwards;
    }

    @keyframes confetti-fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }

    .success-card {
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

    .success-checkmark {
        animation: successPulse 0.6s ease-out;
    }

    @keyframes successPulse {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    .order-details {
        animation: slideInUp 0.8s ease-out 0.3s both;
    }

    .action-buttons {
        animation: slideInUp 1s ease-out 0.6s both;
    }
`;
document.head.appendChild(style);

// Calculate tax and total
function calculateTaxAndTotal() {
    const subtotalText = document.querySelector('.total-row .value')?.textContent || '৳0';
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

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment success page loaded');
    
    // Calculate tax and total
    calculateTaxAndTotal();
    
    // Create confetti animation
    setTimeout(() => {
        createConfetti();
    }, 500);

    // Add button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Auto-scroll to order details
    setTimeout(() => {
        const orderDetails = document.querySelector('.order-details');
        if (orderDetails) {
            orderDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 1000);
});

console.log('Payment Success.js initialized');
