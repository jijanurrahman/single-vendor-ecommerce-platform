// Payment Fail Page JavaScript

console.log('Payment Fail.js loaded');

// Add animations
const style = document.createElement('style');
style.textContent = `
    .error-card {
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

    .error-icon {
        animation: errorShake 0.6s ease-out;
    }

    @keyframes errorShake {
        0%, 100% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-10px);
        }
        75% {
            transform: translateX(10px);
        }
    }

    .error-details {
        animation: slideInUp 0.8s ease-out 0.3s both;
    }

    .action-buttons {
        animation: slideInUp 1s ease-out 0.6s both;
    }

    .reason-list,
    .action-list {
        animation: fadeIn 0.6s ease-out 0.4s both;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment fail page loaded');

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

    // Animate list items
    const listItems = document.querySelectorAll('.reason-list li, .action-list li');
    listItems.forEach((item, index) => {
        item.style.animation = `slideInLeft 0.5s ease-out ${0.5 + (index * 0.1)}s both`;
    });

    // Add CSS for list animation
    const listStyle = document.createElement('style');
    listStyle.textContent = `
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .reason-list li,
        .action-list li {
            text-align: left;
            margin-bottom: 10px;
        }
    `;
    document.head.appendChild(listStyle);
});

console.log('Payment Fail.js initialized');
