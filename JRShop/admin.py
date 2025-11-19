from django.contrib import admin
from .models import Category, Product, Rating, Cart, CartItem, Order, OrderItem

# Category Admin
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

# Product Admin
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'get_price_display', 'stock', 'available', 'created_at')
    list_filter = ('category', 'available', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at', 'get_discount_info')
    fieldsets = (
        ('Product Information', {
            'fields': ('name', 'slug', 'category', 'description')
        }),
        ('Pricing & Discount', {
            'fields': ('price', 'discount_price', 'get_discount_info')
        }),
        ('Stock & Availability', {
            'fields': ('stock', 'available')
        }),
        ('Media', {
            'fields': ('image',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_price_display(self, obj):
        if obj.has_discount():
            return f"৳{obj.discount_price} (was ৳{obj.price})"
        return f"৳{obj.price}"
    get_price_display.short_description = 'Price'
    
    def get_discount_info(self, obj):
        if obj.has_discount():
            discount_pct = obj.get_discount_percentage()
            savings = obj.price - obj.discount_price
            return f"Discount: {discount_pct}% | Save: ৳{savings}"
        return "No discount"
    get_discount_info.short_description = 'Discount Information'

# Rating Admin
@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'rating', 'created_at')
    list_filter = ('rating', 'created_at', 'product')
    search_fields = ('user__username', 'product__name')
    readonly_fields = ('created_at',)

# Cart Admin
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username',)
    readonly_fields = ('created_at', 'updated_at')

# CartItem Admin (Inline)
class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 1
    fields = ('product', 'quantity')

# Update Cart Admin to include CartItems
CartAdmin.inlines = [CartItemInline]

# CartItem Admin
@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity', 'get_cost')
    list_filter = ('cart__user',)
    search_fields = ('product__name', 'cart__user__username')
    
    def get_cost(self, obj):
        return f"৳{obj.get_cost()}"
    get_cost.short_description = 'Total Cost'

# Order Admin
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'created_at', 'get_total')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'email', 'transaction_id')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Order Information', {
            'fields': ('user', 'status', 'transaction_id')
        }),
        ('Customer Details', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Shipping Address', {
            'fields': ('address', 'city', 'postal_code')
        }),
        ('Additional Info', {
            'fields': ('note',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_total(self, obj):
        return f"৳{obj.get_total_cost()}"
    get_total.short_description = 'Total Amount'

# OrderItem Admin (Inline)
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    fields = ('product', 'quantity', 'price')

# Update Order Admin to include OrderItems
OrderAdmin.inlines = [OrderItemInline]

# OrderItem Admin
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price', 'get_cost')
    list_filter = ('order__created_at',)
    search_fields = ('product__name', 'order__id')
    
    def get_cost(self, obj):
        return f"৳{obj.get_cost()}"
    get_cost.short_description = 'Total Cost'
