from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout, get_user_model
from django.contrib import messages
from django.db.models import Avg, Min, Max, Q
from django.http import JsonResponse
from .forms import RegistrationForm
from .models import Product, Category, Cart, CartItem, Rating

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
