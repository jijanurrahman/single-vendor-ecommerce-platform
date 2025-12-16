// Payment Processing Page JavaScript

console.log('Payment.js loaded');

// Animate progress steps
const steps = document.querySelectorAll('.step');
steps.forEach((step, index) => {
    step.style.animationDelay = (index * 0.1) + 's';
});

// Payment processing with improved error handling
document.addEventListener('DOMContentLoaded', function () {
    console.log('Payment processing started...');

    // Add pulse animation to security items
    const securityItems = document.querySelectorAll('.security-item');
    securityItems.forEach((item, index) => {
        item.style.animation = `fadeIn 0.6s ease-out ${index * 0.15}s both`;
    });

    const gatewayUrl = window.SSLCOMMERZ_GATEWAY_URL;
    
    if (!gatewayUrl || gatewayUrl === 'None' || gatewayUrl === '') {
        console.error('No valid gateway URL provided by backend.');
        showError('Payment gateway is currently unavailable. Please try again later.');
        return;
    }

    console.log('Gateway URL:', gatewayUrl);

    // Show countdown before redirect
    let countdown = 3;
    const processingText = document.querySelector('.processing-text');
    
    const countdownInterval = setInterval(() => {
        if (countdown > 0) {
            processingText.textContent = `Redirecting to payment gateway in ${countdown}...`;
            countdown--;
        } else {
            clearInterval(countdownInterval);
            processingText.textContent = 'Redirecting to payment gateway...';
            
            // Redirect to payment gateway
            console.log('Redirecting to payment gateway...');
            window.location.href = gatewayUrl;
        }
    }, 1000);

    // Timeout fallback - if redirect doesn't happen in 10 seconds
    setTimeout(() => {
        if (window.location.href.indexOf(gatewayUrl) === -1) {
            console.warn('Redirect timeout - showing manual redirect option');
            clearInterval(countdownInterval);
            showManualRedirect(gatewayUrl);
        }
    }, 10000);
});

// Show error message
function showError(message) {
    const processingDiv = document.querySelector('.payment-processing');
    if (processingDiv) {
        processingDiv.innerHTML = `
            <div class="error-icon" style="font-size: 48px; color: #ef4444; margin-bottom: 16px;">⚠️</div>
            <p class="processing-text" style="color: #ef4444;">${message}</p>
            <a href="javascript:history.back()" class="btn btn-primary" style="margin-top: 20px; display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px;">Go Back</a>
        `;
    }
}

// Show manual redirect option
function showManualRedirect(url) {
    const processingDiv = document.querySelector('.payment-processing');
    if (processingDiv) {
        processingDiv.innerHTML = `
            <p class="processing-text">Automatic redirect failed</p>
            <p class="processing-subtext" style="margin-bottom: 20px;">Please click the button below to proceed to payment</p>
            <a href="${url}" class="btn btn-primary" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px;">Proceed to Payment</a>
        `;
    }
}

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
    
    .btn {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
`;
document.head.appendChild(style);

console.log('Payment.js initialized');
