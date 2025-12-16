from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout, get_user_model
from django.contrib import messages
from django.db.models import Avg, Min, Max, Q
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from decimal import Decimal, InvalidOperation
import uuid
import logging
from .forms import RegistrationForm, CheckoutForm
from .models import Product, Category, Cart, CartItem, Rating, Order, OrderItem
from .sslcommerz import generate_sslcommerz_payment, validate_sslcommerz_payment

logger = logging.getLogger(__name__)

User = get_user_model()

def home(request):
    return render(request, 'JRShop/home.html')

def user_login(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == "POST":
        email = (request.POST.get('email') or '').strip()
        password = request.POST.get('password')

        if not email or not password:
            messages.error(request, "Please enter both email and password.")
            return render(request, 'JRShop/login.html')

        user_lookup = User.objects.filter(email__iexact=email).order_by('date_joined').first()
        user = None

        if user_lookup:
            user = authenticate(request, username=user_lookup.username, password=password)

        if user is not None:
            auth_login(request, user)
            messages.success(request, f"Welcome back, {user.username}!")
            return redirect('home')
        else:
            messages.error(request, "Invalid username or password!")
    
    return render(request, 'JRShop/login.html')

def register(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == "POST":
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)
            messages.success(request, "Registration Successful! Welcome to JR E-Shop!")
            return redirect('home')
    else:
        form = RegistrationForm()
    
    return render(request, 'JRShop/register.html', {'form': form})

def user_logout(request):
    auth_logout(request)
    messages.success(request, "You have been logged out successfully!")
    return redirect('home')

# product list page
def product_list(request, category_slug = None):
    category = None 
    categories = Category.objects.all()
    products = Product.objects.filter(available=True)
    
    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        print("category .......", category)
        products = products.filter(category = category)
        
    min_price = products.aggregate(Min('price'))['price__min']
    max_price = products.aggregate(Max('price'))['price__max']
    
    if request.GET.get('min_price'):
        products = products.filter(price__gte=request.GET.get('min_price'))
    
    if request.GET.get('max_price'):
        products = products.filter(price__lte=request.GET.get('max_price'))
    
    if request.GET.get('rating'):
        min_rating = request.GET.get('rating')
        products = products.annotate(avg_rating = Avg('ratings__rating')).filter(avg_rating__gte=min_rating)
        
    
    if request.GET.get('search'):
        query = request.GET.get('search')
        products = products.filter(
            Q(name__icontains = query) | 
            Q(description__icontains = query) | 
            Q(category__name__icontains = query)  
        )
    
    # Get cart items count
    cart_items_count = 0
    if request.user.is_authenticated:
        try:
            cart = Cart.objects.get(user=request.user)
            cart_items_count = cart.items.count()
        except Cart.DoesNotExist:
            cart_items_count = 0
    
    return render(request, 'JRShop/product_list.html', {
        'category' : category,
        'categories' : categories,
        'products' : products,
        'min_price' : min_price,
        'max_price' : max_price,
        'cart_items_count': cart_items_count
    })

# product detail page
def product_detail(request, slug):
    product = get_object_or_404(Product, slug = slug, available = True)
    related_products = Product.objects.filter(category = product.category).exclude(id=product.id)[:4]
    
    # Get cart items count and check if product is in cart
    cart_items_count = 0
    is_in_cart = False
    if request.user.is_authenticated:
        try:
            cart = Cart.objects.get(user=request.user)
            cart_items_count = cart.items.count()
            # Check if this product is in the cart
            is_in_cart = CartItem.objects.filter(cart=cart, product=product).exists()
        except Cart.DoesNotExist:
            cart_items_count = 0
            is_in_cart = False
    
    return render(request, 'JRShop/product_detail.html', {
        'product': product,
        'related_products': related_products,
        'cart_items_count': cart_items_count,
        'is_in_cart': is_in_cart
    })

# add to cart
def add_to_cart(request, product_id):
    if not request.user.is_authenticated:
        messages.error(request, "Please login to add items to cart")
        return redirect('login')
    
    product = get_object_or_404(Product, id=product_id)
    
    if not product.available or product.stock <= 0:
        messages.error(request, "This product is not available")
        return redirect('product_detail', slug=product.slug)
    
    cart, created = Cart.objects.get_or_create(user=request.user)
    
    try:
        cart_item = CartItem.objects.get(cart=cart, product=product)
        if cart_item.quantity < product.stock:
            cart_item.quantity += 1
            cart_item.save()
            messages.success(request, f"Updated {product.name} quantity in cart")
        else:
            messages.warning(request, "Cannot add more - limited stock")
    except CartItem.DoesNotExist:
        CartItem.objects.create(cart=cart, product=product, quantity=1)
        messages.success(request, f"{product.name} added to cart!")
    
    return redirect('product_detail', slug=product.slug)

# view cart
def view_cart(request):
    if not request.user.is_authenticated:
        messages.error(request, "Please login to view cart")
        return redirect('login')
    
    try:
        cart = Cart.objects.get(user=request.user)
        cart_items = cart.items.all()
    except Cart.DoesNotExist:
        cart = None
        cart_items = []
    
    # Get cart items count
    cart_items_count = len(cart_items) if cart_items else 0
    
    return render(request, 'JRShop/cart.html', {
        'cart': cart,
        'cart_items': cart_items,
        'cart_items_count': cart_items_count
    })

# remove from cart
def remove_from_cart(request, item_id):
    if not request.user.is_authenticated:
        if request.method == 'POST':
            return JsonResponse({'error': 'Not authenticated', 'success': False}, status=401)
        return redirect('login')
    
    try:
        cart = Cart.objects.get(user=request.user)
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
        cart_item.delete()
        
        # Always return JSON for POST requests (AJAX)
        if request.method == 'POST':
            return JsonResponse({'success': True, 'message': 'Item removed from cart'})
        
        messages.success(request, "Item removed from cart")
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        if request.method == 'POST':
            return JsonResponse({'success': False, 'error': 'Item not found in cart'})
        messages.error(request, "Item not found in cart")
    
    return redirect('view_cart')

# update cart quantity
def update_cart_quantity(request, item_id):
    if not request.user.is_authenticated:
        if request.method == 'POST':
            return JsonResponse({'error': 'Not authenticated', 'success': False}, status=401)
        return redirect('login')
    
    if request.method == 'POST':
        try:
            cart = Cart.objects.get(user=request.user)
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            quantity = int(request.POST.get('quantity', 1))
            
            # If quantity is 0, delete the item
            if quantity == 0:
                cart_item.delete()
                return JsonResponse({'success': True, 'message': 'Item removed from cart'})
            
            if quantity > 0 and quantity <= cart_item.product.stock:
                cart_item.quantity = quantity
                cart_item.save()
                return JsonResponse({'success': True, 'message': 'Cart updated', 'quantity': quantity})
            else:
                return JsonResponse({'success': False, 'error': 'Invalid quantity'})
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return JsonResponse({'success': False, 'error': 'Item not found'})
    
    return redirect('view_cart')


@login_required
def checkout(request):
    try:
        cart = Cart.objects.get(user=request.user)
        if not cart.items.exists():
            messages.warning(request, 'Your cart is empty!')
            return redirect('view_cart')
    except Cart.DoesNotExist:
        messages.warning(request, 'Your cart is empty!')
        return redirect('view_cart')
    
    # Get cart items count for navbar
    cart_items_count = cart.items.count()
    
    if request.method == 'POST':
        form = CheckoutForm(request.POST)
        if form.is_valid():
            # Create order without saving to DB yet
            order = form.save(commit=False)
            order.user = request.user
            order.status = 'pending'
            order.save()
            
            # Create order items from cart items
            for item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    price=item.product.get_final_price(),
                    quantity=item.quantity
                )
            
            # Clear cart
            cart.items.all().delete()
            
            # Store order ID in session for payment processing
            request.session['order_id'] = order.id
            
            messages.success(request, 'Order created successfully! Proceeding to payment...')
            return redirect('payment_process')
        else:
            messages.error(request, 'Please fix the errors below.')
    else:
        form = CheckoutForm()
    
    return render(request, 'JRShop/checkout.html', {
        'cart': cart,
        'form': form,
        'cart_items_count': cart_items_count
    })


@csrf_exempt
@login_required
def payment_process(request):
    """Process payment initiation and redirect to SSL Commerz gateway"""
    order_id = request.session.get('order_id')
    if not order_id:
        logger.warning(f"Payment process accessed without order_id in session by user {request.user.id}")
        messages.error(request, 'No order found.')
        return redirect('home')
    
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        logger.error(f"Order {order_id} not found for user {request.user.id}")
        messages.error(request, 'Order not found.')
        return redirect('home')
    
    # Prevent duplicate payments
    if order.paid:
        logger.info(f"Order {order.id} already paid, redirecting to success page")
        return redirect('payment_success', order_id=order.id)

    # Generate transaction ID if not exists
    if not order.transaction_id:
        order.transaction_id = f"{order.id}-{uuid.uuid4().hex[:12]}"
        order.save(update_fields=['transaction_id'])
        logger.info(f"Generated transaction ID {order.transaction_id} for Order {order.id}")

    gateway_url = None
    error_message = None
    
    try:
        payment_data = generate_sslcommerz_payment(request, order)
        gateway_url = payment_data.get('GatewayPageURL')
        
        if not gateway_url:
            error_message = payment_data.get('failedreason', 'Payment gateway did not return a valid URL')
            logger.error(f"No gateway URL for Order {order.id}: {error_message}")
            
    except Exception as e:
        error_message = str(e)
        logger.exception(f"Exception during payment initiation for Order {order.id}: {error_message}")

    if not gateway_url:
        messages.error(request, 'Payment gateway is unavailable right now. Please try again later.')
        return redirect('payment_fail', order_id=order.id)

    logger.info(f"Payment gateway URL generated for Order {order.id}, redirecting user")
    return render(request, 'JRShop/payment_process.html', {
        'order': order,
        'gateway_url': gateway_url,
    })


@csrf_exempt
@login_required
def payment_success(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        messages.error(request, 'Order not found.')
        return redirect('home')

    if not order.paid:
        messages.warning(request, 'This order is not paid yet.')

    if 'order_id' in request.session and request.session.get('order_id') == order.id:
        del request.session['order_id']

    return render(request, 'JRShop/payment_success.html', {
        'order': order
    })


@csrf_exempt
@login_required
def payment_fail(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        messages.error(request, 'Order not found.')
        return redirect('home')

    messages.error(request, 'Payment failed. Please try again.')
    
    return render(request, 'JRShop/payment_fail.html', {
        'order': order
    })


@csrf_exempt
@login_required
def payment_cancel(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        messages.error(request, 'Order not found.')
        return redirect('home')

    messages.warning(request, 'Payment was cancelled. Your order is still saved.')
    
    return render(request, 'JRShop/payment_cancel.html', {
        'order': order
    })


@login_required
def payment_retry(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        messages.error(request, 'Order not found.')
        return redirect('home')

    if order.paid:
        return redirect('payment_success', order_id=order.id)

    request.session['order_id'] = order.id
    return redirect('payment_process')


@csrf_exempt
@require_http_methods(["POST", "GET"])
def sslcommerz_success(request, order_id):
    """Handle successful payment callback from SSL Commerz"""
    logger.info(f"SSL Commerz success callback received for Order {order_id}")
    order = get_object_or_404(Order, id=order_id)

    tran_id = (request.POST.get('tran_id') or request.GET.get('tran_id') or '').strip()
    val_id = (request.POST.get('val_id') or request.GET.get('val_id') or '').strip()

    logger.info(f"Order {order_id}: tran_id={tran_id}, val_id={val_id}")

    # Validate transaction ID
    if order.transaction_id and tran_id and tran_id != order.transaction_id:
        logger.error(f"Transaction ID mismatch for Order {order_id}: expected {order.transaction_id}, got {tran_id}")
        return HttpResponseBadRequest('Invalid transaction')

    # Prevent duplicate payment processing
    if order.paid:
        logger.info(f"Order {order_id} already marked as paid, redirecting to success")
        return redirect('payment_success', order_id=order.id)

    # Validate payment with SSL Commerz
    if not val_id:
        logger.error(f"No validation ID provided for Order {order_id}")
        order.status = 'pending'
        order.save(update_fields=['status'])
        return redirect('payment_fail', order_id=order.id)

    try:
        validation = validate_sslcommerz_payment(val_id)
    except Exception as e:
        logger.exception(f"Payment validation failed for Order {order_id}: {str(e)}")
        order.status = 'pending'
        order.save(update_fields=['status'])
        return redirect('payment_fail', order_id=order.id)

    # Check validation status
    status = (validation.get('status') or '').upper()
    if status not in ('VALID', 'VALIDATED'):
        logger.warning(f"Invalid payment status for Order {order_id}: {status}")
        order.status = 'pending'
        order.save(update_fields=['status'])
        return redirect('payment_fail', order_id=order.id)

    # Verify payment amount
    try:
        paid_amount = Decimal(str(validation.get('amount', '0')))
    except (InvalidOperation, TypeError) as e:
        logger.error(f"Invalid amount in validation for Order {order_id}: {validation.get('amount')}")
        paid_amount = Decimal('0')

    order_amount = Decimal(str(order.get_total_cost()))
    if paid_amount and paid_amount != order_amount:
        logger.error(f"Amount mismatch for Order {order_id}: expected {order_amount}, got {paid_amount}")
        order.status = 'pending'
        order.save(update_fields=['status'])
        return redirect('payment_fail', order_id=order.id)

    # Mark order as paid and update stock
    order.paid = True
    order.status = 'processing'
    if tran_id:
        order.transaction_id = tran_id
    order.save(update_fields=['paid', 'status', 'transaction_id'])
    logger.info(f"Order {order_id} marked as paid successfully")

    # Update product stock
    for item in order.order_items.all():
        product = item.product
        old_stock = product.stock
        product.stock -= item.quantity
        if product.stock < 0:
            product.stock = 0
        product.save(update_fields=['stock'])
        logger.info(f"Updated stock for Product {product.id}: {old_stock} -> {product.stock}")

    return redirect('payment_success', order_id=order.id)


@csrf_exempt
@require_http_methods(["POST", "GET"])
def sslcommerz_fail(request, order_id):
    """Handle failed payment callback from SSL Commerz"""
    logger.warning(f"SSL Commerz fail callback received for Order {order_id}")
    order = get_object_or_404(Order, id=order_id)

    tran_id = (request.POST.get('tran_id') or request.GET.get('tran_id') or '').strip()
    fail_reason = request.POST.get('error') or request.GET.get('error') or 'Unknown error'
    
    logger.info(f"Order {order_id} payment failed: tran_id={tran_id}, reason={fail_reason}")
    
    if order.transaction_id and tran_id and tran_id != order.transaction_id:
        logger.error(f"Transaction ID mismatch in fail callback for Order {order_id}")
        return HttpResponseBadRequest('Invalid transaction')

    if not order.paid:
        order.status = 'pending'
        order.save(update_fields=['status'])

    return redirect('payment_fail', order_id=order.id)


@csrf_exempt
@require_http_methods(["POST", "GET"])
def sslcommerz_cancel(request, order_id):
    """Handle cancelled payment callback from SSL Commerz"""
    logger.info(f"SSL Commerz cancel callback received for Order {order_id}")
    order = get_object_or_404(Order, id=order_id)

    tran_id = (request.POST.get('tran_id') or request.GET.get('tran_id') or '').strip()
    logger.info(f"Order {order_id} payment cancelled: tran_id={tran_id}")
    
    if order.transaction_id and tran_id and tran_id != order.transaction_id:
        logger.error(f"Transaction ID mismatch in cancel callback for Order {order_id}")
        return HttpResponseBadRequest('Invalid transaction')

    if not order.paid:
        order.status = 'pending'
        order.save(update_fields=['status'])

    return redirect('payment_cancel', order_id=order.id)


@csrf_exempt
@require_http_methods(["POST"])
def sslcommerz_ipn(request):
    """Handle Instant Payment Notification (IPN) from SSL Commerz"""
    tran_id = (request.POST.get('tran_id') or '').strip()
    val_id = (request.POST.get('val_id') or '').strip()

    logger.info(f"IPN received: tran_id={tran_id}, val_id={val_id}")

    if not tran_id or not val_id:
        logger.warning("Invalid IPN: missing tran_id or val_id")
        return HttpResponseBadRequest('Invalid IPN')

    try:
        order = Order.objects.get(transaction_id=tran_id)
    except Order.DoesNotExist:
        logger.warning(f"IPN for non-existent order: tran_id={tran_id}")
        return HttpResponse('OK')

    if order.paid:
        logger.info(f"IPN for already paid Order {order.id}")
        return HttpResponse('OK')

    try:
        validation = validate_sslcommerz_payment(val_id)
    except Exception as e:
        logger.exception(f"IPN validation failed for Order {order.id}: {str(e)}")
        return HttpResponse('OK')

    status = (validation.get('status') or '').upper()
    if status not in ('VALID', 'VALIDATED'):
        logger.warning(f"IPN invalid status for Order {order.id}: {status}")
        return HttpResponse('OK')

    # Mark order as paid
    order.paid = True
    order.status = 'processing'
    order.save(update_fields=['paid', 'status'])
    logger.info(f"IPN: Order {order.id} marked as paid")

    # Update stock
    for item in order.order_items.all():
        product = item.product
        product.stock -= item.quantity
        if product.stock < 0:
            product.stock = 0
        product.save(update_fields=['stock'])

    return HttpResponse('OK')


@login_required
def profile(request):
    # Get all orders for the user
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    
    # Get completed orders
    completed_orders = orders.filter(status='delivered')
    
    # Calculate total spent
    total_spent = sum(order.get_total_cost() for order in orders)
    
    # Get cart items count for navbar
    cart_items_count = 0
    try:
        cart = Cart.objects.get(user=request.user)
        cart_items_count = cart.items.count()
    except Cart.DoesNotExist:
        cart_items_count = 0
    
    # Check which tab is active
    tab = request.GET.get('tab', 'orders')
    
    return render(request, 'JRShop/profile.html', {
        'user': request.user,
        'orders': orders,
        'completed_orders': completed_orders,
        'total_spent': total_spent,
        'order_history_active': (tab == 'orders'),
        'cart_items_count': cart_items_count
    })



