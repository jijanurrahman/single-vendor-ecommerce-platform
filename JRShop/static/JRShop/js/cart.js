// Shopping Cart Page - Real-Time Updates with AJAX

console.log('Cart.js loaded');

// Get CSRF token from cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');
console.log('CSRF Token:', csrftoken ? 'Found' : 'Not found');

// Animate cart items on load
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideInLeft 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.cart-item').forEach((item, index) => {
    item.style.animationDelay = (index * 0.1) + 's';
    observer.observe(item);
});

// Add animations
const style = document.createElement('style');
style.textContent = `
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
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
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
`;
document.head.appendChild(style);

// Quantity input interactions
document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('focus', function() {
        this.style.borderColor = 'var(--primary-color)';
        this.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
    });
    
    input.addEventListener('blur', function() {
        this.style.borderColor = '#e5e7eb';
        this.style.boxShadow = 'none';
    });
    
    input.addEventListener('change', function() {
        // Add visual feedback
        this.style.background = '#f0f4ff';
        setTimeout(() => {
            this.style.background = 'white';
        }, 300);
    });
});

// Update quantity button animation
document.querySelectorAll('.quantity-update-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
    });
    
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Remove button interactions
document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    
    btn.addEventListener('click', function(e) {
        const cartItem = this.closest('.cart-item');
        if (cartItem) {
            cartItem.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => {
                // Let the form submit naturally
            }, 300);
        }
    });
});

// Add slide out animation
const slideOutStyle = document.createElement('style');
slideOutStyle.textContent = `
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(slideOutStyle);

// Checkout button animation
const checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    checkoutBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
    
    checkoutBtn.addEventListener('click', function() {
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = 'translateY(0)';
        }, 100);
    });
}

// Continue shopping button animation
const continueBtn = document.querySelector('.continue-shopping-btn');
if (continueBtn) {
    continueBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    continueBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
}

// Promo code input
const promoInput = document.querySelector('.promo-input');
const promoBtn = document.querySelector('.promo-btn');

if (promoInput) {
    promoInput.addEventListener('focus', function() {
        this.style.borderColor = 'var(--primary-color)';
        this.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
    });
    
    promoInput.addEventListener('blur', function() {
        this.style.borderColor = '#e5e7eb';
        this.style.boxShadow = 'none';
    });
}

if (promoBtn) {
    promoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (promoInput.value.trim()) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
            
            // Visual feedback
            const originalText = this.textContent;
            this.textContent = '✓ Applied!';
            this.style.background = '#10b981';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = 'var(--primary-color)';
            }, 2000);
        }
    });
    
    promoBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    promoBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
}

// Cart item hover effects
document.querySelectorAll('.cart-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.background = '#f9fafb';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.background = 'white';
    });
});

// Product link interactions
document.querySelectorAll('.item-name').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.color = 'var(--primary-color)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.color = 'var(--text-dark)';
    });
});

// Empty cart animation
const emptyCart = document.querySelector('.empty-cart');
if (emptyCart) {
    emptyCart.style.animation = 'fadeIn 0.6s ease-out';
}

// Start shopping button animation
const startShoppingBtn = document.querySelector('.start-shopping-btn');
if (startShoppingBtn) {
    startShoppingBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    startShoppingBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
}

// Calculate tax and total
function calculateTotals() {
    const subtotalText = document.querySelector('.summary-value');
    if (!subtotalText) return;
    
    const subtotalStr = subtotalText.textContent.replace('৳', '').trim();
    const subtotal = parseFloat(subtotalStr) || 0;
    
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

// Page load animation
window.addEventListener('load', function() {
    const cartContainer = document.querySelector('.cart-container');
    if (cartContainer) {
        cartContainer.style.animation = 'fadeIn 0.6s ease-out';
    }
    
    // Calculate totals on load
    calculateTotals();
});

// Real-time cart update functions
function updateCartTotals() {
    let subtotal = 0;
    
    // Calculate subtotal from all items
    document.querySelectorAll('.cart-item').forEach(item => {
        const totalValue = item.querySelector('.item-total-value');
        if (totalValue) {
            const value = parseFloat(totalValue.textContent.replace('৳', '').trim()) || 0;
            subtotal += value;
        }
    });
    
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    // Update summary
    const subtotalElement = document.getElementById('subtotal-amount');
    const taxElement = document.getElementById('tax-amount');
    const totalElement = document.getElementById('total-amount');
    
    if (subtotalElement) {
        subtotalElement.textContent = '৳' + subtotal.toFixed(2);
    }
    if (taxElement) {
        taxElement.textContent = '৳' + tax.toFixed(2);
    }
    if (totalElement) {
        totalElement.textContent = '৳' + total.toFixed(2);
    }
}

function removeCartItem(itemId) {
    const cartItem = document.querySelector(`[data-item-id="${itemId}"]`);
    if (cartItem) {
        cartItem.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => {
            cartItem.remove();
            
            // Check if cart is empty
            const cartList = document.getElementById('cart-items-list');
            if (cartList && cartList.children.length === 0) {
                location.reload();
            } else {
                updateCartTotals();
            }
        }, 300);
    }
}

function updateQuantityAJAX(itemId, quantity) {
    const formData = new FormData();
    formData.append('quantity', quantity);
    
    fetch(`/update-cart-quantity/${itemId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Update response:', data);
        if (data.success) {
            const cartItem = document.querySelector(`[data-item-id="${itemId}"]`);
            if (cartItem) {
                const price = parseFloat(cartItem.dataset.productPrice);
                const newTotal = price * quantity;
                const totalValue = cartItem.querySelector('.item-total-value');
                if (totalValue) {
                    totalValue.textContent = newTotal.toFixed(2);
                }
            }
            updateCartTotals();
        } else {
            console.error('Update failed:', data.error);
            alert('Error updating cart: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error updating cart:', error);
        alert('Error updating cart. Please try again.');
    });
}

function removeItemAJAX(itemId) {
    const formData = new FormData();
    
    fetch(`/remove-from-cart/${itemId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Remove response:', data);
        if (data.success) {
            removeCartItem(itemId);
        } else {
            console.error('Remove failed:', data.error);
            alert('Error removing item: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error removing item:', error);
        alert('Error removing item. Please try again.');
    });
}

// Initialize event listeners
function initializeCartEventListeners() {
    console.log('Initializing cart event listeners...');
    
    // Quantity input change handler with real-time updates
    const quantityInputs = document.querySelectorAll('.quantity-input');
    console.log('Found quantity inputs:', quantityInputs.length);
    
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const itemId = this.dataset.itemId;
            const quantity = parseInt(this.value) || 0;
            const cartItem = this.closest('.cart-item');
            const maxStock = parseInt(cartItem.dataset.productStock);
            
            console.log(`Quantity changed - Item ID: ${itemId}, New Quantity: ${quantity}, Max Stock: ${maxStock}`);
        
        // If quantity is 0, remove the item
        if (quantity === 0) {
            if (confirm('Remove this item from cart?')) {
                removeItemAJAX(itemId);
            } else {
                // Reset to previous value
                this.value = this.dataset.previousValue || 1;
            }
            return;
        }
        
        // Validate quantity
        if (quantity > maxStock) {
            alert(`Maximum available quantity is ${maxStock}`);
            this.value = maxStock;
            return;
        }
        
        if (quantity < 0) {
            this.value = 1;
            return;
        }
        
        // Store previous value
        this.dataset.previousValue = quantity;
        
        // Add visual feedback
        cartItem.style.opacity = '0.7';
        this.style.background = '#f0f4ff';
        
        // Update via AJAX
        updateQuantityAJAX(itemId, quantity);
        
        setTimeout(() => {
            cartItem.style.opacity = '1';
            this.style.background = 'white';
        }, 300);
        });
    });
    
    // Remove button click handler
    const removeButtons = document.querySelectorAll('.remove-btn');
    console.log('Found remove buttons:', removeButtons.length);
    
    removeButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const itemId = this.dataset.itemId;
            console.log('Remove button clicked for item:', itemId);
            if (confirm('Remove this item from cart?')) {
                removeItemAJAX(itemId);
            }
        });
        
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing cart...');
    initializeCartEventListeners();
    calculateTotals();
});
