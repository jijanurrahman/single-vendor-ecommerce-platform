console.log('Profile.js loaded');

// Toggle order details
function toggleOrderDetails(orderId) {
    const detailsElement = document.getElementById(`order-${orderId}`);
    if (detailsElement) {
        const isVisible = detailsElement.style.display !== 'none';
        detailsElement.style.display = isVisible ? 'none' : 'block';
        
        // Animate
        if (!isVisible) {
            detailsElement.style.animation = 'slideDown 0.3s ease-out';
        }
    }
}

// Make toggleOrderDetails globally available
window.toggleOrderDetails = toggleOrderDetails;

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            max-height: 0;
        }
        to {
            opacity: 1;
            max-height: 1000px;
        }
    }

    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
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

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .profile-header {
        animation: slideInDown 0.6s ease-out;
    }

    .stat-card {
        animation: slideInUp 0.6s ease-out;
    }

    .order-card {
        animation: slideInUp 0.6s ease-out;
    }

    .settings-card {
        animation: slideInUp 0.6s ease-out;
    }

    .empty-state {
        animation: fadeIn 0.4s ease-out;
    }

    .tab-content {
        animation: fadeIn 0.4s ease-out;
    }
`;
document.head.appendChild(style);

// Calculate tax and total for order details
function calculateOrderTotals() {
    const taxAmounts = document.querySelectorAll('.tax-amount');
    const totalAmounts = document.querySelectorAll('.total-amount');
    
    taxAmounts.forEach(taxElement => {
        const subtotal = parseFloat(taxElement.getAttribute('data-total'));
        if (!isNaN(subtotal)) {
            const tax = subtotal * 0.1;
            taxElement.textContent = '৳' + tax.toFixed(2);
        }
    });
    
    totalAmounts.forEach(totalElement => {
        const subtotal = parseFloat(totalElement.getAttribute('data-total'));
        if (!isNaN(subtotal)) {
            const tax = subtotal * 0.1;
            const total = subtotal + tax;
            totalElement.textContent = '৳' + total.toFixed(2);
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');
    
    // Calculate order totals
    calculateOrderTotals();

    // Add staggered animation to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.animationDelay = (index * 0.1) + 's';
    });

    // Add staggered animation to order cards
    const orderCards = document.querySelectorAll('.order-card');
    orderCards.forEach((card, index) => {
        card.style.animationDelay = (index * 0.1) + 's';
    });

    // Add staggered animation to settings cards
    const settingsCards = document.querySelectorAll('.settings-card');
    settingsCards.forEach((card, index) => {
        card.style.animationDelay = (index * 0.1) + 's';
    });

    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn-small');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add tab switching animation
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all tabs
            tabLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
        });
    });

    // Add smooth scroll for order details
    const viewDetailsButtons = document.querySelectorAll('.btn-small.btn-primary');
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            setTimeout(() => {
                const orderDetails = this.closest('.order-card').querySelector('.order-details');
                if (orderDetails) {
                    orderDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        });
    });

    // Animate stat values on load
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(value => {
        const text = value.textContent;
        if (!isNaN(text.replace('৳', ''))) {
            value.style.animation = 'countUp 1s ease-out';
        }
    });

    // Add count up animation CSS
    const countUpStyle = document.createElement('style');
    countUpStyle.textContent = `
        @keyframes countUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(countUpStyle);
});

console.log('Profile.js initialized');
