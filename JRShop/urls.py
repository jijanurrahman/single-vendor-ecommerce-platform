from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.user_login, name='login'),
    path('register/', views.register, name='register'),
    path('logout/', views.user_logout, name='user_logout'),
    
    # Product URLs
    path('products/', views.product_list, name='product_list'),
    path('products/category/<slug:category_slug>/', views.product_list, name='product_list_by_category'),
    path('product/<slug:slug>/', views.product_detail, name='product_detail'),
    
    # Cart URLs
    path('cart/', views.view_cart, name='view_cart'),
    path('cart/add/<int:product_id>/', views.add_to_cart, name='add_to_cart'),
    path('cart/remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('cart/update/<int:item_id>/', views.update_cart_quantity, name='update_cart_quantity'),
    
    # AJAX Cart URLs
    path('remove-from-cart/<int:item_id>/', views.remove_from_cart, name='remove_from_cart_ajax'),
    path('update-cart-quantity/<int:item_id>/', views.update_cart_quantity, name='update_cart_quantity_ajax'),
    
    # Checkout URLs
    path('checkout/', views.checkout, name='checkout'),
    
    # Payment URLs
    path('payment/process/', views.payment_process, name='payment_process'),
    path('payment/success/<int:order_id>/', views.payment_success, name='payment_success'),
    path('payment/fail/<int:order_id>/', views.payment_fail, name='payment_fail'),
    path('payment/cancel/<int:order_id>/', views.payment_cancel, name='payment_cancel'),
    
    # Profile URLs
    path('profile/', views.profile, name='profile'),
]
