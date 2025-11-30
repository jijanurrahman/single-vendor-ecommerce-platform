// Payment Cancel Page JavaScript

console.log('Payment Cancel.js loaded');

// Add animations
const style = document.createElement('style');
style.textContent = `
    .cancel-card {
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

    .cancel-icon {
        animation: cancelPulse 0.6s ease-out;
    }

    @keyframes cancelPulse {
        0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
        }
        100% {
            transform: scale(1) rotate(0);
            opacity: 1;
        }
    }

    .cancel-details {
        animation: slideInUp 0.8s ease-out 0.3s both;
    }

    .action-buttons {
        animation: slideInUp 1s ease-out 0.6s both;
    }

    .next-steps {
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
    console.log('Payment cancel page loaded');

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
    const listItems = document.querySelectorAll('.next-steps li');
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

        .next-steps li {
            text-align: left;
            margin-bottom: 10px;
        }
    `;
    document.head.appendChild(listStyle);
});

console.log('Payment Cancel.js initialized');
