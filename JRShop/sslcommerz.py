import requests
import json
import logging
import re
from django.conf import settings
from django.urls import reverse
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)

def validate_phone_number(phone):
    """Validate Bangladesh phone number format"""
    # Remove any spaces or dashes
    phone = re.sub(r'[\s\-]', '', str(phone))
    # Check if it's a valid BD phone number (11 digits starting with 01)
    if re.match(r'^01[3-9]\d{8}$', phone):
        return phone
    # If not valid, return a default or raise error
    logger.warning(f"Invalid phone number format: {phone}")
    return phone  # Return as-is, let SSL Commerz handle validation

def generate_sslcommerz_payment(request, order):
    """
    Generate SSL Commerz payment request
    
    Args:
        request: Django request object
        order: Order instance
        
    Returns:
        dict: SSL Commerz API response
        
    Raises:
        requests.RequestException: If API request fails
        ValueError: If response is invalid
    """
    tran_id = order.transaction_id or str(order.id)
    
    # Validate phone number
    phone = validate_phone_number(order.phone)
    
    post_data = {
        'store_id': settings.SSLCOMMERZ_STORE_ID,
        'store_passwd': settings.SSLCOMMERZ_STORE_PASSWORD,
        'total_amount': float(order.get_total_cost()),
        'currency': 'BDT',
        'tran_id': tran_id,
        'success_url': request.build_absolute_uri(reverse('sslcommerz_success', args=[order.id])),
        'fail_url': request.build_absolute_uri(reverse('sslcommerz_fail', args=[order.id])),
        'cancel_url': request.build_absolute_uri(reverse('sslcommerz_cancel', args=[order.id])),
        'ipn_url': request.build_absolute_uri(reverse('sslcommerz_ipn')),
        'cus_name': f"{order.first_name} {order.last_name}",
        'cus_email': order.email,
        'cus_add1': order.address,
        'cus_city': order.city,
        'cus_postcode': order.postal_code,
        'cus_country': 'Bangladesh',
        'cus_phone': phone,
        'shipping_method': 'NO',
        'product_name': 'Products from our store',
        'product_category': 'General',
        'product_profile': 'general',
    }
    
    logger.info(f"Initiating SSL Commerz payment for Order #{order.id}, Transaction ID: {tran_id}")
    
    try:
        # Get timeout from settings or use default
        timeout = getattr(settings, 'SSLCOMMERZ_TIMEOUT', 30)
        
        response = requests.post(
            settings.SSLCOMMERZ_PAYMENT_URL, 
            data=post_data,
            timeout=timeout
        )
        response.raise_for_status()
        
        response_data = response.json()
        
        # Validate response
        if not isinstance(response_data, dict):
            logger.error(f"Invalid response format from SSL Commerz: {response.text}")
            raise ValueError("Invalid response format from payment gateway")
        
        # Check if request was successful
        status = response_data.get('status')
        if status == 'SUCCESS':
            logger.info(f"SSL Commerz payment initiated successfully for Order #{order.id}")
        else:
            logger.warning(f"SSL Commerz payment initiation failed for Order #{order.id}: {response_data.get('failedreason', 'Unknown reason')}")
        
        return response_data
        
    except requests.Timeout:
        logger.error(f"SSL Commerz payment request timeout for Order #{order.id}")
        raise
    except requests.RequestException as e:
        logger.error(f"SSL Commerz payment request failed for Order #{order.id}: {str(e)}")
        raise
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse SSL Commerz response for Order #{order.id}: {str(e)}")
        raise ValueError("Invalid response from payment gateway")
    
def send_order_confirmation_email(order):
    subject = f'Order Confirmation - Order #{order.id}'
    message = render_to_string('shop/email/order_confirmation.html', {'order' : order}) # html code ke --> string e convert kore
    to = order.email
    send_email = EmailMultiAlternatives(subject, '', to=[to])
    send_email.attach_alternative(message, 'text/html')
    send_email.send()


def validate_sslcommerz_payment(val_id):
    """
    Validate SSL Commerz payment using validation ID
    
    Args:
        val_id: Validation ID from SSL Commerz
        
    Returns:
        dict: Validation response data
        
    Raises:
        requests.RequestException: If validation request fails
        ValueError: If response is invalid
    """
    logger.info(f"Validating SSL Commerz payment with val_id: {val_id}")
    
    params = {
        'val_id': val_id,
        'store_id': settings.SSLCOMMERZ_STORE_ID,
        'store_passwd': settings.SSLCOMMERZ_STORE_PASSWORD,
        'v': 1,
        'format': 'json',
    }
    
    try:
        timeout = getattr(settings, 'SSLCOMMERZ_TIMEOUT', 30)
        
        response = requests.get(
            settings.SSLCOMMERZ_VALIDATION_URL, 
            params=params, 
            timeout=timeout
        )
        response.raise_for_status()
        
        validation_data = response.json()
        
        # Log validation result
        status = validation_data.get('status', 'UNKNOWN')
        logger.info(f"SSL Commerz validation result for val_id {val_id}: {status}")
        
        return validation_data
        
    except requests.Timeout:
        logger.error(f"SSL Commerz validation timeout for val_id: {val_id}")
        raise
    except requests.RequestException as e:
        logger.error(f"SSL Commerz validation request failed for val_id {val_id}: {str(e)}")
        raise
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse SSL Commerz validation response for val_id {val_id}: {str(e)}")
        raise ValueError("Invalid validation response from payment gateway")
    
    