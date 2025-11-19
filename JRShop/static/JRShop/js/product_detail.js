// Product Detail Page Animations and Interactions

// Image zoom effect
const productImage = document.querySelector('.product-image-large');
if (productImage) {
    productImage.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        this.style.transformOrigin = xPercent + '% ' + yPercent + '%';
    });
    
    productImage.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.2)';
    });
    
    productImage.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

// Add to cart button animation
const addToCartBtn = document.querySelector('.add-to-cart-btn-large');
if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function(e) {
        if (this.classList.contains('disabled')) return;
        
        // Create ripple effect
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
        
        // Button feedback
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = 'translateY(0)';
        }, 100);
    });
}

// View cart button animation
const viewCartBtn = document.querySelector('.view-cart-btn');
if (viewCartBtn) {
    viewCartBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
    });
    
    viewCartBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
}

// Related products hover effect
document.querySelectorAll('.related-product-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Animate related products on scroll
const relatedObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const relatedObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            relatedObserver.unobserve(entry.target);
        }
    });
}, relatedObserverOptions);

document.querySelectorAll('.related-product-card').forEach((card, index) => {
    card.style.animationDelay = (index * 0.1) + 's';
    relatedObserver.observe(card);
});

// Add ripple keyframe
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
    
    @keyframes fadeInUp {
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

// Breadcrumb navigation
document.querySelectorAll('.breadcrumb a').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.color = 'var(--secondary-color)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.color = 'var(--primary-color)';
    });
});

// Meta links animation
document.querySelectorAll('.meta-value.link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(5px)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});

// Smooth scroll to related products
const relatedSection = document.querySelector('.related-products-section');
if (relatedSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.6s ease-out';
            }
        });
    });
    observer.observe(relatedSection);
}

// Page load animation
window.addEventListener('load', function() {
    document.querySelector('.product-detail-container').style.animation = 'fadeIn 0.6s ease-out';
});
