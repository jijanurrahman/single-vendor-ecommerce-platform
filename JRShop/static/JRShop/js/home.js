// Animate numbers on scroll
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const hasPlus = text.includes('+');
                const hasStar = text.includes('★');
                const number = parseFloat(text.replace(/[^0-9.]/g, ''));
                
                if (!isNaN(number)) {
                    let current = 0;
                    const increment = number / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= number) {
                            current = number;
                            clearInterval(timer);
                        }
                        if (hasStar) {
                            stat.textContent = current.toFixed(1) + '★';
                        } else {
                            stat.textContent = Math.floor(current) + (hasPlus ? '+' : '');
                        }
                    }, 30);
                }
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    observer.observe(statsSection);
}

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-section');
    if (hero) {
        const scrolled = window.pageYOffset;
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add hover effect to feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.querySelector('.feature-icon').style.animation = 'none';
        setTimeout(() => {
            this.querySelector('.feature-icon').style.animation = 'bounce 0.6s ease-in-out';
        }, 10);
    });
});
